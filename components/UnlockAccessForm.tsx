"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UnlockAccessForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  async function handleUnlock() {
    setResultMessage(null);

    if (!email.trim()) {
      setResultMessage("Enter the same email used at Stripe checkout.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as { message: string };

      setResultMessage(payload.message);

      if (response.ok) {
        router.refresh();
      }
    } catch {
      setResultMessage("Unlock request failed. Please retry.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-sm text-zinc-300">After checkout, enter your purchase email to unlock the negotiation workspace.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          type="email"
          value={email}
        />
        <Button disabled={isLoading} onClick={handleUnlock} type="button">
          {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <LockOpen className="mr-2 h-4 w-4" />}
          Unlock
        </Button>
      </div>
      {resultMessage ? <p className="text-sm text-zinc-200">{resultMessage}</p> : null}
    </div>
  );
}
