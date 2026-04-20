import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { analyzeOfferHeuristically } from "@/lib/heuristics";
import { getOpenAIClient, hasOpenAIKey, OPENAI_MODEL } from "@/lib/openai";
import {
  offerAnalysisSchema,
  offerInputSchema,
  type OfferAnalysis,
} from "@/types/negotiation";

export const runtime = "nodejs";

function createPrompt(input: string) {
  return `You are a compensation negotiation strategist for software engineers.
Return strict JSON with this exact shape:
{
  "executiveSummary": string,
  "compensation": {
    "baseSalary": string,
    "bonus": string,
    "equity": string,
    "signOn": string,
    "benefits": string
  },
  "leveragePoints": string[],
  "riskFlags": string[],
  "recruiterLikelyPushback": string[],
  "counterStrategy": {
    "targetBaseSalary": string,
    "walkAwayPoint": string,
    "framing": string
  },
  "nextActions": string[],
  "confidenceScore": number
}
Rules:
- Confidence score must be 0-100 integer.
- Keep each list item concise and tactical.
- Avoid generic advice and personalize based on provided offer details.
Input JSON:\n${input}`;
}

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as unknown;
    const parsedInput = offerInputSchema.parse(raw);

    if (!hasOpenAIKey()) {
      return NextResponse.json({
        analysis: analyzeOfferHeuristically(parsedInput),
        source: "heuristic",
      });
    }

    const completion = await getOpenAIClient().chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You provide advanced salary negotiation coaching for engineers. Return only valid JSON.",
        },
        {
          role: "user",
          content: createPrompt(JSON.stringify(parsedInput)),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No model output");
    }

    const analysis = offerAnalysisSchema.parse(
      JSON.parse(content),
    ) satisfies OfferAnalysis;

    return NextResponse.json({ analysis, source: "openai" });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.errors[0]?.message ?? "Invalid offer input.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          "We could not analyze that offer right now. Please retry in a few moments.",
      },
      { status: 500 },
    );
  }
}
