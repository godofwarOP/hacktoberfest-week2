import { Client } from "discord.js";
import { resolve, parse } from "node:path";
import { readdir } from "node:fs";
import { EventInterface } from "../interfaces/EventInterface";
import { ClientInterface } from "../interfaces/ClientInterface";

export class EventLoader {
  public constructor(private eventsPath: string) {}

  public async load(client: ClientInterface) {
    readdir(this.eventsPath, async (err, files) => {
      const filteredEventFiles = files.filter((e) => e.endsWith(".js"));
      for (const file of filteredEventFiles) {
        const filePath = resolve(this.eventsPath, file);
        const importedFile = await import(filePath);
        const eventClass = importedFile[parse(filePath).name];
        const eventClassObject = new eventClass() as EventInterface;
        client.on(eventClassObject.name, (...args) =>
          eventClassObject.execute(client, ...args)
        );
      }
    });
  }
}