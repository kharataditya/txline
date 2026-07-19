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
    <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Status Bar Removed for Minimalism */}

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
          <div
            key="content"
            className="space-y-4"
          >
            {/* Scoreboard */}
            <LiveScoreboard 
              match={match} 
              onReload={() => fetchData(true)} 
              isLoading={loading} 
            />

            {/* Micro-Wager Card */}
            {match.activePoll && <MicroWagerCard match={match} />}

            {/* Pulse Feed */}
            {match.events.length > 0 && (
              <PulseFeed events={match.events} />
            )}
          </div>
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
          <div className="h-5 w-14 bg-red-500/20 rounded-md"></div>
        </div>
        <div className="flex items-center justify-center gap-8 py-3">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 bg-slate-100 rounded-xl mx-auto"></div>
            <div className="h-3 w-16 bg-slate-200 rounded mx-auto"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
            <div className="text-xl text-slate-300">:</div>
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
          <div className="w-8 h-8 bg-blue-500/20 rounded-xl"></div>
          <div className="h-3 w-24 bg-slate-200 rounded-md"></div>
        </div>
        <div className="h-5 w-3/4 bg-slate-200 rounded-md"></div>
        <div className="h-16 w-full bg-blue-500/10 rounded-xl"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-blue-500/20 rounded-xl"></div>
          <div className="h-16 bg-slate-100 rounded-xl"></div>
        </div>
      </div>

      {/* Feed skeleton */}
      <div className="glass rounded-2xl overflow-hidden animate-pulse">
        <div className="px-5 py-3 border-b border-slate-200">
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
