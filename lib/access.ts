import crypto from "node:crypto";

export const ACCESS_COOKIE_NAME = "snai_access";

function getSigningSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || "local-dev-cookie-secret";
}

export function signAccessToken(token: string) {
  const signature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(token)
    .digest("hex");

  return `${token}.${signature}`;
}

export function verifySignedAccessToken(signedValue: string | undefined) {
  if (!signedValue) {
    return null;
  }

  const [token, signature] = signedValue.split(".");

  if (!token || !signature) {
    return null;
  }

  const expectedSignature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(token)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const actualBuffer = Buffer.from(signature, "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  return token;
}
