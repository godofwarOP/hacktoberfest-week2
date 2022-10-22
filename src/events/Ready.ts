import { ActivityType, Client, Events, TextChannel } from "discord.js";
import { ClientInterface } from "../utils/interfaces/ClientInterface.js";
import { EventInterface } from "../utils/interfaces/EventInterface.js";

export class Ready implements EventInterface {
  public name = Events.ClientReady;
  execute(client: ClientInterface, ...args: any[]) {
    client.logger.log("info", `Client ${client.user?.username} is now ready!`);
    client.user?.setPresence({
      activities: [
        {
          name: "/help",
          type: ActivityType.Listening,
        },
      ],
    });
    this.sendAcknowledgementMessage(client, "✅ Bot is now online!");
  }

  private async sendAcknowledgementMessage(
    client: ClientInterface,
    message: string
  ) {
    try {
      if (client.config.logsChannelId) {
        const mainGuild = await client.guilds.fetch(client.config.guildId);
        if (!mainGuild) {
          throw new Error("Main Guild not found");
        }
        const logChannel = (await mainGuild.channels.fetch(
          client.config.logsChannelId,
          { cache: true }
        )) as TextChannel;
        client.logger.log("info", "Sending an acknowledgement message");
        logChannel.send(message);
      }
    } catch (error) {
      throw error;
    }
  }
}
