import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonComponent,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js';

import { Pogbot } from '../client.js';
import { Translation } from '../translation.js';

/** @type {import('../client').Command} */
export default function About() {
    return {
        name: 'about',
        guildOnly: false,
        data: new SlashCommandBuilder().setDescription(
            'See information about Pogbot'
        ),
        /** @param {CommandInteraction} i  */
        async execute(i) {
            await i.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('About Pogbot')
                        .setDescription(
                            'Pogbot is an open source bot created with the purpose of promoting competition within your community.'
                        )
                        .addFields([
                            {
                                name: 'Guilds',
                                value: Pogbot.getInstance().guilds.cache.size.toString(),
                                inline: true,
                            },
                            {
                                name: 'Uptime',
                                value: Localization.d(
                                    Pogbot.getInstance()?.uptime
                                ),
                                inline: true,
                            },
                        ]),
                ],
                components: [
                    new ActionRowBuilder().setComponents([
                        // TODO: Set url to repo link
                        new ButtonBuilder()
                            .setLabel('GitHub')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://github.com'),
                    ]),
                ],
            });
        },
    };
}
