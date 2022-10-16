import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import { readdirSync } from "node:fs";
import { resolve, parse } from "node:path";
import { CommandInterface } from "../interfaces/CommandInterface.js";
import { ClientInterface } from "../interfaces/ClientInterface.js";

export class CommandLoader {
  private globalCommands: RESTPostAPIChatInputApplicationCommandsJSONBody[] =
    [];
  public constructor(
    public client: ClientInterface,
    private commandsPath: string
  ) {}

  public async load() {
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

        this.client.commands.set(object.name, object);

        this.globalCommands.push(object.data.toJSON());
      }
    }

    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);
    if (process.env.NODE_ENV === "development") {
      console.log("Running in Development mode");
      rest
        .put(
          Routes.applicationGuildCommands(
            this.client.config.applicationId,
            this.client.config.guildId
          ),
          {
            body: this.globalCommands,
          }
        )
        .then(() => {
          console.log("Successfully registered guild commands");
        });
    } else {
      console.log("Running in Production mode");
      rest
        .put(Routes.applicationCommands(this.client.user?.id!), {
          body: this.globalCommands,
        })
        .then(() => {
          console.log("Successfully registered global commands");
        });
    }
  }
}
