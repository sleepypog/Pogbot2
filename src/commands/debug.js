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

import { Pogbot } from '../client.js';
import { PogDB } from '../database.js';
import { formatJSON } from '../utils/debug.js';
import { Translation } from '../utils/translation.js';

/** @type {import('../client.js').Command} */
export default function About() {
    return {
        name: 'debug',
        guildOnly: true,
        debugOnly: true,
        data: new SlashCommandBuilder()
            .setDescription('Internal debug tools for Pogbot.')
            .addSubcommandGroup(
                new SlashCommandSubcommandGroupBuilder()
                    .setName('dump')
                    .setDescription('Dump data.')
                    .addSubcommand(
                        new SlashCommandSubcommandBuilder()
                            .setName('me')
                            .setDescription('Your data.')
                    )
                    .addSubcommand(
                        new SlashCommandSubcommandBuilder()
                            .setName('guild')
                            .setDescription('Guild data.')
                    )
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('forceerror')
                    .setDescription(
                        'Force an error to test error handling logic.'
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
