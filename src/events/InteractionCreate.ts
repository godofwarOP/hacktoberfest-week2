import { ChatInputCommandInteraction, Client, Interaction } from "discord.js";
import { ClientInterface } from "../utils/interfaces/ClientInterface";
import { EventInterface } from "../utils/interfaces/EventInterface";
import { Instance as Kana } from "../utils/structures/Kana";

export class InteractionCreate implements EventInterface {
  public name: string = "interactionCreate";
  public async execute(client: ClientInterface, ...args: any[]) {
    const instance = Kana;
    const interaction = args[0] as ChatInputCommandInteraction;

    if (!interaction.isChatInputCommand()) return;

    const command = Kana.commands.get(interaction.commandName);

    if (!command) {
      interaction.reply({
        ephemeral: true,
        isMessage: true,
        content: "🛑 Command not found",
      });
      return;
    }

    try {
      await command.execute(interaction);
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
