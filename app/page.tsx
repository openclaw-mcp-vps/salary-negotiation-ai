import type { Metadata } from "next";
import { LandingContent } from "@/components/LandingContent";

export const metadata: Metadata = {
  title: "Salary Negotiation AI | Close Better Offers",
  description:
    "AI coach that writes your counter-offers, rebuttals, and follow-ups from your real offer email.",
  openGraph: {
    title: "Salary Negotiation AI",
    description: "AI coach for every salary negotiation message, from first counter to final close.",
    url: "https://salary-negotiation-ai.app"
  }
};

export default function HomePage() {
  return <LandingContent />;
}
