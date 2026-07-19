"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, Clock, Check, Loader2, X } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import type { LiveMatch } from "@/app/lib/types";

// Hardcoded treasury wallet address (Devnet)
const TREASURY_WALLET = new PublicKey(
  "DRpbCBMxVnDK7maPMoGQfFiCRHBnHNnHSyp8ctGYjCqH"
);

const BET_AMOUNT_SOL = 0.01;

interface MicroWagerCardProps {
  match: LiveMatch;
}

type TxStatus = "idle" | "signing" | "confirming" | "success" | "error";

export const MicroWagerCard: React.FC<MicroWagerCardProps> = ({ match }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [dismissed, setDismissed] = useState(false);

  const poll = match.activePoll;

  // Countdown timer
  useEffect(() => {
    if (!poll) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, poll.expiresAt - Date.now());
      setTimeLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [poll]);

  const formatTime = useCallback((ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  const handleBet = useCallback(
    async (optionIndex: number) => {
      if (!publicKey || !connected) {
        setErrorMessage("Please connect your wallet first");
        return;
      }

      setSelectedOption(optionIndex);
      setTxStatus("signing");
      setErrorMessage(null);

      try {
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: TREASURY_WALLET,
            lamports: BET_AMOUNT_SOL * LAMPORTS_PER_SOL,
          })
        );

        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        setTxStatus("confirming");
        const signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction(
          { signature, blockhash, lastValidBlockHeight },
          "confirmed"
        );

        setTxSignature(signature);
        setTxStatus("success");
      } catch (err) {
        console.error("Transaction failed:", err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        
        // If the user simply closed the Phantom popup or rejected it, fail silently and reset
        if (errorMsg.toLowerCase().includes("reject") || errorMsg.toLowerCase().includes("cancel")) {
          setTxStatus("idle");
          setSelectedOption(null);
          setErrorMessage(null);
          return;
        }

        // For real errors, show the error state
        setTxStatus("error");
        setErrorMessage("Transaction failed. Please try again.");
        
        // Reset after 3 seconds
        setTimeout(() => {
          setTxStatus("idle");
          setSelectedOption(null);
          setErrorMessage(null);
        }, 3000);
      }
    },
    [publicKey, connected, connection, sendTransaction]
  );

  if (!poll || dismissed) return null;

  return (
    <AnimatePresence>
      <div
        className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 rounded-2xl overflow-hidden relative z-10"
      >
        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss micro-wager"
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none transition-colors z-10"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-3 flex items-center gap-3">
          <Bot className="w-4 h-4 text-slate-400" />
          <div>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
              AI Micro-Wager
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-medium">
                Triggered by odds shift
              </span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="px-6 pb-2">
          <h3 className="text-[19px] font-extrabold text-slate-800 leading-tight">
            {poll.question}
          </h3>

          {/* AI Insight */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.5, type: "spring", bounce: 0.4 }}
            className="mt-5 p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex gap-3.5 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
          >
            <Bot className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-slate-600 leading-relaxed font-medium">
              {poll.insight}
            </p>
          </motion.div>

          {/* Timer */}
          <div className="flex items-center gap-2 mt-5 mb-5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500">
              Expires in{" "}
              <span className="text-slate-900 tabular-nums">
                {formatTime(timeLeft)}
              </span>
            </span>
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden ml-2">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                initial={{ width: "100%" }}
                animate={{
                  width: `${Math.max(
                    0,
                    (timeLeft / (5 * 60 * 1000)) * 100
                  )}%`,
                }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Success State */}
          {txStatus === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex flex-col items-center gap-4 py-6 px-5 mt-2 bg-gradient-to-b from-emerald-50/50 to-transparent rounded-2xl border border-emerald-100/50"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_4px_20px_rgba(16,185,129,0.4)]">
                <Check className="w-8 h-8 text-white stroke-[2.5]" />
              </div>
              
              <div className="text-center space-y-1">
                <h4 className="text-xl font-black text-slate-800 tracking-tight">
                  Wager Confirmed
                </h4>
                <p className="text-[12px] font-medium text-emerald-600/80">
                  Transaction successfully verified on-chain.
                </p>
              </div>

              <div className="flex items-center gap-2.5 bg-white border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-xl px-4 py-2.5 w-full justify-center">
                <span className="text-[12px] font-semibold text-slate-500">
                  {BET_AMOUNT_SOL} SOL on <span className="text-slate-800 font-bold">&quot;{poll.options[selectedOption!]?.label}&quot;</span>
                </span>
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                <span className="text-[13px] font-black text-emerald-500">
                  {poll.options[selectedOption!]?.multiplier}x
                </span>
              </div>

              {txSignature && (
                <a
                  href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full gap-1.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-[12px] font-bold text-slate-500 hover:text-slate-700 transition-colors border border-slate-100 mt-2"
                >
                  View on Solana Explorer
                  <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
              )}
            </motion.div>
          )}

          {/* Bet Buttons */}
          {txStatus !== "success" && (
            <div className="grid grid-cols-2 gap-3">
              {poll.options.map((option, idx) => {
                const isLoading =
                  selectedOption === idx &&
                  (txStatus === "signing" || txStatus === "confirming");
                const isDisabled =
                  txStatus === "signing" || txStatus === "confirming";

                return (
                  <motion.button
                    key={option.label}
                    whileHover={!isDisabled ? { scale: 1.02 } : {}}
                    whileTap={!isDisabled ? { scale: 0.94, transition: { type: "spring", stiffness: 400, damping: 10 } } : {}}
                    onClick={() => handleBet(idx)}
                    disabled={isDisabled}
                    aria-label={`Bet ${BET_AMOUNT_SOL} SOL on ${option.label} at ${option.multiplier}x odds`}
                    className={`group relative flex flex-col items-center gap-1 py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus:outline-none ${
                      idx === 0
                        ? "bg-transparent border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white hover:shadow-[0_8px_20px_rgba(59,130,246,0.3)]"
                        : "bg-transparent border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white hover:shadow-[0_8px_20px_rgba(30,41,59,0.2)]"
                    } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span className="text-sm font-bold">
                          {option.label}
                        </span>
                        <span
                          className={`text-xs font-semibold transition-colors duration-300 ${
                            idx === 0
                              ? "text-blue-500/80 group-hover:text-blue-100"
                              : "text-slate-500 group-hover:text-slate-300"
                          }`}
                        >
                          <span
                            className={`font-bold transition-colors duration-300 ${
                              idx === 0
                                ? "text-blue-600 group-hover:text-white"
                                : "text-slate-900 group-hover:text-white"
                            }`}
                          >
                            {option.multiplier}x
                          </span>{" "}
                          · {BET_AMOUNT_SOL} SOL
                        </span>
                      </>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && txStatus === "error" && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-red-400 font-medium text-center mt-3 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30"
            >
              {errorMessage}
            </motion.p>
          )}

          {/* Not connected hint */}
          {!connected && txStatus === "idle" && (
            <p className="text-[11px] text-slate-500 text-center mt-4 mb-2 font-medium">
              Connect your Solana wallet to place a bet
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-50 mt-4">
          <span className="text-[10px] text-slate-400">
            Solana Devnet
          </span>
          <span className="text-[10px] text-slate-400 tabular-nums">
            {BET_AMOUNT_SOL} SOL / bet
          </span>
        </div>
      </div>
    </AnimatePresence>
  );
};
