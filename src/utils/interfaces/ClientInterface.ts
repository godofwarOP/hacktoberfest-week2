import { Client, Collection } from "discord.js";
import { Config } from "../../config/index.js";
import { Utils } from "../functions/index.js";
import { CommandInterface } from "./CommandInterface.js";

type commands = {
  utils: Utils;
  config: Config;
  commands: Collection<string, CommandInterface>;
};

export interface ClientInterface extends Client, commands {}
