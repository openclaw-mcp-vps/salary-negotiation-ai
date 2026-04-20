"use client";

import { motion } from "framer-motion";
import {
  CircleCheck,
  Clock3,
  Handshake,
  MessageSquareReply,
  Search,
  Send,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type NegotiationStep, type OfferAnalysis } from "@/types/negotiation";

type NegotiationTimelineProps = {
  analysis: OfferAnalysis | null;
};

const icons = {
  decode: Search,
  anchor: Target,
  send: Send,
  rebut: MessageSquareReply,
  followup: Clock3,
  close: Handshake,
};

function buildSteps(analysis: OfferAnalysis | null): NegotiationStep[] {
  if (!analysis) {
    return [
      {
        id: "decode",
        title: "Decode the offer",
        description: "Paste email and map every comp variable before negotiating.",
        status: "current",
      },
      {
        id: "anchor",
        title: "Set your anchor",
        description: "Define target ask and walk-away floor.",
        status: "todo",
      },
      {
        id: "send",
        title: "Send the counter",
        description: "Use AI draft with your own details and timeline.",
        status: "todo",
      },
      {
        id: "rebut",
        title: "Handle pushback",
        description: "Respond with prepared rebuttals to budget and level objections.",
        status: "todo",
      },
      {
        id: "followup",
        title: "Follow up with cadence",
        description: "Nudge every 48 hours without resetting your anchor.",
        status: "todo",
      },
      {
        id: "close",
        title: "Close intentionally",
        description: "Get revised offer in writing and verify final terms before signing.",
        status: "todo",
      },
    ];
  }

  return [
    {
      id: "decode",
      title: "Decode the offer",
      description: "Completed with leverage/risk extraction.",
      status: "done",
    },
    {
      id: "anchor",
      title: "Set your anchor",
      description: analysis.counterStrategy.targetBaseSalary,
      status: "done",
    },
    {
      id: "send",
      title: "Send the counter",
      description: analysis.nextActions[0] ?? "Send your first counter message.",
      status: "current",
    },
    {
      id: "rebut",
      title: "Handle pushback",
      description: analysis.recruiterLikelyPushback[0] ?? "Prepare rebuttals before recruiter replies.",
      status: "todo",
    },
    {
      id: "followup",
      title: "Follow up with cadence",
      description: "If no response in 48 hours, send concise follow-up.",
      status: "todo",
    },
    {
      id: "close",
      title: "Close intentionally",
      description: "Confirm all compensation components in the final written offer.",
      status: "todo",
    },
  ];
}

export function NegotiationTimeline({ analysis }: NegotiationTimelineProps) {
  const steps = buildSteps(analysis);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Negotiation Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = icons[step.id as keyof typeof icons];
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 rounded-md border border-slate-700/70 bg-slate-900/50 p-3"
              >
                <div className="mt-0.5 rounded-full border border-slate-600 p-2">
                  <Icon className="h-4 w-4 text-cyan-300" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-semibold text-slate-100">{step.title}</p>
                    {step.status === "done" ? (
                      <Badge variant="success" className="gap-1">
                        <CircleCheck className="h-3 w-3" />
                        Done
                      </Badge>
                    ) : step.status === "current" ? (
                      <Badge>Current</Badge>
                    ) : (
                      <Badge variant="muted">Queued</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-300">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
