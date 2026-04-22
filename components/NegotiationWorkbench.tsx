"use client";

import { useState } from "react";
import type { OfferAnalysis } from "@/lib/types";
import { OfferAnalyzer } from "@/components/OfferAnalyzer";
import { ResponseGenerator } from "@/components/ResponseGenerator";
import { NegotiationChat } from "@/components/NegotiationChat";

export function NegotiationWorkbench() {
  const [offerText, setOfferText] = useState("");
  const [analysis, setAnalysis] = useState<OfferAnalysis | null>(null);

  return (
    <div className="grid gap-6">
      <OfferAnalyzer analysis={analysis} offerText={offerText} onAnalysisChange={setAnalysis} onOfferTextChange={setOfferText} />
      <ResponseGenerator analysis={analysis} offerText={offerText} />
      <NegotiationChat analysis={analysis} offerText={offerText} />
    </div>
  );
}
