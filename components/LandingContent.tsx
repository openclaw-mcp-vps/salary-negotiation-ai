"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MessageSquareReply, ShieldCheck, Sparkles, Target } from "lucide-react";
import { PaymentButton } from "@/components/PaymentButton";

const faqItems = [
  {
    q: "Who is this for?",
    a: "Engineers and technical ICs who have an offer in hand and want to negotiate higher total compensation without burning goodwill."
  },
  {
    q: "Is this a recruiter template generator?",
    a: "No. The app builds strategy from your exact offer email, then writes contextual counters, rebuttals, and follow-ups for each negotiation round."
  },
  {
    q: "How is pricing structured?",
    a: "Single purchase at $29 for 30 days of full tool access, including all message generation and coaching chat."
  },
  {
    q: "Do I need to know negotiation frameworks?",
    a: "No. The product explains what to ask, when to push, and how to close while preserving your relationship with the hiring team."
  }
];

export function LandingContent() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-8 sm:px-8 lg:px-10">
      <motion.header
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 shadow-2xl shadow-sky-900/10"
        initial={{ opacity: 0, y: 18 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-300">
          <Sparkles className="h-4 w-4" />
          Career Tools
        </div>
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-zinc-100 sm:text-5xl">
          Salary Negotiation AI
          <span className="block bg-gradient-to-r from-sky-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
            AI coach for every message of your offer negotiation
          </span>
        </h1>
        <p className="max-w-3xl text-lg text-zinc-300">
          Paste your offer email and get a sharp counter-offer, recruiter-ready rebuttal, and tactical follow-ups. Move step-by-step until
          your deal is signed.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <PaymentButton children="Unlock for $29" />
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-md border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800/60"
            href="/negotiate"
          >
            See the Tool
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.header>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          {
            title: "The Problem",
            body: "Career tools get you interviews and offers, then leave you alone at the highest-leverage step: negotiation.",
            icon: Target
          },
          {
            title: "The Solution",
            body: "Upload one offer email and get personalized messaging for the exact objections, constraints, and timeline in your case.",
            icon: MessageSquareReply
          },
          {
            title: "The Outcome",
            body: "You negotiate from a position of clarity with a repeatable strategy that protects trust while maximizing comp.",
            icon: ShieldCheck
          }
        ].map((item, index) => (
          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
            initial={{ opacity: 0, y: 16 }}
            key={item.title}
            transition={{ delay: index * 0.08, duration: 0.45 }}
          >
            <item.icon className="h-5 w-5 text-sky-300" />
            <h2 className="mt-3 text-xl font-medium text-zinc-100">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">{item.body}</p>
          </motion.article>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-7">
        <h2 className="text-2xl font-semibold text-zinc-100">What you get in the paid workspace</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            "Offer analyzer that identifies leverage points and hidden risks",
            "Counter-offer drafts tuned to your compensation target",
            "Rebuttal generator for recruiter pushback",
            "Follow-up templates that maintain urgency without pressure",
            "Negotiation coaching chat for each round",
            "Close checklist so you finish cleanly"
          ].map((point) => (
            <div className="flex items-start gap-2 text-sm text-zinc-200" key={point}>
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-7">
          <h3 className="text-lg font-medium uppercase tracking-[0.15em] text-zinc-400">Pricing</h3>
          <p className="mt-3 text-5xl font-semibold text-zinc-100">$29</p>
          <p className="mt-1 text-sm text-zinc-400">One-time purchase · 30-day access</p>
          <p className="mt-5 text-sm leading-relaxed text-zinc-300">
            Designed for engineers who negotiate 1-2 offers per year and want one practical system that pays for itself in a single
            conversation.
          </p>
          <PaymentButton className="mt-6 w-full" children="Buy and Start Negotiating" />
        </article>

        <article className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-7">
          <h3 className="text-2xl font-semibold text-zinc-100">FAQ</h3>
          <div className="mt-5 space-y-5">
            {faqItems.map((item) => (
              <div className="border-b border-zinc-800 pb-4" key={item.q}>
                <p className="font-medium text-zinc-100">{item.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{item.a}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
