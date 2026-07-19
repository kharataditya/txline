"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Goal,
  AlertTriangle,
  Square,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  Eye,
} from "lucide-react";
import type { MatchEvent } from "@/app/lib/types";

interface PulseFeedProps {
  events: MatchEvent[];
}

const eventConfig: Record<
  MatchEvent["type"],
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  goal: {
    icon: Goal,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200/60",
    label: "Goal",
  },
  red_card: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200/60",
    label: "Red Card",
  },
  yellow_card: {
    icon: Square,
    color: "text-amber-500",
    bg: "bg-amber-50 border-amber-200/60",
    label: "Yellow Card",
  },
  substitution: {
    icon: ArrowRightLeft,
    color: "text-slate-500",
    bg: "bg-slate-50 border-slate-200/60",
    label: "Substitution",
  },
  odds_shift: {
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200/60",
    label: "Odds Shift",
  },
  kickoff: {
    icon: Play,
    color: "text-slate-500",
    bg: "bg-slate-50 border-slate-200/60",
    label: "Kick Off",
  },
  half_time: {
    icon: Pause,
    color: "text-slate-500",
    bg: "bg-slate-50 border-slate-200/60",
    label: "Half Time",
  },
  var_review: {
    icon: Eye,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200/60",
    label: "VAR Review",
  },
};

export const PulseFeed: React.FC<PulseFeedProps> = ({ events }) => {
  const feedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest event
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events.length]);

  // Show events in reverse chronological order (newest first)
  const sortedEvents = [...events].sort((a, b) => b.minute - a.minute);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 live-dot"></div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Pulse Feed
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-400">
          {events.length} events
        </span>
      </div>

      {/* Scrollable Event List */}
      <div
        ref={feedRef}
        className="max-h-[420px] overflow-y-auto divide-y divide-slate-100/60"
      >
        <AnimatePresence initial={false}>
          {sortedEvents.map((event, index) => {
            const config = eventConfig[event.type];
            const Icon = config.icon;
            const isOddsShift = event.type === "odds_shift";
            const hasAI = !!event.aiInsight;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.03,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`px-4 py-3.5 hover:bg-slate-50/50 transition-colors ${
                  isOddsShift ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="flex gap-3">
                  {/* Timeline dot + icon */}
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg border ${config.bg}`}
                    >
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                      {event.minute}&apos;
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}
                      >
                        {config.label}
                      </span>
                      {event.player && (
                        <span className="text-[11px] font-semibold text-slate-700">
                          {event.player}
                        </span>
                      )}
                    </div>

                    <p className="text-[13px] text-slate-600 leading-relaxed">
                      {event.description}
                    </p>

                    {/* Odds Change Badge */}
                    {event.oddsChange && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/70 border border-slate-200/60">
                          {event.oddsChange.direction === "down" ? (
                            <TrendingDown className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <TrendingUp className="w-3 h-3 text-red-500" />
                          )}
                          <span className="text-[11px] font-semibold text-slate-600">
                            {event.oddsChange.market}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            {event.oddsChange.previous.toFixed(2)}
                          </span>
                          <span className="text-[11px] text-slate-300">→</span>
                          <span
                            className={`text-[11px] font-bold ${
                              event.oddsChange.direction === "down"
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {event.oddsChange.current.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* AI Insight */}
                    {hasAI && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="mt-2.5 flex gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-100/60"
                      >
                        <Bot className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[12px] text-blue-700 leading-relaxed font-medium">
                          {event.aiInsight}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
