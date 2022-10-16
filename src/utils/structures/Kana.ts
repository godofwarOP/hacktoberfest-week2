import { Client, Collection } from "discord.js";
import { resolve, parse } from "node:path";
import { Config } from "../../config/index.js";
import { Utils } from "../functions/index.js";
import { CommandInterface } from "../interfaces/CommandInterface.js";
import { CommandLoader } from "./CommandLoader.js";
import { EventLoader } from "./EventLoader.js";

export class Kana extends Client {
  public readonly events = new EventLoader(this, resolve("dist", "events"));
  public readonly commandLoader = new CommandLoader(this, "commands");
  public static instance: Kana;
  public commands: Collection<string, CommandInterface>;
  public config = new Config();
  public utils = new Utils();

  public constructor() {
    super({
      intents: ["GuildMessages"],
    });
    this.commands = new Collection<string, CommandInterface>();
  }

  public async start() {
    await this.commandLoader.load();
    await this.events.load();
    this.login(this.config.token);
  }
}
