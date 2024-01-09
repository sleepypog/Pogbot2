import {
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import i18next from 'i18next';

import { Pogbot } from '../client.js';
import { PogDB } from '../database.js';

export default function Leaderboard() {
    return {
        name: 'leaderboard',
        guildOnly: true,
        debugOnly: false,
        data: new SlashCommandBuilder(),
        /** @param {CommandInteraction} i  */
        async execute(i) {
            const embed = new EmbedBuilder()
                .setTitle(
                    i18next.t('leaderboard.title', {
                        lng: i.locale,
                    })
                )
                .setAuthor({
                    name: i.guild.name,
                });

            if (Pogbot.getInstance().getEnvironment() === 'DEVELOPMENT') {
                const member = await PogDB.getInstance().getMember(i.member);
                member.increment('score', { by: 100 });
            }

            const lines = [];

            const members = await PogDB.getInstance().getTopScores(i.guild);

            members.forEach((m, i) => {
                lines.push(
                    `${getPlacePrefix(i)} **${i + 1}** <@${m.get(
                        'userId'
                    )}>: ${m.get('score')} pogs`
                );
            });

            if (members.length === 0) {
                embed.setDescription(
                    i18next.t('error.noMembers', { lng: i.locale })
                );
            } else {
                const count = await PogDB.getInstance().getScoreCount(i.guild);
                if (count > members.length) {
                    lines.push(
                        i18next.t('leaderboard.andMore', {
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

function getPlacePrefix(index) {
    switch (index) {
        case 0: {
            return '### - 🥇';
        }
        case 1: {
            return '### -🥈';
        }
        case 2: {
            return '### - 🥉';
        }
        default: {
            return '- ';
        }
    }
}
