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
                            },
                            {
                                name: Translation.t(i.locale, 'uptime'),
                                value: Translation.d(
                                    Pogbot.getInstance()?.uptime
                                ),
                            },
                            {
                                name: Translation.t(i.locale, 'version'),
                                value: (() => {
                                    const { version, branch } =
                                        Pogbot.getInstance().getBuildInfo();
                                    return `${version} (⚙ ${branch})`;
                                })(),
                                inline: true,
                            },
                            {
                                name: Translation.t(i.locale, 'environment'),
                                value:
                                    Pogbot.getInstance().getEnvironment() ===
                                    'DEVELOPMENT'
                                        ? Translation.t(
                                              i.locale,
                                              'environmentDevelopment'
                                          )
                                        : Translation.t(
                                              i.locale,
                                              'environmentProduction'
                                          ),
                                inline: true,
                            },
                        ]),
                ],
                components: [
                    new ActionRowBuilder().setComponents([
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
