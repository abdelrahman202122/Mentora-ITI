import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'crypto';
import { customAlphabet } from 'nanoid';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const ENCRYPTED_PREFIX = 'enc:';

function getEncryptionKey(): Buffer {
  const secret =
    process.env.CONFIRMATION_CODE_SECRET ??
    process.env.JWT_ACCESS_SECRET ??
    'mentora-dev-confirmation-code-secret';

  return scryptSync(secret, 'mentora-confirmation-code', 32);
}

/**
 * Generate a random 8-character confirmation code.
 */
export function generateConfirmationCode(): string {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@&*$';
  const nanoid = customAlphabet(alphabet, 8);
  return nanoid();
}

/**
 * Encrypt a plain confirmation code for storage.
 */
export function encryptConfirmationCode(plainCode: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plainCode, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, authTag, encrypted]).toString('base64');

  return `${ENCRYPTED_PREFIX}${payload}`;
}

/**
 * Decrypt a stored confirmation code for learner/admin responses.
 */
export function decryptConfirmationCode(storedCode: string): string {
  if (!storedCode.startsWith(ENCRYPTED_PREFIX)) {
    return storedCode;
  }

  const payload = storedCode.slice(ENCRYPTED_PREFIX.length);
  const buffer = Buffer.from(payload, 'base64');
  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString('utf8');
}

/**
 * Compare a learner-provided code with the stored encrypted value.
 */
export function isConfirmationCodeMatch(
  plainCode: string,
  storedCode: string,
): boolean {
  const storedPlain = decryptConfirmationCode(storedCode);
  const provided = Buffer.from(plainCode);
  const stored = Buffer.from(storedPlain);

  if (provided.length !== stored.length) {
    return false;
  }

  return timingSafeEqual(provided, stored);
}

/**
 * Returns true when the value is already encrypted for storage.
 */
export function isEncryptedConfirmationCode(value: string): boolean {
  return value.startsWith(ENCRYPTED_PREFIX);
}
