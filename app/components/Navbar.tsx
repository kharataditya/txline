"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import WalletMultiButton to avoid SSR issues
const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full px-4 pt-4 pb-2">
      <nav className="max-w-md mx-auto bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo Text Only */}
          <div className="flex flex-col">
            <span className="text-[19px] font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
              Pulse<span className="text-blue-600">Bet</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 -mt-0.5 tracking-wider uppercase">
              AI · World Cup
            </span>
          </div>

          {/* Wallet Button */}
          <div className="flex items-center drop-shadow-sm">
            <WalletMultiButton />
          </div>
        </div>
      </nav>
    </header>
  );
};
