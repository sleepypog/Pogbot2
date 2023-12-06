import {
    CommandInteraction,
    MessageFlags,
    ModalBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from 'discord.js';
import i18next from 'i18next';

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

            m.increment('score', { by: amount }).catch(async () => {
                await i.reply(i18next.t('tooLargeError', { lng: i.locale }));
                return;
            });

            m = await m.reload();

            await i.reply({
                content: i18next.t('scoreEdited', {
                    user: `<@${i.user.id}>`,
                    amount: m.score,
                    lng: i.locale,
                }),
                flags: [MessageFlags.SuppressNotifications],
            });
        },
    };
}
