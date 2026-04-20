import crypto from "node:crypto";
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
  };
  data?: {
    id?: string;
    attributes?: {
      identifier?: string;
      user_email?: string;
      status?: string;
      first_order_item?: {
        product_id?: number;
      };
      created_at?: string;
      updated_at?: string;
    };
  };
};

let initialized = false;

export function setupLemonSqueezySdkIfConfigured() {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey || initialized) {
    return;
  }

  lemonSqueezySetup({ apiKey });
  initialized = true;
}

export function getCheckoutUrl() {
  const raw = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
  if (!raw) {
    return null;
  }

  if (/^https?:\/\//.test(raw)) {
    return raw;
  }

  return `https://checkout.lemonsqueezy.com/buy/${raw}`;
}

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }

  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

export function normalizeWebhookPayload(payload: LemonWebhookPayload) {
  const event = payload.meta?.event_name ?? "unknown";
  const orderId = payload.data?.attributes?.identifier ?? payload.data?.id ?? "";
  const email = payload.data?.attributes?.user_email ?? "";
  const productId = String(payload.data?.attributes?.first_order_item?.product_id ?? "unknown");

  if (!orderId || !email) {
    return null;
  }

  const status = payload.data?.attributes?.status?.toLowerCase();
  const normalizedStatus =
    status === "paid" || status === "refunded" ? status : "unknown";

  return {
    event,
    id: payload.data?.id ?? orderId,
    orderId,
    email,
    productId,
    status: normalizedStatus as "paid" | "refunded" | "unknown",
    createdAt: payload.data?.attributes?.created_at,
    updatedAt: payload.data?.attributes?.updated_at,
  };
}
