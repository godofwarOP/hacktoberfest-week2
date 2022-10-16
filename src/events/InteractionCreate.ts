import { ChatInputCommandInteraction, Client, Interaction } from "discord.js";
import { ClientInterface } from "../utils/interfaces/ClientInterface.js";
import { EventInterface } from "../utils/interfaces/EventInterface.js";

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
      console.log(error);
      if (error instanceof Error) {
        interaction.reply({
          ephemeral: true,
          isMessage: true,
          content: `🛑 ${error.message}`,
        });
      } else {
        interaction.reply({
          ephemeral: true,
          isMessage: true,
          content:
            "🛑 There was an error while executing this command. Please try again later!",
        });
      }
    }
  }
}
