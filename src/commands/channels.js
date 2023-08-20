import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    CommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Emoji,
} from 'discord.js';

import { Pogbot } from '../client';
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
                                    Translation.t('en', 'channelListTitle')
                                )
                                .setDescription(
                                    `${
                                        channels.length === 0
                                            ? 'This guild has not configured any pog channels.'
                                            : formatChannels(channels)
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
                                    Translation.t('en', 'channelEditTitle')
                                )
                                .setDescription(
                                    `${
                                        channels.length === 0
                                            ? 'This guild has not configured any pog channels.'
                                            : formatChannels(channels)
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
                    break;
                }
            }
        },
        /** @param {import('discord.js').Interaction} i */
        async followUp(i) {
            if (i.isButton()) {
                switch (i.component.customId) {
                    case 'channelAdd': {
                        // TODO: Select menus.
                        break;
                    }
                    case 'channelRemove': {
                        break;
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
    channels.map((value) => {
        return `<#${value}>\n`;
    });
    return channels;
}
