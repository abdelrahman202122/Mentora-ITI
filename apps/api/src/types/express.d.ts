/* eslint-disable @typescript-eslint/consistent-type-imports */
import { AuthPayload } from "../modules/users/user.interface.ts";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}