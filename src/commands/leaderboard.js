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
        data: new SlashCommandBuilder().setDescription(
            'See top scores for this guild.'
        ),
        /** @param {CommandInteraction} i  */
        async execute(i) {
            const embed = new EmbedBuilder();
            embed.setTitle(
                Translation.t(i.locale, 'leaderboardTitle', i.guild.name)
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
                embed.setDescription(Translation.t(i.locale, 'noMembersError'));
            } else {
                const count = await PogDB.getInstance().getScoreCount(i.guild);
                if (members.length >= 10 && count > 10) {
                    lines.push(
                        Translation.t(
                            i.locale,
                            'leaderboardAndMore',
                            count - 10
                        )
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
