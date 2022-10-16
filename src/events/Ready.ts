import { ActivityType, Client } from "discord.js";
import { EventInterface } from "../utils/interfaces/EventInterface.js";

export class Ready implements EventInterface {
  public name = "ready";
  execute(client: Client, ...args: any[]) {
    console.log(`${client.user?.username} is ready!`);
    client.user?.setPresence({
      activities: [
        {
          name: "/help",
          type: ActivityType.Listening,
        },
      ],
    });
  }
}
