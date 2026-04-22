"use client";

import { useState } from "react";
import { LoaderCircle, MessageCircle, Send } from "lucide-react";
import type { CoachMessage, OfferAnalysis } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface NegotiationChatProps {
  offerText: string;
  analysis: OfferAnalysis | null;
}

export function NegotiationChat({ offerText, analysis }: NegotiationChatProps) {
  const [history, setHistory] = useState<CoachMessage[]>([
    {
      role: "assistant",
      content:
        "I can coach each negotiation round. Start by sharing what the recruiter said last and what outcome you want from your next message."
    }
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<string[]>([]);

  async function sendMessage() {
    setErrorMessage(null);

    if (!analysis) {
      setErrorMessage("Run Offer Analyzer first. The coach needs that context.");
      return;
    }

    if (!message.trim()) {
      return;
    }

    const trimmed = message.trim();
    setMessage("");

    const nextHistory = [...history, { role: "user", content: trimmed } as const];
    setHistory(nextHistory);
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mode: "chat",
          offerText,
          analysis,
          history: nextHistory,
          userMessage: trimmed
        })
      });

      if (!response.ok) {
        throw new Error("Chat failed");
      }

      const payload = (await response.json()) as {
        assistantMessage: string;
        checklist: string[];
      };

      setHistory((prev) => [...prev, { role: "assistant", content: payload.assistantMessage }]);
      setChecklist(payload.checklist);
    } catch {
      setErrorMessage("Coaching reply failed. Retry your message.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-emerald-300" />
          Negotiation Coach Chat
        </CardTitle>
        <CardDescription>Ask for tactical help at each step: recruiter objections, stalls, and close strategy.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-[320px] space-y-3 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
          {history.map((entry, index) => (
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                entry.role === "assistant"
                  ? "bg-zinc-800 text-zinc-200"
                  : "ml-auto bg-sky-500/20 text-sky-100"
              }`}
              key={`${entry.role}-${index}-${entry.content.slice(0, 20)}`}
            >
              {entry.content}
            </div>
          ))}
          {isLoading ? (
            <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-200">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Coaching...
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Example: recruiter said base is fixed. How should I respond without losing momentum?"
            value={message}
          />
          <Button disabled={isLoading} onClick={sendMessage} type="button">
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>

        {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}

        {checklist.length > 0 ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 text-sm">
            <p className="font-medium text-zinc-100">Checklist for your next message</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-300">
              {checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
