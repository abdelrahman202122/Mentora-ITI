import { createHash } from 'crypto';

export const emailHash = (
  email: string
): string =>
  createHash('sha256')
    .update(email.toLowerCase())
    .digest('hex')
    .slice(0, 12);