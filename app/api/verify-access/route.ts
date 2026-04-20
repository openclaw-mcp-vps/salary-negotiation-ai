import { NextResponse } from "next/server";
import { z } from "zod";

import { createAccessToken } from "@/lib/access";
import { ACCESS_COOKIE_MAX_AGE, ACCESS_COOKIE_NAME } from "@/lib/access-constants";
import { findPurchaseByEmail } from "@/lib/database";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = (await request.json()) as unknown;
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide a valid purchase email." },
      { status: 400 },
    );
  }

  const purchase = await findPurchaseByEmail(parsed.data.email);

  if (!purchase || purchase.status !== "paid") {
    return NextResponse.json(
      {
        error:
          "No paid purchase found for this email yet. If you just completed checkout, wait a minute and retry.",
      },
      { status: 404 },
    );
  }

  const token = createAccessToken({
    email: purchase.email,
    purchaseId: purchase.orderId,
    issuedAt: Date.now(),
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });

  return response;
}
