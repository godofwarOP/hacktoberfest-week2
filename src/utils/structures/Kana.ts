import { Client, Collection } from "discord.js";
import { resolve, parse } from "node:path";
import { CommandInterface } from "../interfaces/CommandInterface";
import { CommandLoader } from "./CommandLoader";
import { EventLoader } from "./EventLoader";

export class Kana extends Client {
  public readonly events = new EventLoader(this, resolve("dist", "events"));
  public readonly commandLoader = new CommandLoader(this, "commands");
  public static instance: Kana;
  public commands: Collection<string, CommandInterface>;

  public constructor() {
    super({
      intents: ["GuildMessages"],
    });
    this.commands = new Collection<string, CommandInterface>();
  }

  public async start(token: string) {
    await this.commandLoader.load();
    await this.events.load();
    this.login(token);
  }
}
