import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js';

import { Pogbot } from '../client.js';
import { PogDB } from '../database.js';
import { Translation } from '../utils/translation.js';

/** @type {import('../client').Command} */
export default function About() {
    return {
        name: 'dump',
        guildOnly: true,
        debugOnly: true,
        data: new SlashCommandBuilder()
            .setDescription('Dump data and bot information.')
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('me')
                    .setDescription('Your data.')
            ),
        /** @param {CommandInteraction} i  */
        async execute(i) {
            switch (i.options.getSubcommand()) {
                case 'me': {
                    const user = await PogDB.getInstance().getMember(i.member);
                    await i.reply(prettyJson(user.toJSON()));
                }
            }
        },
    };
}
