"use client";

import { useState } from "react";
import { Bot, FileSearch, LoaderCircle } from "lucide-react";
import type { OfferAnalysis } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface OfferAnalyzerProps {
  offerText: string;
  onOfferTextChange: (value: string) => void;
  analysis: OfferAnalysis | null;
  onAnalysisChange: (analysis: OfferAnalysis) => void;
}

export function OfferAnalyzer({ offerText, onOfferTextChange, analysis, onAnalysisChange }: OfferAnalyzerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleAnalyze() {
    setErrorMessage(null);

    if (offerText.trim().length < 120) {
      setErrorMessage("Paste the full offer email so the model can analyze compensation details and constraints accurately.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze-offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ offerText })
      });

      if (!response.ok) {
        throw new Error("Could not analyze this offer email");
      }

      const payload = (await response.json()) as { analysis: OfferAnalysis };
      onAnalysisChange(payload.analysis);
    } catch {
      setErrorMessage("Analysis failed. Please retry with the full recruiter message and compensation breakdown.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-sky-900/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-zinc-100">
          <FileSearch className="h-5 w-5 text-sky-300" />
          Offer Analyzer
        </CardTitle>
        <CardDescription>Paste the full offer email. The AI surfaces leverage points, risk flags, and a negotiation plan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          className="min-h-[220px]"
          onChange={(event) => onOfferTextChange(event.target.value)}
          placeholder="Paste your full offer email here. Include base salary, equity, bonus, level, start date, and any recruiter constraints."
          value={offerText}
        />
        <Button className="w-full sm:w-auto" disabled={isLoading} onClick={handleAnalyze} type="button">
          {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
          Analyze Offer
        </Button>
        {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}

        {analysis ? (
          <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 text-sm">
            <div>
              <p className="font-medium text-zinc-100">Summary</p>
              <p className="mt-1 text-zinc-300">{analysis.summary}</p>
            </div>
            <div>
              <p className="font-medium text-zinc-100">Leverage Points</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-300">
                {analysis.leveragePoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-zinc-100">Risk Flags</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-300">
                {analysis.riskFlags.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-zinc-100">Suggested Target Compensation</p>
              <p className="mt-1 text-emerald-300">{analysis.suggestedTargetComp}</p>
              <p className="mt-2 text-zinc-400">{analysis.rationale}</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
