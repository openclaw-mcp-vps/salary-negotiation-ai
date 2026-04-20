import { ArrowRight, CircleDollarSign, MessageCircleMore, Target } from "lucide-react";

import { PricingSection } from "@/components/PricingSection";

const problemPoints = [
  "Most candidates negotiate once or twice a year and walk in underprepared.",
  "Recruiters are trained negotiators; most engineers improvise message-by-message.",
  "Career platforms help you get interviews, not maximize your signed offer.",
];

const solutionPoints = [
  {
    title: "Paste your offer email",
    description:
      "Get a precise breakdown of compensation, leverage, and hidden risk flags before you reply.",
    icon: CircleDollarSign,
  },
  {
    title: "Generate the right response",
    description:
      "Create your counter-offer, rebuttal, and follow-up messages with clear strategy baked in.",
    icon: MessageCircleMore,
  },
  {
    title: "Close with confidence",
    description:
      "Use a step-by-step timeline so every next message moves the deal toward signature.",
    icon: Target,
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative mx-auto flex min-h-[86vh] w-full max-w-6xl flex-col justify-center px-6 pb-20 pt-16">
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative">
          <p className="mb-4 inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-cyan-200">
            Career Tools • Negotiation Layer
          </p>
          <h1 className="max-w-4xl text-balance text-4xl font-semibold leading-tight sm:text-6xl">
            Salary Negotiation AI
            <span className="mt-2 block text-cyan-200">
              AI coach for every message of your offer negotiation
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Paste your offer email. Get a high-conviction counter-offer, tactical
            rebuttals, and follow-up sequences so you negotiate like a professional,
            from first response to final close.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Unlock the Negotiation Coach
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/negotiate"
              className="inline-flex items-center gap-2 rounded-md border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            >
              Open Workspace
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {problemPoints.map((item) => (
            <article
              key={item}
              className="rounded-xl border border-rose-400/20 bg-rose-500/5 p-5"
            >
              <p className="text-sm leading-relaxed text-slate-200">{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-8 text-3xl font-semibold text-slate-100 sm:text-4xl">
          Built for the missing step after job search: negotiation execution
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {solutionPoints.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-6"
              >
                <Icon className="mb-4 h-6 w-6 text-cyan-300" />
                <h3 className="mb-2 text-xl font-semibold text-slate-100">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <PricingSection />
    </main>
  );
}
