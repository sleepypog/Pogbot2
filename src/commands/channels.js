import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    CommandInteraction,
    EmbedBuilder,
} from 'discord.js'

import { PogDB } from '../database.js'
import { Translation } from '../translation.js'

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
            const [guild] = await PogDB.getInstance().getGuild(i.guild)
            const channels = guild.channels

            switch (i.options.getSubcommand()) {
                case 'list': {
                    await i.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(Translation.t("en", "channelListTitle"))
                                .setDescription(
                                    `${
                                        channels.length === 0
                                            ? 'This guild has not configured any pog channels.'
                                            : formatChannels(channels)
                                    }`
                                ),
                        ],
                    })
                    break
                }
                case 'edit': {
                    break
                }
            }
        },
    }
}

/**
 * Format channels IDs into Discord's format and adds an new line.
 * @param {string[]} channels Channel IDs
 */
function formatChannels(channels) {
    channels.map((value) => {
        return `<#${value}>\n`
    })
    return channels
}
