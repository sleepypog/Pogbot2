import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

import { PogDB } from '../database.js';
import { Translation } from '../utils/translation.js';

/** @type {import('../client').Command} */
export default function Score() {
    return {
        name: 'score',
        guildOnly: true,
        data: new SlashCommandBuilder().setDescription('See your score.'),
        /** @param {CommandInteraction} i  */
        async execute(i) {
            const member = await PogDB.getInstance().getMember(i.member);
            await i.reply(Translation.t(i.locale, 'score', member.score));
        },
    };
}
