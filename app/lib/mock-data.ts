import type { LiveMatch, TxLineResponse } from "@/app/lib/types";

/**
 * Rich mock data for a World Cup match in progress.
 * Used as fallback when the live TxLINE API returns empty (no match currently playing).
 */
let mockStartTime = Date.now();

export function getMockMatchData(): TxLineResponse {
  const now = Date.now();

  const match: LiveMatch = {
    id: "wc-2026-final-arg-fra",
    competition: "FIFA World Cup 2026",
    status: "live",
    minute: 67,
    home: {
      name: "Argentina",
      code: "ARG",
      countryId: "ar",
      flag: "🇦🇷",
      score: 2,
    },
    away: {
      name: "France",
      code: "FRA",
      countryId: "fr",
      flag: "🇫🇷",
      score: 2,
    },
    events: [
      {
        id: "evt-001",
        type: "kickoff",
        minute: 0,
        description: "Match kicks off at MetLife Stadium",
      },
      {
        id: "evt-002",
        type: "goal",
        minute: 14,
        team: "home",
        player: "L. Messi",
        description: "Messi curls a free kick into the top corner!",
        aiInsight:
          "Argentina's early lead historically gives them a 72% win probability in knockout matches.",
      },
      {
        id: "evt-003",
        type: "odds_shift",
        minute: 15,
        description: "Odds shift: Argentina win probability surges",
        oddsChange: {
          market: "Match Winner",
          previous: 2.1,
          current: 1.65,
          direction: "down",
        },
        aiInsight:
          "Market reacting strongly. Argentina's odds shortened by 21% — largest shift of the tournament.",
      },
      {
        id: "evt-004",
        type: "yellow_card",
        minute: 23,
        team: "away",
        player: "A. Tchouaméni",
        description: "Tchouaméni booked for a tactical foul on Di María",
      },
      {
        id: "evt-005",
        type: "goal",
        minute: 32,
        team: "away",
        player: "K. Mbappé",
        description:
          "Mbappé equalizes! Lightning counter-attack finished with precision.",
        aiInsight:
          "Mbappé has scored in 5 consecutive World Cup knockout games — a new record.",
      },
      {
        id: "evt-006",
        type: "odds_shift",
        minute: 33,
        description: "Odds rebalance after Mbappé's equalizer",
        oddsChange: {
          market: "Match Winner",
          previous: 1.65,
          current: 2.25,
          direction: "up",
        },
        aiInsight:
          "Draw probability jumps to 31%. Market now prices this as the most competitive final since 2014.",
      },
      {
        id: "evt-007",
        type: "half_time",
        minute: 45,
        description: "Half time: Argentina 1 - 1 France",
      },
      {
        id: "evt-008",
        type: "goal",
        minute: 52,
        team: "home",
        player: "J. Álvarez",
        description:
          "Álvarez pounces on a defensive error and slots home!",
        aiInsight:
          "Argentina regain the lead. Teams scoring first in the 2nd half win 68% of WC finals.",
      },
      {
        id: "evt-009",
        type: "var_review",
        minute: 58,
        description: "VAR reviewing potential penalty for France — handball in the box",
        aiInsight:
          "VAR check in progress. If awarded, France get a major chance to equalize.",
      },
      {
        id: "evt-010",
        type: "goal",
        minute: 59,
        team: "away",
        player: "K. Mbappé",
        description:
          "PENALTY AWARDED AND CONVERTED! Mbappé sends the keeper the wrong way. 2-2!",
        aiInsight:
          "Mbappé brace! He joins Pelé and Hurst as players with hat-trick potential in a WC Final.",
      },
      {
        id: "evt-011",
        type: "odds_shift",
        minute: 60,
        description: "Massive odds recalibration — momentum swings to France",
        oddsChange: {
          market: "Next Goal",
          previous: 1.8,
          current: 1.45,
          direction: "down",
        },
        aiInsight:
          "Momentum analysis: France have had 67% possession in the last 10 minutes. xG favors France 0.8 to 0.2 in this period.",
      },
      {
        id: "evt-012",
        type: "substitution",
        minute: 63,
        team: "home",
        player: "L. Paredes → E. Fernández",
        description: "Argentina make a tactical substitution to shore up midfield",
      },
      {
        id: "evt-013",
        type: "yellow_card",
        minute: 65,
        team: "home",
        player: "N. Otamendi",
        description: "Otamendi cautioned for pulling back Mbappé",
      },
      {
        id: "evt-014",
        type: "odds_shift",
        minute: 67,
        description: "France now slight favorites for next goal",
        oddsChange: {
          market: "Next Goal Scorer",
          previous: 2.1,
          current: 1.55,
          direction: "down",
        },
        aiInsight:
          "AI Pundit: France's pressing intensity up 34% since the equalizer. Dembélé creating 2.1 chances per 10 mins on the right flank.",
      },
    ],
    odds: {
      homeWin: 2.4,
      draw: 3.1,
      awayWin: 2.85,
      nextGoalHome: 2.2,
      nextGoalAway: 1.55,
    },
    momentum: "away",
    activePoll: {
      id: "poll-001",
      question: "Will France score the next goal?",
      insight:
        "Momentum shifting to France. Mbappé has 4 shots in the last 12 minutes with an xG of 0.74. France pressing intensity is up 34%.",
      options: [
        { label: "Yes", multiplier: 1.55 },
        { label: "No", multiplier: 2.35 },
      ],
      expiresAt: mockStartTime + 5 * 60 * 1000, // 5 minutes from first load
      triggeredBy: "evt-014",
    },
  };

  return {
    matches: [match],
    timestamp: now,
    source: "mock",
  };
}
