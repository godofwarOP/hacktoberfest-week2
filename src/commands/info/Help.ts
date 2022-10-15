import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  bold,
  PermissionFlagsBits,
  ToAPIApplicationCommandOptions,
  codeBlock,
  APIApplicationCommandOption,
} from "discord.js";
import { createEmbed } from "../../utils/functions/createEmbed";
import { ClientInterface } from "../../utils/interfaces/ClientInterface";
import { CommandInterface } from "../../utils/interfaces/CommandInterface";

export class Help implements CommandInterface {
  name: string = "help";
  category = "info";
  data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows list of available commands.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("command you want help for")
        .setRequired(false)
    );

  async execute(
    interaction: ChatInputCommandInteraction,
    client: ClientInterface
  ) {
    const embed = createEmbed({
      author: {
        name: `${client.user?.username}`,
        iconURL: client.user?.avatarURL({ size: 128 }) as string | undefined,
      },
      timestamp: true,
      color: "#6ad8ef",
      thumbnail: {
        url: client.user?.avatarURL({ size: 128 }) as string,
      },
      footer: {
        text: "/help <command> to get more information on a specific command",
      },
    });

    if (interaction.options.data.length > 0) {
      const optionName = interaction.options.getString("command")!;
      const optionInCollection = client.commands.get(optionName);

      if (!optionInCollection) {
        interaction.reply({
          content: "🛑 Command not found",
        });
        return;
      }
      embed.setTitle(
        `Extra Information About ${this.PascalCase(
          optionInCollection.name
        )} Command`
      );
      embed.setAuthor({
        name: `${client.user?.username}`,
        iconURL: client.user?.avatarURL({ size: 128 }) as string | undefined,
      });
      embed.addFields([
        {
          name: "Name",
          value: bold(`\`${optionInCollection.name}\``),
        },
        {
          name: "Description",
          value: bold(`\`${optionInCollection.data.description}\``),
        },
        {
          name: "Category",
          value: bold(`\`${this.PascalCase(optionInCollection.category)}\``),
        },
        {
          name: "Extra Options",
          value: bold(
            optionInCollection.data.options.length === 0
              ? "None"
              : codeBlock(this.resolveOptions(optionInCollection.data.options))
          ),
        },
      ]);

      interaction.reply({
        embeds: [embed],
      });
      return;
    }

    embed.setTitle("Available Commands");

    const commandsMap = new Map<string, string[]>();
    client.commands.forEach((e) => {
      if (commandsMap.has(e.category)) {
        commandsMap.set(e.category, [...commandsMap.get(e.category)!, e.name]);
      } else {
        commandsMap.set(e.category, [e.name]);
      }
    });

    commandsMap.forEach((value, key) => {
      embed.addFields({
        name: this.PascalCase(key),
        value: bold(codeBlock(value.join(", "))),
      });
    });

    interaction.reply({
      embeds: [embed],
    });
  }

  PascalCase(word: string) {
    return word[0].toUpperCase() + word.slice(1, word.length);
  }

  resolveOptions(options: ToAPIApplicationCommandOptions[]) {
    return options
      .map((option, index) => {
        const json: APIApplicationCommandOption = option.toJSON();
        const e = {
          name: json.name,
          description: json.description,
          isRequired: json.required ? "Yes" : "No",
        };
        return `${++index}. Name:- ${e.name}\nDescription:- ${
          e.description
        }\nRequired:- ${e.isRequired}`;
      })
      .join("\n\n");
  }
}
