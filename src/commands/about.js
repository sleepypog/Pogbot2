import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import i18next from 'i18next';

import { Pogbot } from '../client.js';
import { Translation } from '../translation.js';

/** @type {import('../client').Command} */
export default function About() {
    return {
        name: 'about',
        guildOnly: false,
        data: new SlashCommandBuilder(),
        /** @param {CommandInteraction} i  */
        async execute(i) {
            await i.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(i18next.t('about.title', { lng: i.locale }))
                        .setDescription(
                            i18next.t('about.aboutPogbot', { lng: i.locale })
                        )
                        .addFields([
                            {
                                name: i18next.t('about.guilds', {
                                    lng: i.locale,
                                }),
                                value: Pogbot.getInstance().guilds.cache.size.toString(),
                            },
                            {
                                name: i18next.t('about.uptime', {
                                    lng: i.locale,
                                }),
                                value: Translation.d(
                                    Pogbot.getInstance()?.uptime
                                ),
                            },
                            {
                                name: i18next.t('about.version', {
                                    lng: i.locale,
                                }),
                                value: (() => {
                                    const { version, branch } =
                                        Pogbot.getInstance().getBuildInfo();
                                    return `${version} (🌴 ${branch})`;
                                })(),
                                inline: true,
                            },
                            {
                                name: i18next.t('about.environment.title', {
                                    lng: i.locale,
                                }),
                                value:
                                    Pogbot.getInstance().getEnvironment() ===
                                    'DEVELOPMENT'
                                        ? i18next.t(
                                              'about.environment.development',
                                              {
                                                  lng: i.locale,
                                              }
                                          )
                                        : i18next.t(
                                              'about.environment.production',
                                              {
                                                  lng: i.locale,
                                              }
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
                        new ButtonBuilder()
                            .setLabel('Crowdin')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://crowdin.com/project/pogbot'),
                    ]),
                ],
            });
        },
    };
}
