import { CommandInteraction, Interaction, SlashCommandBuilder } from "discord.js";

export interface Command {
    name: string,
    debugOnly: boolean?,
    guildOnly: boolean?,
    data: SlashCommandBuilder,
    execute: (i: CommandInteraction) => Promise<void>,
}

export interface PogListener {
    initiator: string,
    timestamp: number
}

export interface BuildInfo {
    generated: string,
    version: string,
    branch: string,
    commit: string
}

export enum Environment {
    DEVELOPMENT,
    PRODUCTION
}