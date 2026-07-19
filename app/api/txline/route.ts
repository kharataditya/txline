import { NextResponse } from "next/server";
import { getMockMatchData } from "@/app/lib/mock-data";
import type { TxLineResponse, LiveMatch, MatchEvent, MatchOdds } from "@/app/lib/types";

/**
 * TxLINE API Configuration
 * 
 * TxLINE is a token-gated API requiring:
 *   1. Guest JWT from POST /auth/guest/start
 *   2. On-chain Solana subscription (free for World Cup)
 *   3. API token from POST /api/token/activate
 * 
 * Set these env vars after completing TxLINE activation:
 *   TXLINE_JWT       – Guest JWT from /auth/guest/start
 *   TXLINE_API_TOKEN – Activated API token from /api/token/activate
 *   TXLINE_NETWORK   – "mainnet" or "devnet" (default: "mainnet")
 */

const TXLINE_CONFIG = {
  mainnet: {
    apiBase: "https://txline.txodds.com/api",
    authUrl: "https://txline.txodds.com/auth/guest/start",
  },
  devnet: {
    apiBase: "https://txline-dev.txodds.com/api",
    authUrl: "https://txline-dev.txodds.com/auth/guest/start",
  },
} as const;

export const dynamic = "force-dynamic";

export async function GET() {
  const jwt = process.env.TXLINE_JWT;
  const apiToken = process.env.TXLINE_API_TOKEN;
  const network = (process.env.TXLINE_NETWORK || "mainnet") as "mainnet" | "devnet";

  // If no TxLINE credentials configured, return mock data (demo mode)
  if (!jwt || !apiToken) {
    console.log("TxLINE credentials not configured. Serving mock data for demo.");
    return NextResponse.json(getMockMatchData());
  }

  const config = TXLINE_CONFIG[network];

  try {
    // Fetch fixtures and find live/in-progress World Cup matches
    const headers = {
      Authorization: `Bearer ${jwt}`,
      "X-Api-Token": apiToken,
      "Content-Type": "application/json",
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // 1) Get fixtures snapshot (World Cup fixtures)
    const fixturesRes = await fetch(`${config.apiBase}/fixtures/snapshot`, {
      headers,
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (fixturesRes.status === 401) {
      console.warn("TxLINE JWT expired. Falling back to mock data.");
      return NextResponse.json(getMockMatchData());
    }

    if (!fixturesRes.ok) {
      console.warn(`TxLINE fixtures API returned ${fixturesRes.status}`);
      return NextResponse.json(getMockMatchData());
    }

    const fixtures = await fixturesRes.json();

    if (!Array.isArray(fixtures) || fixtures.length === 0) {
      console.log("No fixtures returned. Using mock data.");
      return NextResponse.json(getMockMatchData());
    }

    // Find live fixtures (GamePhase: H1=2, HT=3, H2=4, etc.)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const liveFixtures = fixtures.filter((f: any) => {
      const phase = f.GamePhase || f.gamePhase;
      return phase && phase >= 2 && phase <= 13; // H1 through FPE
    });

    if (liveFixtures.length === 0) {
      // No live matches — try to find the most recent or next fixture for demo
      console.log("No live World Cup matches right now. Using mock data.");
      return NextResponse.json(getMockMatchData());
    }

    // Take the first live fixture
    const fixture = liveFixtures[0];
    const fixtureId = fixture.FixtureId || fixture.fixtureId;

    // 2) Fetch odds snapshot for this fixture
    let odds: MatchOdds = {
      homeWin: 2.0, draw: 3.0, awayWin: 2.5,
      nextGoalHome: 1.8, nextGoalAway: 1.9,
    };

    try {
      const oddsRes = await fetch(`${config.apiBase}/odds/snapshot/${fixtureId}`, {
        headers, cache: "no-store",
      });
      if (oddsRes.ok) {
        const oddsData = await oddsRes.json();
        odds = normalizeOdds(oddsData);
      }
    } catch (e) {
      console.warn("Failed to fetch odds:", e);
    }

    // 3) Fetch scores snapshot for this fixture
    let events: MatchEvent[] = [];
    let scores = { home: 0, away: 0 };
    let gamePhase = 2;

    try {
      const scoresRes = await fetch(`${config.apiBase}/scores/snapshot/${fixtureId}`, {
        headers, cache: "no-store",
      });
      if (scoresRes.ok) {
        const scoresData = await scoresRes.json();
        const parsed = normalizeScores(scoresData);
        events = parsed.events;
        scores = parsed.scores;
        gamePhase = parsed.gamePhase;
      }
    } catch (e) {
      console.warn("Failed to fetch scores:", e);
    }

    // 4) Build normalized match object
    const isHome = fixture.Participant1IsHome !== false;
    const homeTeam = isHome ? fixture.Participant1 : fixture.Participant2;
    const awayTeam = isHome ? fixture.Participant2 : fixture.Participant1;

    const match: LiveMatch = {
      id: String(fixtureId),
      competition: fixture.CompetitionName || fixture.Competition || "FIFA World Cup 2026",
      status: gamePhaseToStatus(gamePhase),
      minute: estimateMinute(gamePhase, fixture.StartTime),
      home: {
        name: homeTeam || "Home",
        code: abbreviate(homeTeam || "HOM"),
        flag: "⚽",
        score: scores.home,
      },
      away: {
        name: awayTeam || "Away",
        code: abbreviate(awayTeam || "AWY"),
        flag: "⚽",
        score: scores.away,
      },
      events,
      odds,
      momentum: determineMomentum(events),
      activePoll: generatePollFromEvents(events, homeTeam, awayTeam, odds),
    };

    const response: TxLineResponse = {
      matches: [match],
      timestamp: Date.now(),
      source: "live",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.warn("TxLINE API fetch failed:", error);
    return NextResponse.json(getMockMatchData());
  }
}

// ── Normalization Helpers ─────────────────────────────────────────

function gamePhaseToStatus(phase: number): LiveMatch["status"] {
  if (phase === 1) return "not_started";
  if (phase === 3) return "half_time";
  if (phase >= 5 && phase !== 6 && phase !== 7 && phase !== 8 && phase !== 9 && phase !== 11 && phase !== 12)
    return "finished";
  return "live";
}

function estimateMinute(gamePhase: number, startTime?: string): number {
  if (!startTime) return 0;
  const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
  if (gamePhase === 1) return 0;
  if (gamePhase === 2) return Math.min(elapsed, 45);           // H1
  if (gamePhase === 3) return 45;                               // HT
  if (gamePhase === 4) return Math.min(45 + elapsed - 60, 90); // H2 (approx)
  return Math.min(elapsed, 120);
}

function abbreviate(name: string): string {
  if (name.length <= 3) return name.toUpperCase();
  return name.slice(0, 3).toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOdds(oddsData: any[]): MatchOdds {
  const result: MatchOdds = {
    homeWin: 2.0, draw: 3.0, awayWin: 2.5,
    nextGoalHome: 1.8, nextGoalAway: 1.9,
  };

  if (!Array.isArray(oddsData)) return result;

  for (const entry of oddsData) {
    const market = entry.MarketType || entry.marketType || "";
    const outcomes = entry.Outcomes || entry.outcomes || [];

    if (market === "1X2" || market === "match_winner") {
      for (const o of outcomes) {
        const type = o.OutcomeType || o.outcomeType || "";
        const price = o.Price || o.price || o.StablePrice || 0;
        if (type === "1" || type === "Home") result.homeWin = price;
        if (type === "X" || type === "Draw") result.draw = price;
        if (type === "2" || type === "Away") result.awayWin = price;
      }
    }
  }

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeScores(scoresData: any): {
  events: MatchEvent[];
  scores: { home: number; away: number };
  gamePhase: number;
} {
  const events: MatchEvent[] = [];
  let homeGoals = 0;
  let awayGoals = 0;
  let gamePhase = 2;

  const entries = Array.isArray(scoresData) ? scoresData : [scoresData];

  for (const entry of entries) {
    if (entry.gamePhase || entry.GamePhase) {
      gamePhase = entry.gamePhase || entry.GamePhase;
    }

    // Extract stats (goals, cards, etc.)
    const stats = entry.Stats || entry.stats || {};
    if (stats["1"] !== undefined) homeGoals = Number(stats["1"]);
    if (stats["2"] !== undefined) awayGoals = Number(stats["2"]);

    // Extract actions/events
    const actions = entry.Actions || entry.actions || [];
    for (const action of actions) {
      const evt = actionToEvent(action);
      if (evt) events.push(evt);
    }
  }

  return { events, scores: { home: homeGoals, away: awayGoals }, gamePhase };
}

let eventCounter = 0;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function actionToEvent(action: any): MatchEvent | null {
  const type = action.Type || action.type || action.action || "";
  const minute = action.Minute || action.minute || action.MatchMinute || 0;
  const participant = action.Participant || action.participant;
  const team = participant === 1 ? "home" as const : participant === 2 ? "away" as const : undefined;
  const data = action.Data || action.data || {};
  const id = `txl-${++eventCounter}`;

  switch (type.toLowerCase()) {
    case "goal":
      return {
        id, type: "goal", minute, team,
        player: data.Player || data.player || undefined,
        description: data.Player ? `${data.Player} scores!` : "Goal!",
      };
    case "yellow_card":
      return {
        id, type: "yellow_card", minute, team,
        player: data.Player || data.player || undefined,
        description: data.Player ? `${data.Player} receives a yellow card` : "Yellow card shown",
      };
    case "red_card":
    case "second_yellow_card":
      return {
        id, type: "red_card", minute, team,
        player: data.Player || data.player || undefined,
        description: data.Player ? `${data.Player} sent off!` : "Red card!",
      };
    case "substitution":
      return {
        id, type: "substitution", minute, team,
        player: data.PlayerIn && data.PlayerOut ? `${data.PlayerOut} → ${data.PlayerIn}` : undefined,
        description: "Substitution",
      };
    case "var":
    case "var_end":
      return {
        id, type: "var_review", minute, team,
        description: `VAR Review: ${data.Type || data.Outcome || "checking"}`,
        aiInsight: "VAR is reviewing the incident. This could change the match dynamics significantly.",
      };
    default:
      return null;
  }
}

function determineMomentum(events: MatchEvent[]): "home" | "away" | "neutral" {
  // Simple heuristic: team with most recent significant events
  const recent = events.filter(e => e.type === "goal" || e.type === "odds_shift").slice(-3);
  let homeScore = 0;
  let awayScore = 0;
  for (const e of recent) {
    if (e.team === "home") homeScore++;
    if (e.team === "away") awayScore++;
  }
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "neutral";
}

function generatePollFromEvents(
  events: MatchEvent[],
  homeTeam: string,
  awayTeam: string,
  odds: MatchOdds,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  // Generate a micro-poll based on the latest significant event
  const lastGoal = [...events].reverse().find(e => e.type === "goal");
  if (!lastGoal) return undefined;

  const scoringTeam = lastGoal.team === "home" ? homeTeam : awayTeam;
  const otherTeam = lastGoal.team === "home" ? awayTeam : homeTeam;

  return {
    id: `poll-${Date.now()}`,
    question: `Will ${otherTeam} equalize?`,
    insight: `${scoringTeam} scored recently. Based on current odds, ${otherTeam} has a ${(
      (1 / (lastGoal.team === "home" ? odds.nextGoalAway : odds.nextGoalHome)) * 100
    ).toFixed(0)}% implied probability of scoring next.`,
    options: [
      { label: "Yes", multiplier: lastGoal.team === "home" ? odds.nextGoalAway : odds.nextGoalHome },
      { label: "No", multiplier: lastGoal.team === "home" ? odds.nextGoalHome : odds.nextGoalAway },
    ],
    expiresAt: Date.now() + 5 * 60 * 1000,
    triggeredBy: lastGoal.id,
  };
}
