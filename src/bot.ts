import { Kana } from "./utils/structures/Kana.js";

const kana = new Kana();
kana.start();

process.on("SIGTERM", () => {});
