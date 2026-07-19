"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Activity } from "lucide-react";

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="glass-strong mx-auto">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/20">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
              {/* Live ring */}
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-white"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900">
                Pulse<span className="gradient-text">Bet</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 -mt-0.5 tracking-wide uppercase">
                AI · World Cup
              </span>
            </div>
          </div>

          {/* Wallet Button */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/60">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot"></div>
              <span className="text-[11px] font-semibold text-emerald-700">
                Devnet
              </span>
            </div>
            <WalletMultiButton />
          </div>
        </div>
      </nav>
    </header>
  );
};
