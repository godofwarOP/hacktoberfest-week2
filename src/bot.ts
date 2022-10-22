import { Kana } from "./utils/structures/Kana.js";

const kana = new Kana();
kana.start();

process.on("SIGINT", async () => {
  kana.logger.log("info", `Terminating process`);
  kana.logger.terminateLogger();
  kana.destroy();
  process.exit(0);
});
