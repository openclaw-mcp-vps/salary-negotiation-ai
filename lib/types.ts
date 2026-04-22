export type Tone = "assertive" | "collaborative" | "concise";
export type ResponseType = "counter_offer" | "rebuttal" | "follow_up";

export interface OfferAnalysis {
  summary: string;
  leveragePoints: string[];
  riskFlags: string[];
  negotiationPlan: string[];
  suggestedTargetComp: string;
  rationale: string;
}

export interface GeneratedResponse {
  subject: string;
  message: string;
  talkingPoints: string[];
  nextStep: string;
}

export interface CoachMessage {
  role: "user" | "assistant";
  content: string;
}
