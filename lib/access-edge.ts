import { ACCESS_COOKIE_MAX_AGE } from "@/lib/access-constants";

type AccessPayload = {
  email: string;
  purchaseId: string;
  issuedAt: number;
};

function getSecret() {
  return process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "local-development-secret";
}

function base64UrlToString(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(normalized + padding);
}

function hexToBytes(hex: string) {
  if (hex.length % 2 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const value = Number.parseInt(hex.slice(i, i + 2), 16);
    if (Number.isNaN(value)) {
      return null;
    }
    bytes[i / 2] = value;
  }

  return bytes;
}

async function verifyHmacHex(message: string, signatureHex: string) {
  const signatureBytes = hexToBytes(signatureHex);
  if (!signatureBytes) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  return crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    new TextEncoder().encode(message),
  );
}

export async function verifyAccessTokenEdge(token: string) {
  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const valid = await verifyHmacHex(body, signature);
  if (!valid) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlToString(body)) as AccessPayload;
    if (!payload.email || !payload.purchaseId || !payload.issuedAt) {
      return null;
    }

    const age = Date.now() - payload.issuedAt;
    if (age > ACCESS_COOKIE_MAX_AGE * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
