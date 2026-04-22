import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

interface PaymentRecord {
  email: string;
  createdAt: string;
  source: string;
  eventId?: string;
}

interface AccessSession {
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

interface DatabaseSchema {
  payments: PaymentRecord[];
  sessions: AccessSession[];
}

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "payments.json");

let writeQueue: Promise<void> = Promise.resolve();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function ensureDataFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dbPath);
  } catch {
    const initial: DatabaseSchema = { payments: [], sessions: [] };
    await fs.writeFile(dbPath, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readDb(): Promise<DatabaseSchema> {
  await ensureDataFile();

  const content = await fs.readFile(dbPath, "utf8");
  const parsed = JSON.parse(content) as Partial<DatabaseSchema>;

  return {
    payments: Array.isArray(parsed.payments) ? parsed.payments : [],
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : []
  };
}

async function writeDb(nextState: DatabaseSchema) {
  const tempPath = `${dbPath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(nextState, null, 2), "utf8");
  await fs.rename(tempPath, dbPath);
}

async function withWriteLock<T>(operation: () => Promise<T>): Promise<T> {
  let result: T | undefined;

  writeQueue = writeQueue.then(async () => {
    result = await operation();
  });

  await writeQueue;

  if (typeof result === "undefined") {
    throw new Error("Write operation failed");
  }

  return result;
}

export async function markEmailAsPaid(params: {
  email: string;
  source: string;
  eventId?: string;
}) {
  return withWriteLock(async () => {
    const db = await readDb();
    const normalizedEmail = normalizeEmail(params.email);

    const existing = db.payments.find((item) => item.email === normalizedEmail);

    if (!existing) {
      db.payments.push({
        email: normalizedEmail,
        source: params.source,
        eventId: params.eventId,
        createdAt: new Date().toISOString()
      });
    }

    await writeDb(db);
    return true;
  });
}

export async function hasPaidEmail(email: string) {
  const db = await readDb();
  const normalizedEmail = normalizeEmail(email);
  return db.payments.some((item) => item.email === normalizedEmail);
}

function pruneExpiredSessions(sessions: AccessSession[]) {
  const now = Date.now();
  return sessions.filter((session) => Date.parse(session.expiresAt) > now);
}

export async function createAccessSession(email: string) {
  return withWriteLock(async () => {
    const db = await readDb();

    db.sessions = pruneExpiredSessions(db.sessions);

    const token = crypto.randomUUID().replaceAll("-", "");
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 90);

    db.sessions.push({
      token,
      email: normalizeEmail(email),
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString()
    });

    await writeDb(db);
    return token;
  });
}

export async function hasAccessSession(token: string) {
  const db = await readDb();
  const activeSessions = pruneExpiredSessions(db.sessions);

  if (activeSessions.length !== db.sessions.length) {
    await withWriteLock(async () => {
      const refreshed = await readDb();
      refreshed.sessions = pruneExpiredSessions(refreshed.sessions);
      await writeDb(refreshed);
      return true;
    });
  }

  return activeSessions.some((session) => session.token === token);
}
