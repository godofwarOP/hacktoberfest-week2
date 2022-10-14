import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import { readdirSync } from "node:fs";
import { resolve, parse } from "node:path";
import { CommandInterface } from "../interfaces/CommandInterface";
import { ClientInterface } from "../interfaces/ClientInterface";

export class CommandLoader {
  private globalCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
    [];
  public constructor(private commandsPath: string) {}

  public async load(client: ClientInterface) {
    const subFolders = readdirSync(resolve("dist", this.commandsPath));

    if (!subFolders) throw new Error("No commands folder found!");

    for (const folder of subFolders) {
      const files = readdirSync(
        resolve("dist", this.commandsPath, folder)
      ).filter((file) => file.endsWith(".js"));

      if (!files) throw new Error("No files found!");

      for (const file of files) {
        const importedFile = await import(
          resolve("dist", "commands", folder, file)
        );

        const importedClass =
          importedFile[parse(resolve("dist", "commands", folder, file)).name];

        const object = new importedClass() as CommandInterface;

        client.commands.set(object.name, object);

        this.globalCommands.push(object.data.toJSON());
      }
    }

    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);
    rest
      .put(
        Routes.applicationGuildCommands(
          "860507365275074570",
          "985799144163672064"
        ),
        {
          body: this.globalCommands,
        }
      )
      .then(() => {
        console.log("Successfully registered commands");
      });
  }
}
