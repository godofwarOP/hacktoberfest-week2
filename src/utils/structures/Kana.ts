import { Client, Collection } from "discord.js";
import { resolve, parse } from "node:path";
import { CustomLogger } from "./Logger.js";
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
  public logger = new CustomLogger("logs");

  public constructor() {
    super({
      intents: ["GuildMessages"],
    });
    this.commands = new Collection<string, CommandInterface>();
  }

  public async start() {
    try {
      this.config.init(this);
      await this.commandLoader.load();
      await this.events.load();
      this.login(this.config.token);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.log("error", error.message);
      }
    }
  }
}
