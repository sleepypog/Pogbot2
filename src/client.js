import {
    Client,
    Collection,
    CommandInteraction,
    Guild,
    IntentsBitField,
    Message,
    PermissionsBitField,
    SlashCommandBuilder,
} from 'discord.js';
import { readdirSync } from 'node:fs';
import { Logger } from 'winston';

import { PogDB } from './database.js';
import { PogAnalytics } from './utils/analytics.js';
import { getLogger } from './utils/logger.js';
import { Translation } from './utils/translation.js';

export class Pogbot extends Client {
    /** @type {Pogbot} */
    static #instance;

    /** @type {Logger} */
    logger;

    /** @type {Translation} */
    localization;

    /** @type {Collection<string, import('./types.js').Command>} */
    #commands;

    /** @type {Collection<string, string>} */
    #waitingFollowUps;

    /** @type {Collection<string, import('./types.js').PogListener>} */
    #activePogs;

    /** @type {Environment} */
    #env;

    /** @type {PogAnalytics} */
    analytics;

    constructor(token) {
        super({
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent,
            ],
        });

        Pogbot.setInstance(this);

        this.logger = getLogger();
        this.localization = new Translation();
        this.analytics = new PogAnalytics();

        new PogDB(this);

        this.#waitingFollowUps = new Collection();
        this.#activePogs = new Collection();

        this.#setupListeners();

        this.login(token);
    }

    #setupCommands() {
        // Clear existing commands.
        this.application.commands.set([]);

        this.#commands = new Collection();

        this.logger.debug('Reading commands directory.');

        const commands = readdirSync('./src/commands').filter((cmd) =>
            cmd.endsWith('.js')
        );
        commands.forEach(async (cmd, i) => {
            const { default: command } = await import(`./commands/${cmd}`);

            if (command === undefined) {
                this.logger.error(
                    `Could not register command ${cmd} as it is missing an default export.`
                );
                return;
            }

            /** @type {import('./types.js').Command} */
            const { name, guildOnly, data: builder } = command();

            // Configure values from the command object.
            builder.setName(name).setDMPermission(!guildOnly);

            try {
                this.application.commands.create(builder.toJSON());
                this.#commands.set(name, command());
                this.logger.silly(
                    `Registered application command "${name}". [entry ${
                        i + 1
                    } out of ${commands.length}]`
                );
            } catch (e) {
                this.logger.error(
                    `Could not register command ${name} as it has invalid data: ${e.message}`
                );
            }
        });
    }

    // TODO: Move events to individual files.
    #setupListeners() {
        this.once('ready', this.#ready);
        this.on('interactionCreate', this.#interaction);
        this.on('messageCreate', this.#message);
        this.on('guildCreate', this.#guildJoin);
        this.on('guildDelete', this.#guildRemove);

        this.logger.debug('Registered listeners.');
    }

    #ready() {
        this.#setupCommands();
        this.logger.info(
            `Logged in as ${this.user.username} [${this.user.id}]`
        );
        this.analytics.setGuilds(this.guilds.cache.size);
    }

    /**
     * @param {import("discord.js").ChannelSelectMenuInteraction} i
     */
    async #interaction(i) {
        if (i.isCommand()) {
            if (this.#commands.has(i.commandName)) {
                try {
                    const command = this.#commands.get(i.commandName);
                    await command.execute(i);
                } catch (e) {
                    this.logger.error(
                        `Something went wrong executing command ${i.commandName}\n${e.stack}`
                    );
                    if (i.replied) {
                        await i.editReply(
                            Translation.t(
                                i.locale,
                                'commandError',
                                e.toString()
                            )
                        );
                    } else {
                        await i.reply(
                            Translation.t(
                                i.locale,
                                'commandError',
                                e.toString()
                            )
                        );
                    }
                }
            } else {
                this.logger.error(
                    `Received an interaction for command ${i.commandName}, but it isn't registered, did you forget to delete it?`
                );
            }
        } else {
            const followUp = this.#waitingFollowUps.get(
                `${i.channelId}-${i.user.id}`
            );
            if (followUp !== undefined) {
                try {
                    this.#commands.get(followUp).followUp(i);
                } catch (e) {
                    this.logger.error(
                        `Something went wrong executing command follow up ${i.commandName}\n${e.stack}`
                    );
                    if (i.replied) {
                        await i.editReply(
                            Translation.t(
                                i.locale,
                                'commandError',
                                e.toString()
                            )
                        );
                    } else {
                        await i.reply(
                            Translation.t(
                                i.locale,
                                'commandError',
                                e.toString()
                            )
                        );
                    }
                }

                this.#waitingFollowUps.delete(`${i.channelId}-${i.user.id}`);
            }
        }

        this.analytics.reportAPIPing(this.ws.ping);
    }

    /** @param {Guild} g */
    #guildJoin(g) {
        PogDB.getInstance().getGuild(g); // create the guild in the db
        this.analytics.addGuild();
        this.logger.debug(`Joined guild ${g.id}.`);
    }

    /** @param {Guild} g */
    #guildRemove(g) {
        this.analytics.removeGuild();
        this.logger.debug(`Kicked from guild ${g.id}`);
    }

    /** @param {Message} m */
    async #message(m) {
        if (!m.inGuild() || m.author.bot) return;

        const listener = this.#activePogs.get(m.channelId);
        if (listener !== undefined) {
            //if (m.author.id === listener.initiator) return;

            if (m.content.toLowerCase().includes('pog')) {
                (await PogDB.getInstance().getMember(m.member)).increment(
                    'score'
                );

                m.reply(
                    Translation.t(
                        m.guild.preferredLocale,
                        'congratulations',
                        Translation.d(performance.now() - listener.timestamp)
                    )
                );

                this.#activePogs.delete(m.channelId);
            }
        } else {
            if (
                m.member
                    .permissionsIn(m.channel)
                    .has(PermissionsBitField.Flags.ManageMessages)
            ) {
                /** @type {string[]} */
                const triggers = (await PogDB.getInstance().getGuild(m.guild))
                    .triggers;
                triggers.forEach(async (trigger) => {
                    if (m.content.includes(trigger)) {
                        this.#activePogs.set(m.channelId, {
                            initiator: m.author.id,
                            timestamp: performance.now(),
                        });
                        await m.react('👀');
                        return;
                    }
                });
            }
        }

        this.analytics.reportAPIPing(this.ws.ping);
    }

    /**
     * Add an follow up, this is used to identify whenever interactions belong to an same execution.
     * @param {string} channel
     * @param {string} member
     * @param {string} command
     * @returns {boolean} Depending on whenever the follow up could be added or not.
     */
    addFollowUp(channel, member, command) {
        if (this.#waitingFollowUps.has(`${channel}-${member}`)) {
            return false;
        }

        this.#waitingFollowUps.set(`${channel}-${member}`, command);
        return true;
    }

    setEnvironment(env) {
        this.#env = env;
    }

    getEnvironment() {
        return this.#env;
    }

    static getInstance() {
        return Pogbot.#instance;
    }

    static setInstance(bot) {
        Pogbot.#instance = bot;
    }
}
