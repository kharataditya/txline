"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Wifi, WifiOff, Sparkles } from "lucide-react";
import { LiveScoreboard } from "./components/LiveScoreboard";
import { PulseFeed } from "./components/PulseFeed";
import { MicroWagerCard } from "./components/MicroWagerCard";
import type { TxLineResponse, LiveMatch } from "./lib/types";

const POLL_INTERVAL = 15_000; // 15 seconds

export default function Home() {
  const [data, setData] = useState<TxLineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch("/api/txline", { cache: "no-store" });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json: TxLineResponse = await res.json();
      setData(json);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch match data:", err);
      setError("Failed to load match data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Auto-polling
  useEffect(() => {
    const interval = setInterval(() => fetchData(false), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const match: LiveMatch | undefined = data?.matches?.[0];

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-24 space-y-4">
      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-1"
      >
        <div className="flex items-center gap-2">
          {data?.source === "mock" ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/60">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] font-semibold text-amber-700">
                Demo Mode
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/60">
              <Wifi className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-700">
                Live Data
              </span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 border border-red-200/60">
              <WifiOff className="w-3 h-3 text-red-500" />
              <span className="text-[10px] font-semibold text-red-600">
                Offline
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] text-slate-400 font-medium tabular-nums">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchData(true)}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-white/60 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-400 ${
                loading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* Loading State */}
      <AnimatePresence mode="wait">
        {loading && !match && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <LoadingSkeleton />
          </motion.div>
        )}

        {/* Main Content */}
        {match && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Scoreboard */}
            <LiveScoreboard match={match} />

            {/* Micro-Wager Card */}
            {match.activePoll && <MicroWagerCard match={match} />}

            {/* Pulse Feed */}
            {match.events.length > 0 && (
              <PulseFeed events={match.events} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {/* Scoreboard skeleton */}
      <div className="glass-strong rounded-2xl p-6 space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-3 w-40 bg-slate-200 rounded-md"></div>
          <div className="h-5 w-14 bg-red-100 rounded-md"></div>
        </div>
        <div className="flex items-center justify-center gap-8 py-3">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-slate-100 rounded-xl mx-auto"></div>
            <div className="h-3 w-16 bg-slate-200 rounded mx-auto"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
            <div className="text-xl text-slate-200">:</div>
            <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
          </div>
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-slate-100 rounded-xl mx-auto"></div>
            <div className="h-3 w-16 bg-slate-200 rounded mx-auto"></div>
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full"></div>
      </div>

      {/* Wager skeleton */}
      <div className="glass-strong rounded-2xl p-5 space-y-4 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-xl"></div>
          <div className="h-3 w-24 bg-slate-200 rounded-md"></div>
        </div>
        <div className="h-5 w-3/4 bg-slate-200 rounded-md"></div>
        <div className="h-16 w-full bg-blue-50 rounded-xl"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-blue-100 rounded-xl"></div>
          <div className="h-16 bg-slate-100 rounded-xl"></div>
        </div>
      </div>

      {/* Feed skeleton */}
      <div className="glass rounded-2xl overflow-hidden animate-pulse">
        <div className="px-5 py-3 border-b border-white/20">
          <div className="h-3 w-24 bg-slate-200 rounded-md"></div>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="px-4 py-3.5 flex gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-20 bg-slate-200 rounded"></div>
              <div className="h-3 w-full bg-slate-100 rounded"></div>
              <div className="h-3 w-2/3 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
