// Shared types for TxLINE match data used across API and components

export interface Team {
  name: string;
  code: string;      // 3-letter code (e.g., "ARG")
  countryId: string; // 2-letter ISO code (e.g., "ar", "fr") for FlagCDN
  flag: string;      // emoji flag
  score: number;
}

export interface MatchEvent {
  id: string;
  type: "goal" | "red_card" | "yellow_card" | "substitution" | "odds_shift" | "kickoff" | "half_time" | "var_review";
  minute: number;
  team?: "home" | "away";
  player?: string;
  description: string;
  // For odds_shift events
  oddsChange?: {
    market: string;
    previous: number;
    current: number;
    direction: "up" | "down";
  };
  // AI-generated insight attached to significant events
  aiInsight?: string;
}

export interface MatchOdds {
  homeWin: number;
  draw: number;
  awayWin: number;
  nextGoalHome: number;
  nextGoalAway: number;
}

export interface LiveMatch {
  id: string;
  competition: string;
  status: "live" | "half_time" | "finished" | "not_started";
  minute: number;
  home: Team;
  away: Team;
  events: MatchEvent[];
  odds: MatchOdds;
  momentum: "home" | "away" | "neutral";
  // AI micro-poll data
  activePoll?: {
    id: string;
    question: string;
    insight: string;
    options: { label: string; multiplier: number }[];
    expiresAt: number; // unix timestamp
    triggeredBy: string; // event id
  };
}

export interface TxLineResponse {
  matches: LiveMatch[];
  timestamp: number;
  source: "live" | "mock";
}
