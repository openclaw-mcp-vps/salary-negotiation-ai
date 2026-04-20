"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
  }
}

function resolveCheckoutUrl() {
  const value = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
  if (!value) {
    return null;
  }
  if (/^https?:\/\//.test(value)) {
    return value;
  }
  return `https://checkout.lemonsqueezy.com/buy/${value}`;
}

export function PricingSection() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [paywallHint, setPaywallHint] = useState(false);

  const checkoutUrl = useMemo(() => resolveCheckoutUrl(), []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setPaywallHint(query.get("paywall") === "1");

    if (document.querySelector("script[data-ls-overlay]")) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://app.lemonsqueezy.com/js/lemon.js";
    script.defer = true;
    script.dataset.lsOverlay = "true";
    script.onload = () => {
      window.createLemonSqueezy?.();
    };
    document.body.appendChild(script);
  }, []);

  async function unlockAccess() {
    setStatus("loading");
    setError(null);

    const response = await fetch("/api/verify-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus("error");
      setError(payload.error ?? "Unable to verify purchase. Double-check your checkout email.");
      return;
    }

    setStatus("idle");
    router.push("/negotiate");
    router.refresh();
  }

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-slate-900">
          <CardHeader>
            <CardTitle className="text-3xl">One Offer Can Change Your Year</CardTitle>
            <CardDescription>
              Pay once, negotiate with confidence, and keep the playbook for your next cycle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-4xl font-semibold text-cyan-200">$29</p>
              <p className="text-sm text-slate-300">
                single purchase, full negotiation workflow unlocked
              </p>
            </div>

            <div className="space-y-3 text-sm text-slate-200">
              {[
                "AI analysis of each offer email",
                "Counter-offer, rebuttal, and follow-up generation",
                "Negotiation timeline so you always know next step",
                "Access for your current and future negotiations",
              ].map((line) => (
                <p key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" />
                  <span>{line}</span>
                </p>
              ))}
            </div>

            {checkoutUrl ? (
              <a href={checkoutUrl} className="lemonsqueezy-button block">
                <Button size="lg" className="w-full">
                  <LockKeyhole className="h-4 w-4" />
                  Unlock Salary Negotiation AI
                </Button>
              </a>
            ) : (
              <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
                Configure `NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID` to enable checkout.
              </p>
            )}

            {paywallHint ? (
              <p className="rounded-md border border-cyan-500/40 bg-cyan-500/10 p-3 text-sm text-cyan-200">
                The negotiation workspace is locked until purchase is verified.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Already Purchased?</CardTitle>
              <CardDescription>
                Enter the same email you used at checkout to activate your session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              {error ? (
                <p className="text-sm text-rose-300">{error}</p>
              ) : null}
              <Button
                variant="secondary"
                className="w-full"
                disabled={status === "loading" || !email}
                onClick={unlockAccess}
              >
                {status === "loading" ? "Verifying..." : "Verify Purchase & Open Workspace"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    How is this different from ChatGPT prompts?
                  </AccordionTrigger>
                  <AccordionContent>
                    This is structured for negotiation flow. You get offer decoding,
                    leverage mapping, pushback prep, and follow-up sequencing in one
                    workflow, not isolated prompt outputs.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    Is this only for senior engineers?
                  </AccordionTrigger>
                  <AccordionContent>
                    No. It is optimized for engineers across levels where compensation
                    packages include base, bonus, and equity components.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Can I use it for multiple offers?</AccordionTrigger>
                  <AccordionContent>
                    Yes. Once access is unlocked, you can run analysis and responses for
                    as many offers as you need.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </section>
  );
}
