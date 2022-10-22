import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { ClientInterface } from "./ClientInterface.js";

export interface CommandInterface {
  name: string;
  category: string;
  data: Omit<
    SlashCommandBuilder,
    | "addBooleanOption"
    | "addUserOption"
    | "addChannelOption"
    | "addRoleOption"
    | "addAttachmentOption"
    | "addMentionableOption"
    | "addStringOption"
    | "addIntegerOption"
    | "addNumberOption"
    | "addSubcommandGroup"
    | "addSubcommand"
  >;
  execute: (
    interaction: ChatInputCommandInteraction,
    client: ClientInterface
  ) => Promise<void>;
}
