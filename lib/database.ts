import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type PurchaseRecord = {
  id: string;
  orderId: string;
  email: string;
  productId: string;
  status: "paid" | "refunded" | "unknown";
  source: "lemonsqueezy";
  createdAt: string;
  updatedAt: string;
};

type DbShape = {
  purchases: PurchaseRecord[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "purchases.json");

async function ensureDbFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DB_FILE, "utf8");
  } catch {
    await writeFile(DB_FILE, JSON.stringify({ purchases: [] satisfies PurchaseRecord[] }, null, 2), "utf8");
  }
}

async function readDb(): Promise<DbShape> {
  await ensureDbFile();
  const content = await readFile(DB_FILE, "utf8");
  return JSON.parse(content) as DbShape;
}

async function writeDb(payload: DbShape) {
  await writeFile(DB_FILE, JSON.stringify(payload, null, 2), "utf8");
}

export async function upsertPurchase(
  next: Omit<PurchaseRecord, "createdAt" | "updatedAt">,
) {
  const db = await readDb();
  const now = new Date().toISOString();

  const existingIndex = db.purchases.findIndex(
    (item) => item.orderId === next.orderId || item.email.toLowerCase() === next.email.toLowerCase(),
  );

  if (existingIndex >= 0) {
    const existing = db.purchases[existingIndex];
    db.purchases[existingIndex] = {
      ...existing,
      ...next,
      email: next.email.toLowerCase(),
      updatedAt: now,
    };
    await writeDb(db);
    return db.purchases[existingIndex];
  }

  const record: PurchaseRecord = {
    ...next,
    email: next.email.toLowerCase(),
    createdAt: now,
    updatedAt: now,
  };

  db.purchases.push(record);
  await writeDb(db);

  return record;
}

export async function findPurchaseByEmail(email: string) {
  const db = await readDb();
  return db.purchases.find((item) => item.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function findPurchaseByOrderId(orderId: string) {
  const db = await readDb();
  return db.purchases.find((item) => item.orderId === orderId) ?? null;
}
