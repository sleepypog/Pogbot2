import {
    CommandInteraction,
    ModalBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js';

import { PogDB } from '../database.js';
import { Translation } from '../utils/translation.js';

/** @type {import('../client.js').Command} */
export default function Edit() {
    return {
        name: 'edit',
        guildOnly: true,
        data: new SlashCommandBuilder()
            .setDescription('Edit an member score manually.')
            .addUserOption((o) =>
                o
                    .setName('member')
                    .setDescription('Member to edit scores for')
                    .setRequired(true)
            )
            .addIntegerOption((o) =>
                o
                    .setName('amount')
                    .setDescription(
                        'Number of pogs to add or remove from the user.'
                    )
                    .setRequired(true)
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
        /** @param {CommandInteraction} i  */
        async execute(i) {
            const selectedMember = i.options.getMember('member');
            const amount = i.options.getInteger('amount');

            let m = await PogDB.getInstance().getMember(selectedMember);

            m.increment('score', { by: amount });
            m = await m.reload();

            await i.reply(
                Translation.t(i.locale, 'scoreEdited', m.get('score'))
            );
        },
    };
}
