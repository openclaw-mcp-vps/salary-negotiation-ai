import { NextResponse } from "next/server";

import { upsertPurchase } from "@/lib/database";
import {
  normalizeWebhookPayload,
  setupLemonSqueezySdkIfConfigured,
  verifyWebhookSignature,
} from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
    return NextResponse.json(
      {
        error: "LEMON_SQUEEZY_WEBHOOK_SECRET is not configured.",
      },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as unknown;
  const normalized = normalizeWebhookPayload(payload as never);

  if (!normalized) {
    return NextResponse.json({ received: true, ignored: true });
  }

  setupLemonSqueezySdkIfConfigured();

  const paidEvents = new Set([
    "order_created",
    "order_paid",
    "subscription_payment_success",
  ]);

  const refundedEvents = new Set(["order_refunded", "subscription_refunded"]);

  const status = refundedEvents.has(normalized.event)
    ? "refunded"
    : paidEvents.has(normalized.event)
      ? "paid"
      : normalized.status;

  await upsertPurchase({
    id: normalized.id,
    orderId: normalized.orderId,
    email: normalized.email,
    productId: normalized.productId,
    status,
    source: "lemonsqueezy",
  });

  return NextResponse.json({ received: true });
}
