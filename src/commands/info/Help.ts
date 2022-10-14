import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { CommandInterface } from "../../utils/interfaces/CommandInterface";

export class Help implements CommandInterface {
  name: string = "help";
  data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows Help Menu.");
  async execute(interaction: ChatInputCommandInteraction) {
    interaction.reply({
      content: "Help is here",
    });
  }
}
