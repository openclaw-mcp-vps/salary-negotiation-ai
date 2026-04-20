import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { generateResponseHeuristically } from "@/lib/heuristics";
import { getOpenAIClient, hasOpenAIKey, OPENAI_MODEL } from "@/lib/openai";
import {
  generateResponseInputSchema,
  generatedResponseSchema,
  type GeneratedResponse,
} from "@/types/negotiation";

export const runtime = "nodejs";

function responsePrompt(input: string) {
  return `You are writing negotiation messages for a software engineer evaluating an offer.
Return strict JSON with this shape:
{
  "subjectLine": string,
  "messageBody": string,
  "briefVersion": string,
  "talkingPoints": string[],
  "coachNotes": string[],
  "followUpCadence": string[]
}
Rules:
- messageBody should be ready to send as email, with greeting and sign-off placeholders.
- Tailor tone to user-selected style.
- Ask should align with counter strategy in offerAnalysis.
- Avoid fluff. Be professional and specific.
Input JSON:\n${input}`;
}

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as unknown;
    const parsedInput = generateResponseInputSchema.parse(raw);

    if (!hasOpenAIKey()) {
      return NextResponse.json({
        response: generateResponseHeuristically(parsedInput),
        source: "heuristic",
      });
    }

    const completion = await getOpenAIClient().chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert salary negotiation writer. Return only valid JSON output.",
        },
        {
          role: "user",
          content: responsePrompt(JSON.stringify(parsedInput)),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No model output");
    }

    const response = generatedResponseSchema.parse(
      JSON.parse(content),
    ) satisfies GeneratedResponse;

    return NextResponse.json({ response, source: "openai" });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.errors[0]?.message ?? "Invalid response-generation input.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          "We could not generate your negotiation message. Please retry in a moment.",
      },
      { status: 500 },
    );
  }
}
