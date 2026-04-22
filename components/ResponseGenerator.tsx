"use client";

import { useMemo, useState } from "react";
import { Copy, LoaderCircle, WandSparkles } from "lucide-react";
import type { GeneratedResponse, OfferAnalysis, ResponseType, Tone } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ResponseGeneratorProps {
  offerText: string;
  analysis: OfferAnalysis | null;
}

const responseTypeLabels: Record<ResponseType, string> = {
  counter_offer: "Counter-Offer",
  rebuttal: "Rebuttal",
  follow_up: "Follow-Up"
};

const toneLabels: Record<Tone, string> = {
  assertive: "Assertive",
  collaborative: "Collaborative",
  concise: "Concise"
};

export function ResponseGenerator({ offerText, analysis }: ResponseGeneratorProps) {
  const [responseType, setResponseType] = useState<ResponseType>("counter_offer");
  const [tone, setTone] = useState<Tone>("assertive");
  const [targetCompensation, setTargetCompensation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedResponse | null>(null);

  const effectiveTargetComp = useMemo(() => {
    if (targetCompensation.trim().length > 0) {
      return targetCompensation.trim();
    }

    return analysis?.suggestedTargetComp ?? "";
  }, [analysis?.suggestedTargetComp, targetCompensation]);

  async function handleGenerate() {
    setErrorMessage(null);

    if (!analysis) {
      setErrorMessage("Run Offer Analyzer first so the response is grounded in real leverage and constraints.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mode: "message",
          offerText,
          analysis,
          responseType,
          tone,
          targetCompensation: effectiveTargetComp
        })
      });

      if (!response.ok) {
        throw new Error("Could not generate response");
      }

      const payload = (await response.json()) as { generated: GeneratedResponse };
      setGenerated(payload.generated);
    } catch {
      setErrorMessage("Response generation failed. Retry after refreshing analysis.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyMessage() {
    if (!generated) return;
    await navigator.clipboard.writeText(`Subject: ${generated.subject}\n\n${generated.message}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WandSparkles className="h-5 w-5 text-cyan-300" />
          Response Generator
        </CardTitle>
        <CardDescription>Generate an email draft for your current negotiation stage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(responseTypeLabels) as ResponseType[]).map((item) => (
            <Button
              key={item}
              onClick={() => setResponseType(item)}
              type="button"
              variant={responseType === item ? "default" : "secondary"}
            >
              {responseTypeLabels[item]}
            </Button>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(toneLabels) as Tone[]).map((item) => (
            <Button key={item} onClick={() => setTone(item)} type="button" variant={tone === item ? "default" : "secondary"}>
              {toneLabels[item]}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Target Compensation Ask</p>
          <Input
            onChange={(event) => setTargetCompensation(event.target.value)}
            placeholder={analysis?.suggestedTargetComp ?? "Ex: $220k base + $120k equity + $30k sign-on"}
            value={targetCompensation}
          />
        </div>

        <Button className="w-full sm:w-auto" disabled={isLoading} onClick={handleGenerate} type="button">
          {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          Generate Draft
        </Button>
        {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}

        {generated ? (
          <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 text-sm">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <p className="font-medium text-zinc-100">Subject: {generated.subject}</p>
              <Button onClick={copyMessage} size="sm" type="button" variant="ghost">
                <Copy className="mr-1 h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
            <p className="whitespace-pre-wrap leading-relaxed text-zinc-300">{generated.message}</p>
            <div>
              <p className="font-medium text-zinc-100">Talking Points</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-zinc-300">
                {generated.talkingPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <p className="text-emerald-300">Next step: {generated.nextStep}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
