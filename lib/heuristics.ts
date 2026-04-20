import {
  type GenerateResponseInput,
  type GeneratedResponse,
  type OfferAnalysis,
  type OfferInput,
} from "@/types/negotiation";

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function findMoneyMentions(text: string) {
  const matches = text.match(/\$?\d{2,3}(?:,\d{3})+(?:\.\d+)?k?/gi) ?? [];
  return Array.from(new Set(matches)).slice(0, 6);
}

function sentence(text: string, index: number) {
  const parts = text
    .split(/[.!?]\s+/)
    .map((item) => normalizeWhitespace(item))
    .filter(Boolean);
  return parts[index] ?? parts[0] ?? "No explicit detail provided.";
}

export function analyzeOfferHeuristically(input: OfferInput): OfferAnalysis {
  const cleaned = normalizeWhitespace(input.offerEmail);
  const money = findMoneyMentions(cleaned);

  const base = money[0] ?? "Not explicitly stated";
  const bonus = money[1] ?? "Ask recruiter to clarify bonus target and payout timing";
  const equity = money[2] ?? "Request number of shares, strike price, and vesting details";
  const signOn = money[3] ?? "No sign-on bonus mentioned";

  const leveragePoints = [
    "Anchor on business impact: tie compensation to quantified outcomes you can deliver in the first 6 months.",
    "Use market signal framing: compare this offer with current market data and alternative opportunities.",
    "Package framing: ask for movement across base, sign-on, and equity together rather than one line item.",
  ];

  const riskFlags = [
    "If the offer lacks an expiry date, ask for one to avoid ambiguity during negotiation.",
    "If equity details are incomplete, your true upside cannot be evaluated accurately.",
  ];

  if (/non[- ]?compete|restrictive covenant|at will/i.test(cleaned)) {
    riskFlags.push(
      "Offer language appears to include restrictive terms. Clarify non-compete and termination clauses before signing.",
    );
  }

  return {
    executiveSummary:
      `This offer appears promising but under-specified in a few compensation lines. ` +
      `Primary opportunity is to negotiate base and guarantee clearer upside before accepting.`,
    compensation: {
      baseSalary: base,
      bonus,
      equity,
      signOn,
      benefits: "Confirm healthcare cost share, PTO policy, and any relocation/stipend support.",
    },
    leveragePoints,
    riskFlags,
    recruiterLikelyPushback: [
      "Budget band is fixed for this level.",
      "Equity refresh can happen only at annual cycle.",
      "Need decision quickly due to headcount timelines.",
    ],
    counterStrategy: {
      targetBaseSalary: money[0]
        ? `Ask for ${money[0]} + 8-12% as a first counter anchor.`
        : "Ask for a 10-15% increase on base with an alternate sign-on fallback.",
      walkAwayPoint:
        input.totalCompGoal && input.totalCompGoal.length > 0
          ? `Do not accept below your stated total comp goal (${input.totalCompGoal}).`
          : "Define your minimum acceptable total comp before next recruiter call.",
      framing:
        "Express excitement first, then anchor on scope, expected impact, and market parity. Keep tone collaborative.",
    },
    nextActions: [
      `Draft counter message using one clear ask and one fallback option.`,
      "Prepare a 3-point justification tied to impact, scarcity of your profile, and current market benchmark.",
      "Set a follow-up reminder for 48 hours if no reply arrives.",
    ],
    confidenceScore: input.riskTolerance === "aggressive" ? 74 : input.riskTolerance === "balanced" ? 81 : 86,
  };
}

export function generateResponseHeuristically(
  input: GenerateResponseInput,
): GeneratedResponse {
  const nameLine = input.managerName ? `Hi ${input.managerName},` : "Hi there,";
  const company = input.companyName ?? "the team";

  const coreAsk =
    input.offerAnalysis.counterStrategy.targetBaseSalary ||
    "an adjustment to base compensation and sign-on support";

  const body = [
    nameLine,
    "",
    `Thanks again for the offer and for the thoughtful process. I'm excited about the chance to join ${company}.`,
    "",
    `After reviewing the package, I'd like to discuss ${coreAsk}. Based on the role scope and the impact expected in the first 6-12 months, this adjustment would better align the offer with market level and the value I plan to deliver.`,
    "",
    "If base flexibility is limited, I'm open to structuring the package across sign-on and equity to reach a similar total outcome.",
    "",
    "I can move quickly once we align on this point and would love to close this out this week.",
    "",
    "Best,",
    "[Your Name]",
  ].join("\n");

  return {
    subjectLine:
      input.messageType === "follow_up"
        ? "Quick follow-up on offer details"
        : "Offer discussion and next steps",
    messageBody: body,
    briefVersion:
      "Excited to join, asking for compensation adjustment based on scope/impact, open to package tradeoffs, ready to close quickly.",
    talkingPoints: [
      "Lead with excitement and close intent before numbers.",
      "Anchor on impact and market, not personal needs.",
      "Offer one fallback path so negotiations keep moving.",
    ],
    coachNotes: [
      `Tone selected: ${input.tone}. Keep sentences short and specific.`,
      `Goal alignment: ${sentence(input.goal, 0)}`,
    ],
    followUpCadence: [
      "If no response in 48 hours: send concise follow-up with same ask.",
      "If still no response after 4 business days: request a short call to finalize.",
    ],
  };
}
