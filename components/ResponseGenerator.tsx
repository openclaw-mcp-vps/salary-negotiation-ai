"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Copy, MailCheck, MessageSquareQuote } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
  type GeneratedResponse,
  generateResponseInputSchema,
  type OfferAnalysis,
  responseMessageTypeSchema,
  responseToneSchema,
} from "@/types/negotiation";

const formSchema = generateResponseInputSchema
  .pick({
    messageType: true,
    tone: true,
    goal: true,
    managerName: true,
    companyName: true,
    additionalContext: true,
  })
  .extend({
    managerName: z.string().max(120).optional(),
    companyName: z.string().max(120).optional(),
    additionalContext: z.string().max(3000).optional(),
  });

type FormValues = z.infer<typeof formSchema>;

type ResponseGeneratorProps = {
  analysis: OfferAnalysis | null;
};

export function ResponseGenerator({ analysis }: ResponseGeneratorProps) {
  const [generated, setGenerated] = useState<GeneratedResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"subject" | "body" | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      messageType: "counter_offer",
      tone: "collaborative",
      goal: "Improve total comp while staying in a strong relationship with the recruiter.",
    },
  });

  const disabled = useMemo(() => !analysis, [analysis]);

  async function onSubmit(values: FormValues) {
    if (!analysis) {
      setApiError("Run Offer Analyzer first so the draft is grounded in your package.");
      return;
    }

    setApiError(null);
    const response = await fetch("/api/generate-response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
        offerAnalysis: analysis,
      }),
    });

    const payload = (await response.json()) as
      | { response: GeneratedResponse }
      | { error: string };

    if (!response.ok || !("response" in payload)) {
      setApiError(
        "error" in payload
          ? payload.error
          : "Unable to generate a draft response right now.",
      );
      return;
    }

    setGenerated(payload.response);
  }

  async function copy(value: string, type: "subject" | "body") {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MessageSquareQuote className="h-6 w-6 text-cyan-300" />
            Response Generator
          </CardTitle>
          <CardDescription>
            Generate a polished counter-offer, rebuttal, follow-up, or final close
            message using your analysis context.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Message Type
                </label>
                <select
                  className="h-10 w-full rounded-md border border-slate-600 bg-slate-950 px-3 text-sm"
                  {...register("messageType")}
                  disabled={disabled}
                >
                  {responseMessageTypeSchema.options.map((option) => (
                    <option key={option} value={option}>
                      {option.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Tone
                </label>
                <select
                  className="h-10 w-full rounded-md border border-slate-600 bg-slate-950 px-3 text-sm"
                  {...register("tone")}
                  disabled={disabled}
                >
                  {responseToneSchema.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Goal for this message
              </label>
              <Textarea
                rows={3}
                placeholder="Example: Hold a higher base ask while staying collaborative and moving quickly to close."
                {...register("goal")}
                disabled={disabled}
              />
              {errors.goal ? (
                <p className="mt-1 text-xs text-rose-300">{errors.goal.message}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Hiring Manager / Recruiter Name
                </label>
                <Input placeholder="Alex" {...register("managerName")} disabled={disabled} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">
                  Company Name
                </label>
                <Input placeholder="Acme AI" {...register("companyName")} disabled={disabled} />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Extra Context (optional)
              </label>
              <Textarea
                rows={3}
                placeholder="Any competing offer timelines, constraints, or personal priorities to include."
                {...register("additionalContext")}
                disabled={disabled}
              />
            </div>

            {apiError ? (
              <p className="rounded-md border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-200">
                {apiError}
              </p>
            ) : null}

            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || disabled}>
              {isSubmitting ? "Generating draft..." : "Generate Negotiation Draft"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generated ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MailCheck className="h-4 w-4 text-cyan-300" />
                Draft Ready
              </CardTitle>
              <CardDescription>
                Copy this into email and personalize details before sending.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-md border border-slate-700 bg-slate-950/70 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Subject</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => copy(generated.subjectLine, "subject")}
                    type="button"
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    {copied === "subject" ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="text-slate-100">{generated.subjectLine}</p>
              </div>

              <div className="rounded-md border border-slate-700 bg-slate-950/70 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Message</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => copy(generated.messageBody, "body")}
                    type="button"
                  >
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    {copied === "body" ? "Copied" : "Copy"}
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-slate-100">
                  {generated.messageBody}
                </pre>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                    Talking points for calls
                  </p>
                  <div className="space-y-2 text-slate-200">
                    {generated.talkingPoints.map((item) => (
                      <p key={item}>• {item}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                    Follow-up cadence
                  </p>
                  <div className="space-y-2 text-slate-200">
                    {generated.followUpCadence.map((item) => (
                      <p key={item}>• {item}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {generated.coachNotes.map((item) => (
                  <Badge key={item} variant="muted">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : null}
    </div>
  );
}
