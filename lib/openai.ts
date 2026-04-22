import OpenAI from "openai";
import type { CoachMessage, GeneratedResponse, OfferAnalysis, ResponseType, Tone } from "@/lib/types";

let cachedClient: OpenAI | null | undefined;

function getClient() {
  if (cachedClient !== undefined) {
    return cachedClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  cachedClient = apiKey ? new OpenAI({ apiKey }) : null;
  return cachedClient;
}

function cleanJsonPayload(raw: string) {
  const fencedMatch = raw.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const objectStart = raw.indexOf("{");
  const objectEnd = raw.lastIndexOf("}");

  if (objectStart !== -1 && objectEnd > objectStart) {
    return raw.slice(objectStart, objectEnd + 1).trim();
  }

  return raw.trim();
}

async function requestJson<T>(params: {
  systemPrompt: string;
  userPrompt: string;
  fallback: T;
}): Promise<T> {
  const client = getClient();

  if (!client) {
    return params.fallback;
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      input: [
        {
          role: "system",
          content: params.systemPrompt
        },
        {
          role: "user",
          content: params.userPrompt
        }
      ]
    });

    const text = response.output_text?.trim();

    if (!text) {
      return params.fallback;
    }

    const parsed = JSON.parse(cleanJsonPayload(text)) as T;
    return parsed;
  } catch {
    return params.fallback;
  }
}

function inferTargetCompensation(offerText: string) {
  const salaryMatch = offerText.match(/\$\s?([0-9]{2,3}(?:,[0-9]{3})?)/);

  if (!salaryMatch) {
    return "Aim for a 8-12% increase on base salary plus equity refresh and signing bonus protection.";
  }

  const numericValue = Number.parseInt(salaryMatch[1].replace(/,/g, ""), 10);

  if (Number.isNaN(numericValue)) {
    return "Ask for a measured 8-12% base increase and stronger non-cash terms.";
  }

  const targetLow = Math.round(numericValue * 1.08);
  const targetHigh = Math.round(numericValue * 1.15);

  return `Target base range: $${targetLow.toLocaleString()}-$${targetHigh.toLocaleString()} with stronger equity vesting and sign-on protection.`;
}

export async function analyzeOffer(offerText: string): Promise<OfferAnalysis> {
  const fallback: OfferAnalysis = {
    summary:
      "Your offer can likely be improved by packaging base salary, equity, and signing terms into one structured counter rather than negotiating each item in isolation.",
    leveragePoints: [
      "You already passed a competitive hiring funnel, which gives immediate leverage.",
      "Most companies maintain compensation bandwidth above the initial written offer.",
      "Linking your impact plan to compensation reduces the chance of a defensive response."
    ],
    riskFlags: [
      "Avoid anchoring only on salary if equity or bonus is materially below market.",
      "Do not send a long emotional rebuttal; keep the ask precise and businesslike.",
      "Confirm timeline pressure before requesting multiple rounds of revisions."
    ],
    negotiationPlan: [
      "Send one concise counter that includes salary, equity, sign-on, and start-date flexibility.",
      "If they push back, ask which component is easiest to move and trade across components.",
      "Close with a deadline-bound acceptance condition to convert momentum into signature."
    ],
    suggestedTargetComp: inferTargetCompensation(offerText),
    rationale:
      "Bundled asks improve acceptance odds because recruiters can solve within total compensation constraints rather than treating each point as a separate exception."
  };

  return requestJson<OfferAnalysis>({
    systemPrompt:
      "You are a compensation negotiation strategist. Return strict JSON only with keys: summary, leveragePoints (array), riskFlags (array), negotiationPlan (array), suggestedTargetComp, rationale. Keep every array to exactly 3 items. No markdown.",
    userPrompt: `Analyze this offer email and produce practical negotiation guidance:\n\n${offerText}`,
    fallback
  });
}

function defaultSubject(responseType: ResponseType) {
  if (responseType === "counter_offer") return "Compensation Discussion and Offer Alignment";
  if (responseType === "rebuttal") return "Re: Offer Discussion Follow-Up";
  return "Quick Follow-Up on Offer Details";
}

export async function generateResponse(params: {
  offerText: string;
  analysis: OfferAnalysis;
  responseType: ResponseType;
  tone: Tone;
  targetCompensation?: string;
}): Promise<GeneratedResponse> {
  const fallback: GeneratedResponse = {
    subject: defaultSubject(params.responseType),
    message:
      "Thank you again for the offer and for the thoughtful conversations throughout the process. After reviewing the full package, I remain very excited about the role and confident in the impact I can deliver quickly. Based on scope, expected ownership, and market benchmarks for similar roles, I would like to revisit compensation so the offer fully reflects the level at which I will contribute. If we can align on a stronger total package, I am ready to move forward quickly and close this week.",
    talkingPoints: [
      "Reaffirm excitement and intent to close soon.",
      "State a clear compensation adjustment tied to role scope and market data.",
      "Offer flexibility across base, equity, and sign-on to help them get to yes."
    ],
    nextStep:
      "If they decline the full ask, request the best possible movement across any two components and agree on a concrete response deadline."
  };

  return requestJson<GeneratedResponse>({
    systemPrompt:
      "You write high-conviction compensation negotiation emails. Return strict JSON with keys: subject, message, talkingPoints (array of 3), nextStep. No markdown.",
    userPrompt: `Create a ${params.responseType.replaceAll("_", " ")} email in a ${params.tone} tone.

Offer email:
${params.offerText}

Analysis summary:
${params.analysis.summary}

Leverage points:
- ${params.analysis.leveragePoints.join("\n- ")}

Risk flags:
- ${params.analysis.riskFlags.join("\n- ")}

Negotiation plan:
- ${params.analysis.negotiationPlan.join("\n- ")}

Target compensation guidance:
${params.targetCompensation || params.analysis.suggestedTargetComp}`,
    fallback
  });
}

export async function coachChat(params: {
  offerText: string;
  analysis: OfferAnalysis;
  history: CoachMessage[];
  userMessage: string;
}) {
  const fallback = {
    assistantMessage:
      "Strong question. For your next reply, keep it to three parts: confirm enthusiasm, restate your exact compensation target, and ask for a firm yes/no by a specific date. This keeps leverage while preserving momentum.",
    checklist: [
      "Did you state one clear number or range?",
      "Did you tie the ask to scope and impact?",
      "Did you request a concrete response deadline?"
    ]
  };

  const historyText = params.history
    .slice(-8)
    .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
    .join("\n");

  return requestJson<{ assistantMessage: string; checklist: string[] }>({
    systemPrompt:
      "You are a salary negotiation coach. Return strict JSON with keys: assistantMessage, checklist (array of exactly 3 checklist items). Give tactical and specific advice.",
    userPrompt: `Offer context:\n${params.offerText}\n\nAnalysis:\n${params.analysis.summary}\n\nRecent chat:\n${historyText}\n\nUser asks:\n${params.userMessage}`,
    fallback
  });
}
