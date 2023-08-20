import {
    Client,
    Collection,
    CommandInteraction,
    Guild,
    IntentsBitField,
    SlashCommandBuilder,
} from 'discord.js'
import { readdirSync } from 'node:fs'
import { Logger } from 'winston'

import { PogDB } from './database.js'
import { Translation } from './translation.js'
import { getLogger } from './logger.js'

/***
 * Structure of an command module.
 * @typedef {Object} Command
 * @property {string} name
 * @property {boolean?} guildOnly
 * @property {SlashCommandBuilder} data
 * @property {(i: CommandInteraction) => Promise<void>} execute
 */

/***
 * Structure of an in-memory active pog listener.
 * @typedef {Object} PogListener
 * @property {string} id
 * @property {number} timestamp
 */

export class Pogbot extends Client {
    /** @type {Pogbot} */
    static #instance

    /** @type {Logger} */
    logger

    /** @type {Translation} */
    localization

    /** @type {PogbotDatabase} */
    #database

    /** @type {Collection<string, Command>} */
    #commands

    /** @type {Collection<string, PogListener>} */
    #activePogs

    constructor(token) {
        super({
            intents: [IntentsBitField.Flags.GuildMessages],
        })

        Pogbot.setInstance(this)

        this.logger = getLogger()
        this.localization = new Translation()
        this.#database = new PogDB(this)

        this.#setupListeners()

        this.login(token)
    }

    #setupCommands() {
        this.#commands = new Collection()

        this.logger.debug('Reading commands directory.')

        const commands = readdirSync('./src/commands').filter((cmd) =>
            cmd.endsWith('.js')
        )
        commands.forEach(async (cmd, i) => {
            const { default: command } = await import(`./commands/${cmd}`)

            if (command === undefined) {
                this.logger.error(
                    `Could not register command ${cmd} as it is missing an default export.`
                )
                return
            }

            /** @type {Command} */
            const { name, guildOnly, data: builder, execute } = command()

            // Configure values from the command object.
            builder.setName(name).setDMPermission(!guildOnly)

            this.application.commands.create(builder.toJSON())
            this.#commands.set(name, execute)
            this.logger.silly(
                `Registered application command "${name}". [entry ${
                    i + 1
                } out of ${commands.length}]`
            )
        })
    }

    #setupListeners() {
        this.once('ready', this.#ready)
        this.on('interactionCreate', this.#interaction)
        this.on('messageCreate', this.#message)
        this.on('guildCreate', this.#guildJoin)
        this.logger.debug('Registered listeners.')
    }

    #ready() {
        this.#setupCommands()
        this.logger.info(`Logged in as ${this.user.username} [${this.user.id}]`)
    }

    /**
     * @param {import("discord.js").Interaction} i
     */
    async #interaction(i) {
        if (i.isCommand()) {
            if (this.#commands.has(i.commandName)) {
                try {
                    const command = this.#commands.get(i.commandName)
                    await command(i)
                } catch (e) {
                    this.logger.error(
                        `Something went wrong executing command ${i.commandName}\n${e.stack}`
                    )
                    await i.reply(
                        `Whoops! Could not run this command due to an error: \`${e}\``
                    )
                }
            } else {
                this.logger.error(
                    `Received an interaction for command ${i.commandName}, but it isn't registered, did you forget to delete it?`
                )
            }
        }
    }

    /** @param {Guild} g */
    #guildJoin(g) {}

    #message() {}

    static getInstance() {
        return Pogbot.#instance
    }

    static setInstance(bot) {
        Pogbot.#instance = bot
    }
}
