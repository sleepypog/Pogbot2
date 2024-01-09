import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import i18next from 'i18next';

import { PogDB } from '../database.js';
import {
    formatJSON,
    getDescription,
    getDescriptionLocalizations,
} from '../utils/index.js';

/** @type {import('../client.js').Command} */
export default function About() {
    return {
        name: 'debug',
        guildOnly: true,
        debugOnly: true,
        data: new SlashCommandBuilder()
            .addSubcommandGroup(
                new SlashCommandSubcommandGroupBuilder()
                    .setName('dump')
                    .setDescription(getDescription('debug.dump.description'))
                    .setDescriptionLocalizations(
                        getDescriptionLocalizations('debug.dump.description')
                    )
                    .addSubcommand(
                        new SlashCommandSubcommandBuilder()
                            .setName('me')
                            .setDescription(
                                getDescription('debug.dump.subcommands.me')
                            )
                            .setDescriptionLocalizations(
                                getDescriptionLocalizations(
                                    'debug.dump.subcommands.me'
                                )
                            )
                    )
                    .addSubcommand(
                        new SlashCommandSubcommandBuilder()
                            .setName('guild')
                            .setDescription(
                                getDescription('debug.dump.subcommands.guild')
                            )
                            .setDescriptionLocalizations(
                                getDescriptionLocalizations(
                                    'debug.dump.subcommands.guild'
                                )
                            )
                    )
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('forceerror')
                    .setDescription(
                        getDescription('debug.subcommands.forceerror')
                    )
                    .setDescriptionLocalizations(
                        getDescriptionLocalizations(
                            'debug.subcommands.forceerror'
                        )
                    )
            ),
        /** @param {CommandInteraction} i  */
        async execute(i) {
            switch (i.options.getSubcommandGroup()) {
                case 'dump': {
                    switch (i.options.getSubcommand()) {
                        case 'me': {
                            const user = await PogDB.getInstance().getMember(
                                i.member
                            );
                            await i.reply(formatJSON(user.toJSON()));
                            break;
                        }
                        case 'guild': {
                            const guild = await PogDB.getInstance().getGuild(
                                i.guild
                            );
                            await i.reply(formatJSON(guild.toJSON()));
                            break;
                        }
                    }
                    break;
                }
                case null: {
                    switch (i.options.getSubcommand()) {
                        case 'forceerror': {
                            throw new Error(
                                "Whoops! Who would've thought this was going to happen!"
                            );
                        }
                    }
                }
            }
        },
    };
}
