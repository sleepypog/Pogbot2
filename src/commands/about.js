import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';

import { Pogbot } from '../client.js';
import { Translation } from '../utils/translation.js';

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
                        .setTitle(Translation.t(i.locale, 'aboutTitle'))
                        .setDescription(Translation.t(i.locale, 'about'))
                        .addFields([
                            {
                                name: Translation.t(i.locale, 'guilds'),
                                value: Pogbot.getInstance().guilds.cache.size.toString(),
                                inline: true,
                            },
                            {
                                name: Translation.t(i.locale, 'uptime'),
                                value: Translation.d(
                                    Pogbot.getInstance()?.uptime
                                ),
                                inline: true,
                            },
                            {
                                name: Translation.t(i.locale, 'environment'),
                                value: (Pogbot.getInstance().getEnvironment() === 'DEVELOPMENT' ? Translation.t(i.locale, 'environmentDevelopment') : Translation.t(i.locale, 'environmentProduction'))
                            }
                        ]),
                ],
                components: [
                    new ActionRowBuilder().setComponents([
                        // TODO: Set url to repo link
                        new ButtonBuilder()
                            .setLabel('GitHub')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://github.com/sleepypog/Pogbot2'),
                    ]),
                ],
            });
        },
    };
}
