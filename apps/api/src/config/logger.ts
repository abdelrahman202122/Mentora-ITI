import winston from "winston";
import fs from "fs";

const logDir = "logs";

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const { combine, timestamp, printf, json, colorize } = winston.format;

// Console format (human-readable)
const consoleFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`;
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",

  transports: [
    // Console logs (development)
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), consoleFormat),
    }),

    // Error logs file
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: "error",
      format: combine(timestamp(), json()),

      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    }),

    // All logs file
    new winston.transports.File({
      filename: `${logDir}/combined.log`,
      format: combine(timestamp(), json()),
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    }),
  ],
});