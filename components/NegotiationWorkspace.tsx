"use client";

import { useState } from "react";

import { OfferAnalyzer } from "@/components/OfferAnalyzer";
import { NegotiationTimeline } from "@/components/NegotiationTimeline";
import { ResponseGenerator } from "@/components/ResponseGenerator";
import { type OfferAnalysis } from "@/types/negotiation";

export function NegotiationWorkspace() {
  const [analysis, setAnalysis] = useState<OfferAnalysis | null>(null);

  return (
    <div className="space-y-8">
      <NegotiationTimeline analysis={analysis} />
      <OfferAnalyzer onAnalyzed={setAnalysis} />
      <ResponseGenerator analysis={analysis} />
    </div>
  );
}
