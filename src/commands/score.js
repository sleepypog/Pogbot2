import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import i18next from 'i18next';

import { PogDB } from '../database.js';

/** @type {import('../client').Command} */
export default function Score() {
    return {
        name: 'score',
        guildOnly: true,
        data: new SlashCommandBuilder().setDescription('See your score.'),
        /** @param {CommandInteraction} i  */
        async execute(i) {
            const member = await PogDB.getInstance().getMember(i.member);
            await i.reply(
                i18next.t('score', { amount: member.score, lng: i.locale })
            );
        },
    };
}
