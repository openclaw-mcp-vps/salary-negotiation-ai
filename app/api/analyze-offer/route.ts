import { NextResponse } from "next/server";
import { analyzeOffer } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { offerText?: string };

    if (!body.offerText || body.offerText.trim().length < 120) {
      return NextResponse.json(
        {
          message: "Provide the full offer email text for meaningful analysis."
        },
        { status: 400 }
      );
    }

    const analysis = await analyzeOffer(body.offerText.trim());
    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json({ message: "Failed to analyze offer" }, { status: 500 });
  }
}
