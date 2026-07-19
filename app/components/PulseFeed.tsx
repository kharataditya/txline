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
  ArrowRight,
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
    bg: "bg-gradient-to-br from-emerald-400 to-emerald-500 border-emerald-500/20 shadow-[0_2px_10px_rgba(16,185,129,0.3)]",
    label: "Goal",
  },
  red_card: {
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-gradient-to-br from-red-400 to-red-500 border-red-500/20 shadow-[0_2px_10px_rgba(239,68,68,0.3)]",
    label: "Red Card",
  },
  yellow_card: {
    icon: Square,
    color: "text-amber-600",
    bg: "bg-gradient-to-br from-amber-300 to-amber-400 border-amber-400/20 shadow-[0_2px_10px_rgba(251,191,36,0.3)]",
    label: "Yellow Card",
  },
  substitution: {
    icon: ArrowRightLeft,
    color: "text-slate-600",
    bg: "bg-gradient-to-br from-slate-300 to-slate-400 border-slate-400/20 shadow-[0_2px_10px_rgba(100,116,139,0.2)]",
    label: "Substitution",
  },
  odds_shift: {
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-gradient-to-br from-blue-400 to-indigo-500 border-blue-500/20 shadow-[0_2px_10px_rgba(59,130,246,0.3)]",
    label: "Odds Shift",
  },
  kickoff: {
    icon: Play,
    color: "text-slate-600",
    bg: "bg-gradient-to-br from-slate-400 to-slate-500 border-slate-500/20 shadow-[0_2px_10px_rgba(100,116,139,0.2)]",
    label: "Match Start",
  },
  half_time: {
    icon: Pause,
    color: "text-slate-600",
    bg: "bg-gradient-to-br from-slate-400 to-slate-500 border-slate-500/20 shadow-[0_2px_10px_rgba(100,116,139,0.2)]",
    label: "Half Time",
  },
  var_review: {
    icon: Eye,
    color: "text-indigo-600",
    bg: "bg-gradient-to-br from-indigo-400 to-purple-500 border-indigo-500/20 shadow-[0_2px_10px_rgba(99,102,241,0.3)]",
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
    <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
          Match Events
        </span>
        <span className="text-[10px] font-medium text-slate-400">
          {events.length} events
        </span>
      </div>

      {/* Scrollable Event List */}
      <div
        ref={feedRef}
        className="max-h-[420px] overflow-y-auto relative"
      >
        {/* Continuous Timeline Line */}
        <div className="absolute left-[39px] top-6 bottom-6 w-[2px] bg-slate-100/80 z-0"></div>
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
                className="relative px-6 py-5 hover:bg-slate-50/60 transition-colors group"
              >
                <div className="flex gap-3.5 relative z-10">
                  {/* Timeline dot + icon */}
                  <div className="flex flex-col items-center gap-1.5 pt-0.5">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border shadow-sm ring-4 ring-white ${config.bg}`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                      {event.minute}&apos;
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-[10.5px] font-extrabold uppercase tracking-widest ${config.color}`}
                      >
                        {config.label}
                      </span>
                      {event.player && (
                        <span className="text-[11.5px] font-bold text-slate-800">
                          {event.player}
                        </span>
                      )}
                    </div>

                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                      {event.description}
                    </p>

                    {/* Odds Change Badge */}
                    {event.oddsChange && (
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {event.oddsChange.market}
                          </span>
                          <div className="h-4 w-px bg-slate-200"></div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11.5px] font-bold text-slate-400 line-through decoration-slate-300">
                              {event.oddsChange.previous.toFixed(2)}x
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                            <span
                              className={`text-[12px] font-extrabold px-1.5 py-0.5 rounded-md ${
                                event.oddsChange.direction === "down"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {event.oddsChange.current.toFixed(2)}x
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Insight */}
                    {hasAI && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="mt-3 flex gap-3 px-3.5 py-3 rounded-xl bg-blue-50/50 border border-blue-100/50 shadow-sm"
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 flex-shrink-0">
                          <Bot className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <p className="text-[12.5px] text-slate-700 leading-relaxed font-medium pt-0.5">
                          {event.aiInsight?.replace('AI Pundit: ', '').replace('AI Insight: ', '')}
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
