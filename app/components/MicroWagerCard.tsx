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
        setTxStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Transaction failed"
        );
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
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-strong rounded-2xl overflow-hidden relative"
      >
        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100/60 transition-colors z-10"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>

        {/* AI Accent Strip */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

        {/* Header */}
        <div className="px-5 pt-4 pb-2 flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              AI Micro-Wager
            </span>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] text-slate-400 font-medium">
                Triggered by odds shift
              </span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="px-5 py-3">
          <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3">
            {poll.question}
          </h3>

          {/* AI Insight */}
          <div className="flex gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-100/60 mb-4">
            <Bot className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-blue-700 leading-relaxed font-medium">
              {poll.insight}
            </p>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 mb-4">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500">
              Expires in{" "}
              <span className="text-slate-700 tabular-nums">
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/60">
                <Check className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-900">
                  Bet Placed! 🎉
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {BET_AMOUNT_SOL} SOL on &quot;
                  {poll.options[selectedOption!]?.label}&quot; @{" "}
                  {poll.options[selectedOption!]?.multiplier}x
                </p>
                {txSignature && (
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    View on Solana Explorer →
                  </a>
                )}
              </div>
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
                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    onClick={() => handleBet(idx)}
                    disabled={isDisabled}
                    className={`relative flex flex-col items-center gap-1.5 py-4 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      idx === 0
                        ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                        : "bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    } ${isDisabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span className="text-sm font-bold">
                          {option.label}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            idx === 0
                              ? "text-blue-200"
                              : "text-slate-400"
                          }`}
                        >
                          {option.multiplier}x · {BET_AMOUNT_SOL} SOL
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
              className="text-[11px] text-red-600 font-medium text-center mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200/60"
            >
              {errorMessage}
            </motion.p>
          )}

          {/* Not connected hint */}
          {!connected && txStatus === "idle" && (
            <p className="text-[11px] text-slate-400 text-center mt-3 font-medium">
              Connect your Solana wallet to place a bet
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-white/20 bg-slate-50/30 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            Powered by Solana Devnet
          </span>
          <span className="text-[10px] text-slate-400 tabular-nums">
            {BET_AMOUNT_SOL} SOL per bet
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
