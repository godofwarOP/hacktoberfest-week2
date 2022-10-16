import { Client } from "discord.js";
import { resolve, parse } from "node:path";
import { readdir } from "node:fs";
import { EventInterface } from "../interfaces/EventInterface.js";
import { ClientInterface } from "../interfaces/ClientInterface.js";

export class EventLoader {
  public constructor(
    public client: ClientInterface,
    private eventsPath: string
  ) {}

  public async load() {
    readdir(this.eventsPath, async (err, files) => {
      const filteredEventFiles = files.filter((e) => e.endsWith(".js"));
      for (const file of filteredEventFiles) {
        const filePath = resolve(this.eventsPath, file);
        const importedFile = await import(filePath);
        const eventClass = importedFile[parse(filePath).name];
        const eventClassObject = new eventClass() as EventInterface;
        this.client.on(eventClassObject.name, (...args) =>
          eventClassObject.execute(this.client, ...args)
        );
      }
    });
  }
}
