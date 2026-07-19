"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Trophy } from "lucide-react";
import type { LiveMatch } from "@/app/lib/types";

interface LiveScoreboardProps {
  match: LiveMatch;
}

export const LiveScoreboard: React.FC<LiveScoreboardProps> = ({ match }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong rounded-2xl overflow-hidden"
    >
      {/* Competition Header */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {match.competition}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {match.status === "live" && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 border border-red-200/50">
            <Clock className="w-3 h-3 text-red-600" />
            <span className="text-[11px] font-bold text-red-700 tabular-nums">
              {match.minute}&apos;
            </span>
          </div>
        </div>
      </div>

      {/* Score Area */}
      <div className="px-5 py-5">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="text-3xl mb-2">{match.home.flag}</div>
            <div className="text-sm font-bold text-slate-900 mb-0.5">
              {match.home.name}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase">
              {match.home.code}
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-3 px-4">
            <motion.span
              key={`home-${match.home.score}`}
              initial={{ scale: 1.4, color: "#2563eb" }}
              animate={{ scale: 1, color: "#0f172a" }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-extrabold tabular-nums"
            >
              {match.home.score}
            </motion.span>
            <span className="text-xl font-light text-slate-300">:</span>
            <motion.span
              key={`away-${match.away.score}`}
              initial={{ scale: 1.4, color: "#2563eb" }}
              animate={{ scale: 1, color: "#0f172a" }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-extrabold tabular-nums"
            >
              {match.away.score}
            </motion.span>
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="text-3xl mb-2">{match.away.flag}</div>
            <div className="text-sm font-bold text-slate-900 mb-0.5">
              {match.away.name}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase">
              {match.away.code}
            </div>
          </div>
        </div>
      </div>

      {/* Momentum Bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Momentum
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wide ${
              match.momentum === "home"
                ? "text-blue-600"
                : match.momentum === "away"
                ? "text-purple-600"
                : "text-slate-400"
            }`}
          >
            {match.momentum === "home"
              ? `→ ${match.home.code}`
              : match.momentum === "away"
              ? `→ ${match.away.code}`
              : "Neutral"}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
            initial={{ width: "50%" }}
            animate={{
              width:
                match.momentum === "home"
                  ? "65%"
                  : match.momentum === "away"
                  ? "35%"
                  : "50%",
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          <motion.div
            className="bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"
            initial={{ width: "50%" }}
            animate={{
              width:
                match.momentum === "away"
                  ? "65%"
                  : match.momentum === "home"
                  ? "35%"
                  : "50%",
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] font-medium text-slate-400">{match.home.code}</span>
          <span className="text-[10px] font-medium text-slate-400">{match.away.code}</span>
        </div>
      </div>

      {/* Odds Strip */}
      <div className="border-t border-white/30 px-5 py-3 flex items-center justify-between bg-slate-50/50">
        <OddsPill label={match.home.code} value={match.odds.homeWin} />
        <OddsPill label="Draw" value={match.odds.draw} />
        <OddsPill label={match.away.code} value={match.odds.awayWin} />
      </div>
    </motion.div>
  );
};

function OddsPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] font-medium text-slate-400">{label}</span>
      <span className="text-sm font-bold text-slate-700 tabular-nums">
        {value.toFixed(2)}
      </span>
    </div>
  );
}
