import fetch from "node-fetch";

export class Config {
  fetch = fetch;
  public token: string = "";
  public trackerggApiKey: string = "";
  public guildId: string = "";
  public applicationId: string = "";

  public constructor() {
    this.init();
  }

  loadEnvVariables() {
    if (!process.env.BOT_TOKEN)
      throw new Error(
        "Bot token is missing, did you forget to set it as env variable?"
      );
    if (!process.env.TRACKERGG_API_KEY)
      throw new Error(
        "Trackergg API key is missing, did you forget to set it as env variable?"
      );

    if (!process.env.APPLICATION_ID)
      throw new Error(
        "Application Id is missing, did you forget to set it as env variable?"
      );

    if (process.env.NODE_ENV === "development") {
      if (!process.env.GUILD_ID)
        throw new Error(
          "Guild Id is missing, did you forget to set it as env variable?"
        );
      this.guildId = process.env.GUILD_ID;
    }

    this.token = process.env.BOT_TOKEN;
    this.trackerggApiKey = process.env.TRACKERGG_API_KEY;
    this.applicationId = process.env.APPLICATION_ID;
  }

  init() {
    this.loadEnvVariables();
  }
}
