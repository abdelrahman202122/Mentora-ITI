import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { RegisterPayload } from "@/lib/schemas";

type MockUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: RegisterPayload["role"];
  createdAt: string;
};

const storePath = path.join(process.cwd(), ".tmp", "mock-users.json");

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const secret = process.env.AUTH_SECRET ?? "mentora-local-dev-secret";

  return createHash("sha256").update(`${secret}:${password}`).digest("hex");
}

async function readUsers(): Promise<MockUser[]> {
  try {
    const file = await readFile(storePath, "utf8");
    return JSON.parse(file) as MockUser[];
  } catch {
    return [];
  }
}

async function writeUsers(users: MockUser[]) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(users, null, 2));
}

export async function createMockUser(payload: RegisterPayload) {
  const users = await readUsers();
  const email = normalizeEmail(payload.email);
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return { ok: false as const, reason: "EMAIL_EXISTS" as const };
  }

  const user: MockUser = {
    id: randomUUID(),
    name: payload.name.trim(),
    email,
    passwordHash: hashPassword(payload.password),
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
}

export async function verifyMockUser(emailInput: string, password: string) {
  const users = await readUsers();
  const email = normalizeEmail(emailInput);
  const user = users.find((item) => item.email === email);

  if (!user) {
    return { ok: false as const, reason: "ACCOUNT_NOT_FOUND" as const };
  }

  if (user.passwordHash !== hashPassword(password)) {
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
