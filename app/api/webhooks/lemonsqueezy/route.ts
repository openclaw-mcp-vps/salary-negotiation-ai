import { NextResponse } from "next/server";
import { markEmailAsPaid } from "@/lib/database";
import { constructStripeEvent, extractPaidEmail } from "@/lib/lemonsqueezy";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  try {
    const payload = await request.text();
    const event = constructStripeEvent(payload, signature);

    if (event.type === "checkout.session.completed") {
      const email = extractPaidEmail(event);

      if (email) {
        await markEmailAsPaid({
          email,
          source: "stripe_checkout_session_completed",
          eventId: event.id
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Webhook processing failed"
      },
      { status: 400 }
    );
  }
}
