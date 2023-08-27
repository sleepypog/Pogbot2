import { EmbedBuilder } from '@discordjs/builders';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    ModalBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { Pogbot } from '../client.js';
import { PogDB } from '../database.js';
import { asChunks } from '../utils/array.js';
import { Translation } from '../utils/translation.js';

/** @type {import('../client.js').Command} */
export default function Triggers() {
    return {
        name: 'triggers',
        guildOnly: true,
        data: new SlashCommandBuilder()
            .setDescription('List and edit triggers that will wake up the bot.')
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('list')
                    .setDescription('List configured pog channels.')
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('edit')
                    .setDescription('Edit the list of triggers for this server')
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        /** @param {CommandInteraction} i  */
        async execute(i) {
            const guild = await PogDB.getInstance().getGuild(i.guild);
            const triggers = guild.get('triggers');

            switch (i.options.getSubcommand()) {
                case 'list': {
                    await i.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    Translation.t(i.locale, 'triggerListTitle')
                                )
                                .setDescription(
                                    `${
                                        triggers.length === 0
                                            ? Translation.t(
                                                  i.locale,
                                                  'triggerListEmpty'
                                              )
                                            : formatTriggers(triggers).join(
                                                  '\n'
                                              )
                                    }`
                                ),
                        ],
                        ephemeral: true,
                    });
                    break;
                }
                case 'edit': {
                    await i.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    Translation.t(i.locale, 'triggerListTitle')
                                )
                                .setDescription(
                                    `${
                                        triggers.length === 0
                                            ? Translation.t(
                                                  i.locale,
                                                  'triggerListEmpty'
                                              )
                                            : formatTriggers(triggers).join(
                                                  '\n'
                                              )
                                    }`
                                ),
                        ],
                        components: [
                            new ActionRowBuilder().setComponents([
                                new ButtonBuilder()
                                    .setCustomId('triggerAdd')
                                    .setLabel(
                                        Translation.t(i.locale, 'triggerAdd')
                                    )
                                    .setStyle(ButtonStyle.Success)
                                    .setEmoji('➕'),
                                new ButtonBuilder()
                                    .setCustomId('triggerRemove')
                                    .setLabel(
                                        Translation.t(i.locale, 'triggerRemove')
                                    )
                                    .setStyle(ButtonStyle.Danger)
                                    .setEmoji('➖')
                                    .setDisabled(triggers.length === 0),
                            ]),
                        ],
                        ephemeral: true,
                    });
                    Pogbot.getInstance().addFollowUp(
                        i.channelId,
                        i.user.id,
                        'triggers'
                    );
                    break;
                }
            }
        },
        /** @param {import('discord.js').Interaction} i */
        async followUp(i) {
            const guild = await PogDB.getInstance().getGuild(i.guild);
            /** @type {string[]} */
            const triggers = guild.get('triggers');

            if (i.isButton()) {
                switch (i.component.customId) {
                    case 'triggerAdd': {
                        const modal = new ModalBuilder()
                            .setTitle(
                                Translation.t(i.locale, 'triggerAddTitle')
                            )
                            .setCustomId('triggerAddModal')
                            .setComponents([
                                new ActionRowBuilder().setComponents([
                                    new TextInputBuilder()
                                        .setLabel(
                                            Translation.t(
                                                i.locale,
                                                'triggerAddPromptLabel'
                                            )
                                        )
                                        .setCustomId('triggerInput')
                                        .setRequired(true)
                                        .setStyle(TextInputStyle.Short)
                                        .setPlaceholder('@everyone'),
                                ]),
                            ]);
                        await i.showModal(modal);
                        break;
                    }
                    case 'triggerRemove': {
                        const selectMenu =
                            new StringSelectMenuBuilder().setCustomId(
                                'triggerSelect'
                            );
                        triggers.forEach(async (t, index) => {
                            selectMenu.addOptions([
                                new StringSelectMenuOptionBuilder()
                                    .setLabel(t)
                                    .setDescription(
                                        Translation.t(
                                            i.locale,
                                            'triggerRemoveEntry'
                                        )
                                    )
                                    .setValue(`-${index}`)
                                    .setEmoji('💬'),
                            ]);
                        });

                        await i.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(
                                        Translation.t(
                                            i.locale,
                                            'triggerRemoveTitle'
                                        )
                                    )
                                    .setDescription(
                                        Translation.t(
                                            i.locale,
                                            'triggerRemoveSelect'
                                        )
                                    ),
                            ],
                            ephemeral: true,
                            components: [
                                new ActionRowBuilder().setComponents([
                                    selectMenu,
                                ]),
                            ],
                        });
                        break;
                    }
                }
                Pogbot.getInstance().addFollowUp(
                    i.channelId,
                    i.user.id,
                    'triggers'
                );
            } else if (i.isModalSubmit()) {
                if (i.customId === 'triggerAddModal') {
                    const trigger = i.fields.getTextInputValue('triggerInput');

                    // Separator character
                    if (trigger.includes(';')) {
                        await i.reply(
                            Translation.t(i.locale, 'triggerInvalidCharacter')
                        );
                        return;
                    }

                    triggers.push(trigger);
                    await guild.update({ triggers: triggers });

                    await i.reply(
                        Translation.t(
                            i.locale,
                            'triggerAdded',
                            `\`${trigger}\``
                        )
                    );
                }
            } else if (i.isStringSelectMenu()) {
                if (i.customId === 'triggerSelect') {
                    /** @type {string} */
                    let selected = i.values[0];
                    selected = selected.replace('-', '');

                    const t = triggers[selected];
                    delete triggers[selected];

                    await guild.update({ triggers: triggers });

                    await i.reply({
                        content: Translation.t(i.locale, 'triggerRemoved', t),
                        ephemeral: true,
                    });
                }
            }
        },
    };
}

/**
 * Format triggers by adding an new line.
 * @param {string[]} t Array of triggers.
 */
function formatTriggers(t) {
    t.map((value) => `- '${value}'`);
    return t;
}
