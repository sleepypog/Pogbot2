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

            // TODO: Maybe merge these two cases, as they share almost all their code.
            switch (i.options.getSubcommand()) {
                case 'list': {
                    await i.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    i18next.t('triggerListTitle', {
                                        lng: i.locale,
                                    })
                                )
                                .setDescription(
                                    `${
                                        triggers.length === 0
                                            ? i18next.t('triggerListEmpty', {
                                                  lng: i.locale,
                                              })
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
                                    i18next.t('triggerListTitle', {
                                        lng: i.locale,
                                    })
                                )
                                .setDescription(
                                    `${
                                        triggers.length === 0
                                            ? i18next.t('triggerListEmpty', {
                                                  lng: i.locale,
                                              })
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
                                        i18next.t('triggerAdd', {
                                            lng: i.locale,
                                        })
                                    )
                                    .setStyle(ButtonStyle.Success)
                                    .setEmoji('➕'),
                                new ButtonBuilder()
                                    .setCustomId('triggerRemove')
                                    .setLabel(
                                        i18next.t('triggerRemove', {
                                            lng: i.locale,
                                        })
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
                                i18next.t('triggerAddTitle', { lng: i.locale })
                            )
                            .setCustomId('triggerAddModal')
                            .setComponents([
                                new ActionRowBuilder().setComponents([
                                    new TextInputBuilder()
                                        .setLabel(
                                            i18next.t('triggerAddPromptLabel', {
                                                lng: i.locale,
                                            })
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
                                        i18next.t('triggerRemoveEntry', {
                                            lng: i.locale,
                                        })
                                    )
                                    .setValue(`-${index}`)
                                    .setEmoji('💬'),
                            ]);
                        });

                        await i.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(
                                        i18next.t('triggerRemoveTitle', {
                                            lng: i.locale,
                                        })
                                    )
                                    .setDescription(
                                        i18next.t('triggerRemoveSelect', {
                                            lng: i.locale,
                                        })
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
                            i18next.t('triggerInvalidCharacter', {
                                lng: i.locale,
                            })
                        );
                        return;
                    }

                    triggers.push(trigger);
                    await guild.update({ triggers: triggers });

                    await i.reply(
                        i18next.t('triggerAdded', {
                            trigger: trigger,
                            lng: i.locale,
                        })
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
                        content: i18next.t('triggerRemoved', {
                            amount: t,
                            lng: i.locale,
                        }),
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
