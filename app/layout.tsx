import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "@/app/globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://salary-negotiation-ai.app"),
  title: "Salary Negotiation AI | AI coach for every message of your offer negotiation",
  description:
    "Paste your offer email and get an AI-generated counter-offer, rebuttal, and follow-up playbook until you close.",
  openGraph: {
    title: "Salary Negotiation AI",
    description:
      "AI coaching for every step of your offer negotiation: counter-offers, rebuttals, and close strategy.",
    type: "website",
    url: "https://salary-negotiation-ai.app",
    siteName: "Salary Negotiation AI"
  },
  twitter: {
    card: "summary_large_image",
    title: "Salary Negotiation AI",
    description:
      "AI writes your negotiation messages and coaches you through each move until you close."
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${headingFont.variable} ${monoFont.variable} min-h-screen bg-[#0d1117] font-[var(--font-heading)] text-zinc-100 antialiased`}
      >
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.16),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.12),transparent_35%),linear-gradient(to_bottom,#0d1117,#0d1117)]" />
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  );
}
