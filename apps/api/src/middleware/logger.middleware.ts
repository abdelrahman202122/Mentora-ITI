import morgan from "morgan";
import { logger } from "../config/logger.js";

// Send HTTP logs to Winston
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export const httpLogger = morgan("combined", { stream });