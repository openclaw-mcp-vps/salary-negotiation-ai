import type { Metadata } from "next";
import { Manrope, Space_Grotesk, Geist } from "next/font/google";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const siteUrl = "https://salary-negotiation-ai.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Salary Negotiation AI | AI coach for every offer message",
  description:
    "Paste your offer email and get high-conviction counter-offers, rebuttals, and follow-ups with step-by-step coaching until you close.",
  openGraph: {
    title: "Salary Negotiation AI",
    description:
      "The AI negotiation coach built for engineers who need to close better offers.",
    type: "website",
    url: siteUrl,
    siteName: "Salary Negotiation AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Salary Negotiation AI",
    description:
      "Counter-offers, rebuttals, and follow-up strategy for your entire negotiation cycle.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${heading.variable} ${body.variable} bg-[#0d1117] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
