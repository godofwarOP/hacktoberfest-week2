import { Client, Collection } from "discord.js";
import { CommandInterface } from "./CommandInterface";

type commands = {
  commands: Collection<string, CommandInterface>;
};

export interface ClientInterface extends Client, commands {}
