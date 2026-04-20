import type { Metadata } from "next";

import { NegotiationWorkspace } from "@/components/NegotiationWorkspace";

export const metadata: Metadata = {
  title: "Negotiation Workspace | Salary Negotiation AI",
  description:
    "Analyze your offer, generate counter-offer messages, and follow the negotiation timeline to close with confidence.",
};

export default function NegotiatePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <header className="mb-10">
        <p className="mb-3 inline-flex rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-cyan-200">
          Paid Workspace
        </p>
        <h1 className="text-4xl font-semibold text-slate-100">
          Close your offer with an AI negotiation coach
        </h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Use the workflow below in order: analyze the offer email, generate your
          next negotiation message, and move through the timeline until terms are in
          writing.
        </p>
      </header>

      <NegotiationWorkspace />
    </main>
  );
}
