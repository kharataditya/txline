"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Trophy, RefreshCw } from "lucide-react";
import type { LiveMatch } from "@/app/lib/types";

interface LiveScoreboardProps {
  match: LiveMatch;
  onReload?: () => void;
  isLoading?: boolean;
}

export const LiveScoreboard: React.FC<LiveScoreboardProps> = ({ match, onReload, isLoading }) => {
  return (
    <div
      className="bg-gradient-to-b from-white to-slate-50/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 rounded-[24px] overflow-hidden relative z-10"
    >
      {/* Competition Header */}
      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
          {match.competition}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-slate-400 tabular-nums">
            {match.minute}&apos;
          </span>
          {onReload && (
            <button
              onClick={onReload}
              disabled={isLoading}
              className="ml-1 p-1 -my-1 rounded-md hover:bg-slate-200/50 transition-colors disabled:opacity-50"
              aria-label="Refresh data"
            >
              <RefreshCw className={`w-3 h-3 text-slate-400 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Score Area */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div className="flex justify-center mb-3 drop-shadow-sm">
              <img 
                src={`https://flagcdn.com/${match.home.countryId}.svg`} 
                alt={`${match.home.name} Flag`} 
                className="w-12 h-auto rounded-sm border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] object-cover" 
              />
            </div>
            <div className="text-[15px] font-bold text-slate-800 tracking-tight mt-1">
              {match.home.name}
            </div>
            <div className="inline-block mt-1.5 px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-extrabold text-slate-400 tracking-wider">
              {match.home.code}
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-4 px-4">
            <motion.span
              key={`home-${match.home.score}`}
              initial={{ scale: 1.4, color: "#60a5fa" }}
              animate={{ scale: 1, color: "#0f172a" }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-black tabular-nums tracking-tighter text-slate-900"
            >
              {match.home.score}
            </motion.span>
            <span className="text-2xl font-light text-slate-300 pb-1">:</span>
            <motion.span
              key={`away-${match.away.score}`}
              initial={{ scale: 1.4, color: "#60a5fa" }}
              animate={{ scale: 1, color: "#0f172a" }}
              transition={{ duration: 0.6 }}
              className="text-5xl font-black tabular-nums tracking-tighter text-slate-900"
            >
              {match.away.score}
            </motion.span>
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div className="flex justify-center mb-3 drop-shadow-sm">
              <img 
                src={`https://flagcdn.com/${match.away.countryId}.svg`} 
                alt={`${match.away.name} Flag`} 
                className="w-12 h-auto rounded-sm border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] object-cover" 
              />
            </div>
            <div className="text-[15px] font-bold text-slate-800 tracking-tight mt-1">
              {match.away.name}
            </div>
            <div className="inline-block mt-1.5 px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-extrabold text-slate-400 tracking-wider">
              {match.away.code}
            </div>
          </div>
        </div>
      </div>

      {/* Momentum Bar */}
      <div className="px-6 pb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            Momentum
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
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
            className="bg-gradient-to-r from-slate-300 to-slate-400 rounded-full"
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
      <div className="px-6 pt-3 pb-6">
        <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4">
          Match Winner Odds
        </div>
        <div className="flex items-center justify-between px-2">
          <OddsPill label={`${match.home.code} Win`} value={match.odds.homeWin} />
          <div className="w-px h-6 bg-slate-200"></div>
          <OddsPill label="Draw" value={match.odds.draw} />
          <div className="w-px h-6 bg-slate-200"></div>
          <OddsPill label={`${match.away.code} Win`} value={match.odds.awayWin} />
        </div>
      </div>
    </div>
  );
};

function OddsPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-[14px] font-black text-slate-800 tabular-nums bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] min-w-[64px] text-center">
        {value.toFixed(2)}x
      </span>
    </div>
  );
}
