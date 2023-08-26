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
} from 'discord.js';

import { Pogbot } from '../client.js';
import { PogDB } from '../database.js';
import { Translation } from '../translation.js';

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
            const [guild] = await PogDB.getInstance().getGuild(i.guild);
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
                        break;
                    }
                }
                Pogbot.getInstance().addFollowUp(i.channel, i.user, 'channels');
            } else if (i.isChannelSelectMenu()) {
                const [guild] = await PogDB.getInstance().getGuild(i.guild);
                const channels = guild.channels;

                switch (i.component.customId) {
                    case 'channelAddSelect': {
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
                        break;
                    }
                    case 'channelRemoveSelect': {
                    }
                }
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
