"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { BrainCircuit, ShieldAlert, Sparkles, Target } from "lucide-react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type OfferAnalysis,
  offerInputSchema,
  type OfferInput,
} from "@/types/negotiation";

type OfferAnalyzerProps = {
  onAnalyzed: (analysis: OfferAnalysis) => void;
};

export function OfferAnalyzer({ onAnalyzed }: OfferAnalyzerProps) {
  const [analysis, setAnalysis] = useState<OfferAnalysis | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OfferInput>({
    resolver: zodResolver(offerInputSchema),
    defaultValues: {
      riskTolerance: "balanced",
    },
  });

  async function onSubmit(values: OfferInput) {
    setApiError(null);
    const response = await fetch("/api/analyze-offer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as
      | { analysis: OfferAnalysis }
      | { error: string };

    if (!response.ok || !("analysis" in payload)) {
      setApiError(
        "error" in payload
          ? payload.error
          : "We could not analyze that offer. Try again.",
      );
      return;
    }

    setAnalysis(payload.analysis);
    onAnalyzed(payload.analysis);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BrainCircuit className="h-6 w-6 text-cyan-300" />
            Offer Analyzer
          </CardTitle>
          <CardDescription>
            Paste the exact email from the recruiter. The model extracts leverage,
            predicts pushback, and recommends your anchor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Offer Email
              </label>
              <Textarea
                rows={10}
                placeholder="Paste the full offer email here"
                {...register("offerEmail")}
              />
              {errors.offerEmail ? (
                <p className="mt-1 text-xs text-rose-300">
                  {errors.offerEmail.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Role
                </label>
                <Input
                  placeholder="Senior Backend Engineer"
                  {...register("role")}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Company
                </label>
                <Input placeholder="Acme AI" {...register("company")} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Location
                </label>
                <Input placeholder="Remote (US)" {...register("location")} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Minimum Total Comp Goal
                </label>
                <Input placeholder="$260,000" {...register("totalCompGoal")} />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Risk Tolerance
              </label>
              <select
                className="h-10 w-full rounded-md border border-slate-600 bg-slate-950 px-3 text-sm"
                {...register("riskTolerance")}
              >
                <option value="conservative">Conservative (preserve offer)</option>
                <option value="balanced">Balanced (best expected value)</option>
                <option value="aggressive">Aggressive (maximize upside)</option>
              </select>
            </div>

            {apiError ? (
              <p className="rounded-md border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-200">
                {apiError}
              </p>
            ) : null}

            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? "Analyzing offer..." : "Analyze My Offer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analysis ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid gap-4 md:grid-cols-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              <p>{analysis.executiveSummary}</p>
              <Badge variant="success">
                Confidence {analysis.confidenceScore}%
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-4 w-4 text-cyan-300" />
                Counter Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-200">
              <p>
                <span className="font-semibold text-cyan-200">Target ask:</span>{" "}
                {analysis.counterStrategy.targetBaseSalary}
              </p>
              <p>
                <span className="font-semibold text-cyan-200">Walk-away:</span>{" "}
                {analysis.counterStrategy.walkAwayPoint}
              </p>
              <p>
                <span className="font-semibold text-cyan-200">Framing:</span>{" "}
                {analysis.counterStrategy.framing}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                Leverage Points
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-200">
              {analysis.leveragePoints.map((point) => (
                <p key={point}>• {point}</p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldAlert className="h-4 w-4 text-amber-300" />
                Risk Flags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-200">
              {analysis.riskFlags.map((point) => (
                <p key={point}>• {point}</p>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      ) : null}
    </div>
  );
}
