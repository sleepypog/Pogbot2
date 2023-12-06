import {
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';

import { Pogbot } from '../client.js';
import { PogDB } from '../database.js';
import { Translation } from '../utils/translation.js';

export default function Leaderboard() {
    return {
        name: 'leaderboard',
        guildOnly: true,
        debugOnly: false,
        data: new SlashCommandBuilder().setDescription(
            'See top scores for this guild.'
        ),
        /** @param {CommandInteraction} i  */
        async execute(i) {
            const embed = new EmbedBuilder();
            embed.setTitle(
                i18next.t('leaderboardTitle', {
                    guild: i.guild.name,
                    lng: i.locale,
                })
            );

            if (Pogbot.getInstance().getEnvironment() === 'DEVELOPMENT') {
                const member = await PogDB.getInstance().getMember(i.member);
                member.increment('score', { by: 100 });
            }

            const lines = [];

            const members = await PogDB.getInstance().getTopScores(i.guild);

            members.forEach((m, i) => {
                lines.push(
                    `- ${getPlaceEmoji(i)} **${i + 1}** <@${m.get(
                        'userId'
                    )}>: ${m.get('score')} pogs`
                );
            });

            if (members.length === 0) {
                embed.setDescription(
                    i18next.t('noMembersError', { lng: i.locale })
                );
            } else {
                const count = await PogDB.getInstance().getScoreCount(i.guild);
                if (count > members.length) {
                    lines.push(
                        i18next.t('leaderboardAndMore', {
                            amount: count - members.length,
                            lng: i.locale,
                        })
                    );
                }
                embed.setDescription(lines.join('\n'));
            }

            await i.reply({ embeds: [embed] });
        },
    };
}

function getPlaceEmoji(index) {
    switch (index) {
        case 0: {
            return '🥇';
        }
        case 1: {
            return '🥈';
        }
        case 2: {
            return '🥉';
        }
        default: {
            return '';
        }
    }
}
