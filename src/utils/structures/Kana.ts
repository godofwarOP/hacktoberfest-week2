import { Client, Collection } from "discord.js";
import { resolve, parse } from "node:path";
import { CommandInterface } from "../interfaces/CommandInterface";
import { CommandLoader } from "./CommandLoader";
import { EventLoader } from "./EventLoader";

class Kana extends Client {
  public readonly eventLoader = new EventLoader(resolve("dist", "events"));
  public readonly commandLoader = new CommandLoader("commands");
  public static instance: Kana;
  public commands;

  private constructor() {
    super({
      intents: ["GuildMessages"],
    });
    this.commands = new Collection<string, CommandInterface>();
  }

  public static getInstance(): Kana {
    if (!this.instance) {
      this.instance = new Kana();
    }
    return this.instance;
  }

  public async start(token: string) {
    await this.commandLoader.load(this);
    await this.eventLoader.load(this);
    this.login(token);
  }
}

export const Instance = Kana.getInstance();
