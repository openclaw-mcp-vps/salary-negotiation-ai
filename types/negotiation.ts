import { z } from "zod";

export const offerInputSchema = z.object({
  offerEmail: z
    .string()
    .min(80, "Paste the full offer email so the analysis can be precise."),
  role: z.string().min(2).max(120).optional(),
  company: z.string().min(2).max(120).optional(),
  location: z.string().min(2).max(120).optional(),
  totalCompGoal: z.string().max(120).optional(),
  riskTolerance: z.enum(["conservative", "balanced", "aggressive"]).default("balanced"),
});

export type OfferInput = z.infer<typeof offerInputSchema>;

export const compensationBreakdownSchema = z.object({
  baseSalary: z.string(),
  bonus: z.string(),
  equity: z.string(),
  signOn: z.string(),
  benefits: z.string(),
});

export const counterStrategySchema = z.object({
  targetBaseSalary: z.string(),
  walkAwayPoint: z.string(),
  framing: z.string(),
});

export const offerAnalysisSchema = z.object({
  executiveSummary: z.string(),
  compensation: compensationBreakdownSchema,
  leveragePoints: z.array(z.string()).min(3),
  riskFlags: z.array(z.string()).min(1),
  recruiterLikelyPushback: z.array(z.string()).min(2),
  counterStrategy: counterStrategySchema,
  nextActions: z.array(z.string()).min(3),
  confidenceScore: z.number().min(0).max(100),
});

export type OfferAnalysis = z.infer<typeof offerAnalysisSchema>;

export const responseMessageTypeSchema = z.enum([
  "counter_offer",
  "rebuttal",
  "follow_up",
  "final_close",
]);

export const responseToneSchema = z.enum([
  "confident",
  "collaborative",
  "firm",
  "warm",
]);

export const generateResponseInputSchema = z.object({
  messageType: responseMessageTypeSchema,
  tone: responseToneSchema,
  goal: z.string().min(20),
  managerName: z.string().max(120).optional(),
  companyName: z.string().max(120).optional(),
  offerAnalysis: offerAnalysisSchema,
  additionalContext: z.string().max(3000).optional(),
});

export type GenerateResponseInput = z.infer<typeof generateResponseInputSchema>;

export const generatedResponseSchema = z.object({
  subjectLine: z.string(),
  messageBody: z.string(),
  briefVersion: z.string(),
  talkingPoints: z.array(z.string()).min(3),
  coachNotes: z.array(z.string()).min(2),
  followUpCadence: z.array(z.string()).min(2),
});

export type GeneratedResponse = z.infer<typeof generatedResponseSchema>;

export type NegotiationStep = {
  id: string;
  title: string;
  description: string;
  status: "todo" | "current" | "done";
};
