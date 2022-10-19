import { createLogger, format, transports, Logger } from "winston";

enum LoggingLevels {
  warn = "WARN",
  info = "INFO",
  error = "ERROR",
}

export class CustomLogger {
  winston: Logger | null = null;
  constructor(private folderPath: string) {
    this.createLogger();
  }

  private createLogger() {
    this.winston = createLogger({
      level: "info",
      format: format.combine(
        format.timestamp(),
        format.prettyPrint(),
        format.simple()
      ),
      transports: [
        new transports.File({
          level: "info",
          filename: this.folderPath + "/info.log",
        }),
        new transports.File({
          level: "error",
          filename: this.folderPath + "/error.log",
        }),
        new transports.Console({
          format: format.simple(),
        }),
      ],
    });
  }

  public log(level: keyof typeof LoggingLevels, message: string) {
    this.winston![level](`${level.toUpperCase()}::${message}`);
  }

  private test() {
    this.log("warn", "Warning::method embed.setColor is deprecated!");
    this.log("error", "Error::method embed.setColor is undefined");
    this.log("info", "Info::Kana joined a new server with 69 memebers!");
  }
}
