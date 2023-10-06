import { CommandInteraction, Interaction, SlashCommandBuilder } from "discord.js";

export interface Command {
    name: string,
    guildOnly: boolean?,
    data: SlashCommandBuilder,
    execute: (i: CommandInteraction) => Promise<void>,
    followUp: (i: Interaction) => Promise<void>
}

export interface PogListener {
    initiator: string,
    timestamp: number
}

export enum Environment {
    DEVELOPMENT,
    PRODUCTION
}