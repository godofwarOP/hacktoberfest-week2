import { resolve, parse } from "node:path";
import { readdirSync } from "node:fs";
import { EventInterface } from "../interfaces/EventInterface.js";
import { ClientInterface } from "../interfaces/ClientInterface.js";

export class EventLoader {
  public constructor(
    public client: ClientInterface,
    private eventsPath: string
  ) {}

  public async load() {
    this.client.logger.log("info", "Loading events");

    const files = readdirSync(this.eventsPath).filter((e) => e.endsWith(".js"));

    if (files.length === 0) throw new Error("No event files found");

    this.client.logger.log("info", `Found ${files.length} event files`);

    for (const file of files) {
      this.client.logger.log("info", `Reading ${file} file`);
      const filePath = resolve(this.eventsPath, file);

      import(filePath).then((data) => {
        const eventClass = data[parse(filePath).name];

        const eventClassObject = new eventClass() as EventInterface;

        this.client.on(eventClassObject.name as string, (...args) =>
          eventClassObject.execute(this.client, ...args)
        );
        this.client.logger.log("info", `Successfully imported ${file} event`);
      });
    }
  }
}
