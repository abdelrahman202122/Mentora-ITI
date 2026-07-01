import type { AuthPayload } from '../modules/users/user.interface.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
