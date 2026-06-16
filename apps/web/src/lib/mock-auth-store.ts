import {
  createHmac,
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { mkdir, readFile, writeFile, unlink, rename } from 'node:fs/promises';
import { openSync, closeSync, readFileSync } from 'node:fs';
import path from 'node:path';

import type { RegisterPayload } from '@/lib/schemas';

type MockUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: RegisterPayload['role'];
  createdAt: string;
};

export const MOCK_SESSION_COOKIE = 'mentora_session';
const storePath = path.join(process.cwd(), '.tmp', 'mock-users.json');
const lockPath = path.join(process.cwd(), '.tmp', 'mock-users.lock');

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString('hex');
}

async function readUsers(): Promise<MockUser[]> {
  try {
    const file = await readFile(storePath, 'utf8');
    return JSON.parse(file) as MockUser[];
  } catch (error: unknown) {
    const nodeError = error as { code?: string; message?: string };
    if (nodeError.code === 'ENOENT') {
      return [];
    }
    throw new Error(`Failed to read user store: ${nodeError.message}`);
  }
}

export function readUsersSync(): MockUser[] {
  try {
    const file = readFileSync(storePath, 'utf8');
    return JSON.parse(file) as MockUser[];
  } catch (error: unknown) {
    const nodeError = error as { code?: string };
    if (nodeError.code === 'ENOENT') {
      return [];
    }
    return [];
  }
}

async function writeUsers(users: MockUser[]) {
  await mkdir(path.dirname(storePath), { recursive: true });
  const tempPath = `${storePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(tempPath, JSON.stringify(users, null, 2), 'utf8');
  await rename(tempPath, storePath);
}

async function acquireLock(): Promise<() => Promise<void>> {
  await mkdir(path.dirname(storePath), { recursive: true });

  let attempts = 0;
  const maxAttempts = 100;
  while (attempts < maxAttempts) {
    try {
      const fd = openSync(lockPath, 'wx');
      closeSync(fd);
      return async () => {
        try {
          await unlink(lockPath);
        } catch {
          // lock already released
        }
      };
    } catch {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
  throw new Error('Could not acquire store lock after timeout');
}

export async function createMockUser(payload: RegisterPayload) {
  const releaseLock = await acquireLock();
  try {
    const users = await readUsers();
    const email = normalizeEmail(payload.email);
    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      return { ok: false as const, reason: 'EMAIL_EXISTS' as const };
    }

    const salt = randomBytes(16).toString('hex');
    const user: MockUser = {
      id: randomUUID(),
      name: payload.name.trim(),
      email,
      passwordHash: hashPassword(payload.password, salt),
      salt,
      role: payload.role,
      createdAt: new Date().toISOString(),
    };

    await writeUsers([...users, user]);

    return {
      ok: true as const,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } finally {
    await releaseLock();
  }
}

export async function verifyMockUser(emailInput: string, password: string) {
  const users = await readUsers();
  const email = normalizeEmail(emailInput);
  const user = users.find((item) => item.email === email);

  if (!user) {
    return { ok: false as const, reason: 'ACCOUNT_NOT_FOUND' as const };
  }

  if (user.passwordHash !== hashPassword(password, user.salt)) {
    return { ok: false as const, reason: 'INVALID_PASSWORD' as const };
  }

  return {
    ok: true as const,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function readMockUserById(
  id: string,
): Promise<{
  id: string;
  name: string;
  email: string;
  role: RegisterPayload['role'];
} | null> {
  const users = await readUsers();
  const user = users.find((item) => item.id === id);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET ?? process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET or AUTH_SECRET must be set in production');
  }
  return secret ?? 'mentora-local-dev-secret';
}

function signValue(value: string): string {
  return createHmac('sha256', getSessionSecret())
    .update(value)
    .digest('base64url');
}

export function verifySession(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [userId, expiresAt, signature] = parts;
  const expiresAtMs = Number(expiresAt);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
    return null;
  }

  const payload = `${userId}.${expiresAt}`;
  try {
    const expectedSignature = signValue(payload);
    const actual = Buffer.from(signature, 'utf8');
    const expected = Buffer.from(expectedSignature, 'utf8');
    if (actual.length !== expected.length) {
      return null;
    }
    if (!timingSafeEqual(actual, expected)) {
      return null;
    }
    return userId;
  } catch {
    return null;
  }
}

export function signSession(userId: string): string {
  const expiresAt = (Date.now() + SESSION_MAX_AGE_MS).toString();
  const payload = `${userId}.${expiresAt}`;
  const signature = signValue(payload);
  return `${payload}.${signature}`;
}

export function isUserIdValidSync(id: string): boolean {
  const users = readUsersSync();
  return users.some((user) => user.id === id);
}
