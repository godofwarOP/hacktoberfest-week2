import { ChatInputCommandInteraction, Client, Interaction } from "discord.js";
import { ClientInterface } from "../utils/interfaces/ClientInterface";
import { EventInterface } from "../utils/interfaces/EventInterface";
import { Kana } from "../utils/structures/Kana";

export class InteractionCreate implements EventInterface {
  public name: string = "interactionCreate";
  public async execute(client: ClientInterface, ...args: any[]) {
    const interaction = args[0] as ChatInputCommandInteraction;

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      interaction.reply({
        ephemeral: true,
        isMessage: true,
        content: "🛑 Command not found",
      });
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      interaction.reply({
        ephemeral: true,
        isMessage: true,
        content:
          "There was an error while executing this command. Please try again later!",
      });
    }
  }
}
