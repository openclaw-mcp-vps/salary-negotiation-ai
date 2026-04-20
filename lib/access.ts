import crypto from "node:crypto";

import { ACCESS_COOKIE_MAX_AGE, ACCESS_COOKIE_NAME } from "@/lib/access-constants";

type AccessPayload = {
  email: string;
  purchaseId: string;
  issuedAt: number;
};

function getSecret() {
  return process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "local-development-secret";
}

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(message: string) {
  return crypto.createHmac("sha256", getSecret()).update(message).digest("hex");
}

export function createAccessToken(payload: AccessPayload) {
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(body);
  return `${body}.${signature}`;
}

export function verifyAccessToken(token: string) {
  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = sign(body);

  let matches = false;
  try {
    matches = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
  } catch {
    return null;
  }

  if (!matches) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as AccessPayload;
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
