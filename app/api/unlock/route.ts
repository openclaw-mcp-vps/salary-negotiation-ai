import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE_NAME, signAccessToken } from "@/lib/access";
import { createAccessSession, hasPaidEmail } from "@/lib/database";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Provide a valid checkout email." }, { status: 400 });
    }

    const paid = await hasPaidEmail(email);

    if (!paid) {
      return NextResponse.json(
        {
          message:
            "No completed purchase found for this email yet. If you just paid, wait 30-60 seconds for webhook processing and retry."
        },
        { status: 403 }
      );
    }

    const token = await createAccessSession(email);
    const signedToken = signAccessToken(token);

    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE_NAME, signedToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 90,
      path: "/"
    });

    return NextResponse.json({ message: "Access unlocked. Reloading your workspace now." });
  } catch {
    return NextResponse.json({ message: "Could not unlock access" }, { status: 500 });
  }
}
