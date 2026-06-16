import { randomBytes, randomUUID, scryptSync, createSign, createVerify } from "node:crypto";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { openSync, closeSync, readFileSync } from "node:fs";
import path from "node:path";

import type { RegisterPayload } from "@/lib/schemas";

type MockUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: RegisterPayload["role"];
  createdAt: string;
};

export const MOCK_SESSION_COOKIE = "mentora_session";
const storePath = path.join(process.cwd(), ".tmp", "mock-users.json");
const lockPath = path.join(process.cwd(), ".tmp", "mock-users.lock");

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

async function readUsers(): Promise<MockUser[]> {
  try {
    const file = await readFile(storePath, "utf8");
    return JSON.parse(file) as MockUser[];
  } catch (error: unknown) {
    const nodeError = error as { code?: string; message?: string };
    if (nodeError.code === "ENOENT") {
      return [];
    }
    throw new Error(`Failed to read user store: ${nodeError.message}`);
  }
}

export function readUsersSync(): MockUser[] {
  try {
    const file = readFileSync(storePath, "utf8");
    return JSON.parse(file) as MockUser[];
  } catch (error: unknown) {
    const nodeError = error as { code?: string };
    if (nodeError.code === "ENOENT") {
      return [];
    }
    return [];
  }
}

async function writeUsers(users: MockUser[]) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(users, null, 2), "utf8");
}

async function acquireLock(): Promise<() => Promise<void>> {
  await mkdir(path.dirname(storePath), { recursive: true });
  
  let attempts = 0;
  const maxAttempts = 100;
  while (attempts < maxAttempts) {
    try {
      const fd = openSync(lockPath, "wx");
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
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
  throw new Error("Could not acquire store lock after timeout");
}

export async function createMockUser(payload: RegisterPayload) {
  const releaseLock = await acquireLock();
  try {
    const users = await readUsers();
    const email = normalizeEmail(payload.email);
    const existingUser = users.find((user) => user.email === email);

    if (existingUser) {
      return { ok: false as const, reason: "EMAIL_EXISTS" as const };
    }

    const salt = randomBytes(16).toString("hex");
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
    return { ok: false as const, reason: "ACCOUNT_NOT_FOUND" as const };
  }

  if (user.passwordHash !== hashPassword(password, user.salt)) {
    return { ok: false as const, reason: "INVALID_PASSWORD" as const };
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

export async function readMockUserById(id: string): Promise<{ id: string; name: string; email: string; role: RegisterPayload["role"] } | null> {
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

export function verifySession(token: string): string | null {
  const secret = process.env.SESSION_SECRET ?? process.env.AUTH_SECRET ?? "mentora-local-dev-secret";
  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }
  const [userId, signature] = parts;
  try {
    const isValid = createVerify("sha256")
      .update(userId)
      .verify(secret, signature, "base64");
    return isValid ? userId : null;
  } catch {
    return null;
  }
}

export function signSession(userId: string): string {
  const secret = process.env.SESSION_SECRET ?? process.env.AUTH_SECRET ?? "mentora-local-dev-secret";
  const signature = createSign("sha256").update(userId).sign(secret, "base64");
  return `${userId}.${signature}`;
}

export function isUserIdValidSync(id: string): boolean {
  const users = readUsersSync();
  return users.some((user) => user.id === id);
}