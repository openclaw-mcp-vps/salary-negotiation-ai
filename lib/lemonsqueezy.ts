import Stripe from "stripe";

// Route kept at /api/webhooks/lemonsqueezy for backward compatibility,
// but payment processing is handled through Stripe events.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

export function constructStripeEvent(payload: string, signature: string | null) {
  if (!signature) {
    throw new Error("Missing Stripe signature header");
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return stripe.webhooks.constructEvent(payload, signature, secret);
}

export function extractPaidEmail(event: Stripe.Event) {
  if (event.type !== "checkout.session.completed") {
    return null;
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const candidate =
    session.customer_details?.email ||
    (typeof session.customer_email === "string" ? session.customer_email : null);

  return candidate?.trim().toLowerCase() || null;
}
