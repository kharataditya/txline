import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SolanaProvider } from "./components/SolanaProvider";
import { Navbar } from "./components/Navbar";

export const metadata: Metadata = {
  title: "PulseBet AI | Real-Time World Cup Micro-Wagering",
  description:
    "AI-powered live insights and micro-wagering for the FIFA World Cup. Real-time odds, momentum shifts, and on-chain Solana bets.",
  keywords: ["World Cup", "AI", "Sports Betting", "Solana", "Web3", "Live Odds"],
  openGraph: {
    title: "PulseBet AI",
    description: "Real-time AI sports insights & micro-wagering on Solana",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SolanaProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </SolanaProvider>
      </body>
    </html>
  );
}
