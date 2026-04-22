import { NextResponse } from "next/server";
import { coachChat, generateResponse } from "@/lib/openai";
import type { CoachMessage, OfferAnalysis, ResponseType, Tone } from "@/lib/types";

interface MessageModeRequest {
  mode: "message";
  offerText: string;
  analysis: OfferAnalysis;
  responseType: ResponseType;
  tone: Tone;
  targetCompensation?: string;
}

interface ChatModeRequest {
  mode: "chat";
  offerText: string;
  analysis: OfferAnalysis;
  history: CoachMessage[];
  userMessage: string;
}

type Payload = MessageModeRequest | ChatModeRequest;

function isOfferAnalysis(value: unknown): value is OfferAnalysis {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<OfferAnalysis>;

  return (
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.leveragePoints) &&
    Array.isArray(candidate.riskFlags) &&
    Array.isArray(candidate.negotiationPlan) &&
    typeof candidate.suggestedTargetComp === "string" &&
    typeof candidate.rationale === "string"
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<Payload>;

    if (!body.mode || (body.mode !== "message" && body.mode !== "chat")) {
      return NextResponse.json({ message: "Invalid mode" }, { status: 400 });
    }

    if (!body.offerText || body.offerText.trim().length < 120) {
      return NextResponse.json({ message: "Offer text is too short" }, { status: 400 });
    }

    if (!isOfferAnalysis(body.analysis)) {
      return NextResponse.json({ message: "Analysis payload is missing required fields" }, { status: 400 });
    }

    if (body.mode === "message") {
      const messageBody = body as Partial<MessageModeRequest>;

      if (!messageBody.responseType || !messageBody.tone) {
        return NextResponse.json({ message: "Missing responseType or tone" }, { status: 400 });
      }

      const generated = await generateResponse({
        offerText: body.offerText,
        analysis: body.analysis,
        responseType: messageBody.responseType,
        tone: messageBody.tone,
        targetCompensation: messageBody.targetCompensation
      });

      return NextResponse.json({ generated });
    }

    const chatBody = body as Partial<ChatModeRequest>;

    if (!chatBody.userMessage || !Array.isArray(chatBody.history)) {
      return NextResponse.json({ message: "Missing chat history or user message" }, { status: 400 });
    }

    const coached = await coachChat({
      offerText: body.offerText,
      analysis: body.analysis,
      history: chatBody.history,
      userMessage: chatBody.userMessage
    });

    return NextResponse.json(coached);
  } catch {
    return NextResponse.json({ message: "Failed to generate response" }, { status: 500 });
  }
}
