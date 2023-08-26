import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    CommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Emoji,
    ChannelSelectMenuBuilder,
    ChannelType,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';

import { Pogbot } from '../client.js';
import { PogDB } from '../database.js';
import { Translation } from '../utils/translation.js';

/** @type {import('../client').Command} */
export default function Channels() {
    return {
        name: 'channels',
        guildOnly: true,
        data: new SlashCommandBuilder()
            .setDescription('List and edit configured pog channels.')
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('list')
                    .setDescription('List configured pog channels.')
            )
            .addSubcommand(
                new SlashCommandSubcommandBuilder()
                    .setName('edit')
                    .setDescription(
                        'Edit the list of pog channels for this server.'
                    )
            ),
        /** @param {CommandInteraction} i  */
        async execute(i) {
            const guild = await PogDB.getInstance().getGuild(i.guild);
            const channels = guild.channels;
            // TODO: Permission checks

            switch (i.options.getSubcommand()) {
                case 'list': {
                    await i.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    Translation.t(i.locale, 'channelListTitle')
                                )
                                .setDescription(
                                    `${
                                        channels.length === 0
                                            ? Translation.t(
                                                  i.locale,
                                                  'channelListEmpty'
                                              )
                                            : formatChannels(channels).join(
                                                  '\n'
                                              )
                                    }`
                                ),
                        ],
                    });
                    break;
                }
                case 'edit': {
                    await i.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    Translation.t(i.locale, 'channelEditTitle')
                                )
                                .setDescription(
                                    `${
                                        channels.length === 0
                                            ? Translation.t(
                                                  i.locale,
                                                  'channelListEmpty'
                                              )
                                            : formatChannels(channels).join(
                                                  '\n'
                                              )
                                    }`
                                ),
                        ],
                        components: [
                            new ActionRowBuilder().setComponents([
                                new ButtonBuilder()
                                    .setCustomId('channelAdd')
                                    .setLabel(
                                        Translation.t(i.locale, 'channelAdd')
                                    )
                                    .setStyle(ButtonStyle.Success)
                                    .setEmoji('➕'),
                                new ButtonBuilder()
                                    .setCustomId('channelRemove')
                                    .setLabel(
                                        Translation.t(i.locale, 'channelRemove')
                                    )
                                    .setStyle(ButtonStyle.Danger)
                                    .setEmoji('➖')
                                    .setDisabled(channels.length === 0),
                            ]),
                        ],
                        ephemeral: true,
                    });
                    Pogbot.getInstance().addFollowUp(
                        i.channelId,
                        i.user.id,
                        'channels'
                    );
                    break;
                }
            }
        },
        /** @param {import('discord.js').Interaction} i */
        async followUp(i) {
            const [guild] = await PogDB.getInstance().getGuild(i.guild);
            const channels = guild.channels;
            if (i.isButton()) {
                switch (i.component.customId) {
                    case 'channelAdd': {
                        await i.guild.channels.fetch();

                        await i.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(
                                        Translation.t(
                                            i.locale,
                                            'channelAddSelectTitle'
                                        )
                                    )
                                    .setDescription(
                                        Translation.t(
                                            i.locale,
                                            'channelAddSelect'
                                        )
                                    ),
                            ],
                            ephemeral: true,
                            components: [
                                new ActionRowBuilder().setComponents([
                                    new ChannelSelectMenuBuilder()
                                        .setCustomId('channelAddSelect')
                                        .setChannelTypes(ChannelType.GuildText)
                                        .setMinValues(1)
                                        .setMaxValues(10),
                                ]),
                            ],
                        });

                        Pogbot.getInstance().addFollowUp(
                            i.channelId,
                            i.user.id,
                            'channels'
                        );

                        break;
                    }
                    case 'channelRemove': {
                        const menus = new ActionRowBuilder();

                        asChunks(channels, 24).forEach((chunk) => {
                            const selectMenu = new StringSelectMenuBuilder();
                            chunk.forEach(async (c) => {
                                const channel = await i.guild.channels.fetch(c);
                                selectMenu.addOptions([
                                    new StringSelectMenuOptionBuilder()
                                        .setLabel(channel.name)
                                        .setDescription(channel.parent.name)
                                        .setValue(channel.id)
                                        .setEmoji('#️⃣'),
                                ]);
                            });
                        });

                        await i.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(
                                        Translation.t(
                                            i.locale,
                                            'channelSelectTitle'
                                        )
                                    )
                                    .setDescription(
                                        Translation.t(i.locale, 'channelSelect')
                                    ),
                            ],
                            ephemeral: true,
                            components: [menus],
                        });

                        break;
                    }
                }
                Pogbot.getInstance().addFollowUp(i.channel, i.user, 'channels');
            } else if (i.isChannelSelectMenu()) {
                if (i.component.customId === 'channelAddSelect') {
                    const selected = i.channels.map((c) => c.id);

                    selected.forEach((c, i) => {
                        // Prevent duplicates.
                        if (channels.includes(c)) {
                            delete selected[i];
                            return;
                        }

                        channels.push(c);
                    });

                    await guild.update({ channels: channels });
                    await i.reply({
                        content: Translation.t(
                            i.locale,
                            'channelAdded',
                            selected.length
                        ),
                        ephemeral: true,
                    });
                }
            } else if (i.isStringSelectMenu()) {
                const selected = i.values();

                channels = channels.filter((c) => !selected.includes(c));
                await guild.update({ channels: channels });

                await i.reply({
                    content: Translation.t(
                        i.locale,
                        'channelRemoved',
                        selected.length
                    ),
                    ephemeral: true,
                });
            }
        },
    };
}

/**
 * Format channels IDs into Discord's format and adds an new line.
 * @param {string[]} channels Channel IDs
 */
function formatChannels(channels) {
    channels.map((value) => `- <#${value}>`);
    return channels;
}
