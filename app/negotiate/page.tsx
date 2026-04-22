import type { Metadata } from "next";
import { cookies } from "next/headers";
import { PaymentButton } from "@/components/PaymentButton";
import { NegotiationWorkbench } from "@/components/NegotiationWorkbench";
import { UnlockAccessForm } from "@/components/UnlockAccessForm";
import { ACCESS_COOKIE_NAME, verifySignedAccessToken } from "@/lib/access";
import { hasAccessSession } from "@/lib/database";

export const metadata: Metadata = {
  title: "Negotiation Workspace | Salary Negotiation AI",
  description: "Analyze offer emails and generate strategy-backed negotiation messages with AI guidance."
};

async function canAccessWorkspace() {
  const cookieStore = await cookies();
  const signedValue = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const token = verifySignedAccessToken(signedValue);

  if (!token) {
    return false;
  }

  return hasAccessSession(token);
}

export default async function NegotiatePage() {
  const hasAccess = await canAccessWorkspace();

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <header className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h1 className="text-3xl font-semibold text-zinc-100">Salary Negotiation AI Workspace</h1>
        <p className="mt-2 max-w-3xl text-zinc-300">
          Build your negotiation from first counter to final close. Start with offer analysis, generate your next message, then pressure-test
          each recruiter reply in coach chat.
        </p>
      </header>

      {hasAccess ? (
        <NegotiationWorkbench />
      ) : (
        <section className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-2xl font-semibold text-zinc-100">This workspace is behind a paid access gate</h2>
          <p className="text-zinc-300">
            Purchase access, then unlock with the checkout email. Access is stored in a secure cookie on this browser.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PaymentButton children="Buy Access for $29" />
          </div>
          <UnlockAccessForm />
        </section>
      )}
    </main>
  );
}
