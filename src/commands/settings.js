import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    MessageFlags,
    ModalBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    TextInputBuilder,
    TextInputStyle,
    messageLink,
} from 'discord.js';
import i18next from 'i18next';

import { PogDB } from '../database.js';
import { generateErrorEmbed } from '../utils/debug.js';
import {
    getDescription,
    getDescriptionLocalizations,
} from '../utils/description.js';

const REACTION_COLLECTOR_FILTER = (_, user) => user.id === i.user.id;

/** @type {import('../client').Command} */
export default function Score() {
    return {
        name: 'settings',
        guildOnly: true,
        data: new SlashCommandBuilder()
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('overview')
                    .setDescription(
                        getDescription('settings.subcommands.overview')
                    )
                    .setDescriptionLocalizations(
                        getDescriptionLocalizations(
                            'settings.subcommands.overview'
                        )
                    )
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('triggers')
                    .setDescription(
                        getDescription('settings.subcommands.triggers')
                    )
                    .setDescriptionLocalizations(
                        getDescriptionLocalizations(
                            'settings.subcommands.triggers'
                        )
                    )
            )
            .addSubcommandGroup(
                new SlashCommandSubcommandGroupBuilder()
                    .setName('emojis')
                    .setDescription(
                        getDescription('settings.emojis.description')
                    )
                    .setDescriptionLocalizations(
                        getDescriptionLocalizations(
                            'settings.emojis.description'
                        )
                    )
                    .addSubcommand(
                        new SlashCommandSubcommandBuilder()
                            .setName('listening')
                            .setDescription(
                                getDescription(
                                    'settings.emojis.subcommands.listening'
                                )
                            )
                            .setDescriptionLocalizations(
                                getDescriptionLocalizations(
                                    'settings.emojis.subcommands.listening'
                                )
                            )
                    )
                    .addSubcommand(
                        new SlashCommandSubcommandBuilder()
                            .setName('pog')
                            .setDescription(
                                getDescription(
                                    'settings.emojis.subcommands.pog'
                                )
                            )
                            .setDescriptionLocalizations(
                                getDescriptionLocalizations(
                                    'settings.emojis.subcommands.pog'
                                )
                            )
                    )
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
        /** @param {CommandInteraction} i  */
        async execute(i) {
            const guild = await PogDB.getInstance().getGuild(i.guild);

            switch (i.options.getSubcommand()) {
                case 'overview': {
                    await i.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    i18next.t('settings.title', {
                                        lng: i.locale,
                                    })
                                )
                                .setAuthor({ name: i.guild.name })
                                .setFields([
                                    {
                                        name: i18next.t(
                                            'settings.triggers.title',
                                            { lng: i.locale }
                                        ),
                                        value:
                                            guild.get('triggers').length === 0
                                                ? i18next.t(
                                                      'settings.triggers.emptyList',
                                                      { lng: i.locale }
                                                  )
                                                : formatTriggers(
                                                      guild.get('triggers')
                                                  ),
                                    },
                                    {
                                        name: i18next.t(
                                            'settings.emoji.listening',
                                            { lng: i.locale }
                                        ),
                                        value: guild.get('listeningEmoji'),
                                        inline: true,
                                    },
                                    {
                                        name: i18next.t('settings.emoji.pog', {
                                            lng: i.locale,
                                        }),
                                        value: guild.get('pogEmoji'),
                                        inline: true,
                                    },
                                ]),
                        ],
                    });
                    break;
                }
                case 'triggers': {
                    await i.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    i18next.t('settings.triggers.title', {
                                        lng: i.locale,
                                    })
                                )
                                .setAuthor({ name: i.guild.name })
                                .setDescription(
                                    guild.get('triggers').length === 0
                                        ? i18next.t(
                                              'settings.triggers.emptyList',
                                              { lng: i.locale }
                                          )
                                        : formatTriggers(guild.get('triggers'))
                                ),
                        ],
                        components: [
                            new ActionRowBuilder().setComponents([
                                new ButtonBuilder()
                                    .setCustomId('addTrigger')
                                    .setStyle(ButtonStyle.Success)
                                    .setLabel(
                                        i18next.t(
                                            'settings.triggers.buttons.add',
                                            { lng: i.locale }
                                        )
                                    )
                                    .setEmoji('➕'),
                                new ButtonBuilder()
                                    .setCustomId('removeTrigger')
                                    .setStyle(ButtonStyle.Danger)
                                    .setLabel(
                                        i18next.t(
                                            'settings.triggers.buttons.remove',
                                            { lng: i.locale }
                                        )
                                    )
                                    .setEmoji('➖')
                                    .setDisabled(
                                        guild.get('triggers').length === 0
                                    ),
                            ]),
                        ],
                    });

                    i.channel
                        .createMessageComponentCollector({
                            componentType: ComponentType.Button,
                            time: 15000,
                        })
                        .on('collect', (c) => {
                            if (c.user.id !== i.user.id) {
                                c.reply({
                                    content: i18next.t('error.differentUser', {
                                        lng: c.locale,
                                    }),
                                    ephemeral: true,
                                });
                                return;
                            }

                            if (c.customId === 'addTrigger') {
                                c.showModal(
                                    new ModalBuilder()
                                        .setTitle(
                                            i18next.t(
                                                'settings.triggers.modal.title',
                                                { lng: c.locale }
                                            )
                                        )
                                        .setCustomId('newTrigger')
                                        .setComponents(
                                            new ActionRowBuilder().setComponents(
                                                [
                                                    new TextInputBuilder()
                                                        .setLabel(
                                                            i18next.t(
                                                                'settings.triggers.modal.inputLabel',
                                                                {
                                                                    lng: c.locale,
                                                                }
                                                            )
                                                        )
                                                        .setCustomId(
                                                            'searchString'
                                                        )
                                                        .setStyle(
                                                            TextInputStyle.Short
                                                        )
                                                        .setPlaceholder(
                                                            '@everyone'
                                                        )
                                                        .setRequired(true),
                                                ]
                                            )
                                        )
                                );
                                i.awaitModalSubmit({
                                    time: 45000,
                                    filter: (i) => i.customId === 'newTrigger',
                                }).then(async (m) => {
                                    const trigger = m.fields
                                        .getTextInputValue('searchString')
                                        .trim();

                                    if (trigger.includes(';')) {
                                        m.reply(
                                            i18next.t(
                                                'error.triggerIllegalCharacter',
                                                { lng: m.locale }
                                            )
                                        );
                                        return;
                                    }
                                    const triggers = guild.get('triggers');
                                    triggers.push(trigger.trim());

                                    await guild.update({ triggers: triggers });
                                    await m.reply({
                                        content: i18next.t(
                                            'settings.triggers.added',
                                            { trigger, lng: m.locale }
                                        ),
                                        flags: [
                                            MessageFlags.SuppressNotifications,
                                        ],
                                    });
                                });
                            } else {
                            }
                        });
                    break;
                }
                case 'listening': {
                    await i.reply(
                        i18next.t('settings.emoji.prompt', { lng: i.locale })
                    );
                    const collector = (
                        await i.fetchReply()
                    ).createReactionCollector({
                        REACTION_COLLECTOR_FILTER,
                        time: 45_000,
                    });

                    collector.on('collect', async (r) => {
                        collector.stop();

                        await guild.update({
                            listeningEmoji: r.emoji.id ?? r.emoji.name,
                        });
                        await i.editReply(
                            i18next.t('settings.emoji.done', {
                                lng: i.locale,
                                type:
                                    r.emoji.id === null ? 'discord' : 'custom',
                                emoji: guild.get('listeningEmoji'),
                            })
                        );
                    });

                    collector.once('end', async (_, reason) => {
                        if (reason === 'time') {
                            await i.editReply(
                                i18next.t('error.timedOut', { lng: i.locale })
                            );
                        }
                    });
                    break;
                }
                case 'pog': {
                    await i.reply(
                        i18next.t('settings.emoji.prompt', { lng: i.locale })
                    );
                    const collector = (
                        await i.fetchReply()
                    ).createReactionCollector({
                        REACTION_COLLECTOR_FILTER,
                        time: 45_000,
                    });

                    collector.on('collect', async (r) => {
                        collector.stop();

                        await guild.update({
                            pogEmoji: r.emoji.id ?? r.emoji.name,
                        });
                        await i.editReply(
                            i18next.t('settings.emoji.done', {
                                lng: i.locale,
                                type:
                                    r.emoji.id === null ? 'discord' : 'custom',
                                emoji: guild.get('pogEmoji'),
                            })
                        );
                    });

                    collector.once('end', async (_, reason) => {
                        if (reason === 'time') {
                            await i.editReply(
                                i18next.t('error.timedOut', { lng: i.locale })
                            );
                        }
                    });
                    break;
                }
            }
        },
    };
}

/**
 * Format triggers.
 * @param {string[]} triggers Array of triggers.
 * @returns formatted list of triggers
 */
function formatTriggers(triggers) {
    triggers.map((value) => `'${value}'`);
    return triggers.join(', ');
}
