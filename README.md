# PulseBet AI ⚡

**Real-time AI sports insights & micro-wagering for the FIFA World Cup 2026 — powered by TxLINE and Solana.**

![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js)
![Solana](https://img.shields.io/badge/Solana_Devnet-9945FF?logo=solana&logoColor=white)
![TxLINE](https://img.shields.io/badge/TxLINE-FF5723?logo=data)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?logo=tailwindcss&logoColor=white)

---

## 🏆 TxLINE Hackathon Submission

### Core Idea

PulseBet AI transforms passive World Cup watching into an interactive, AI-augmented experience. When a significant match event occurs — a goal, red card, or odds shift — the app generates an AI insight and triggers a **Micro-Poll** where users bet on what happens next using Solana.

### What Makes This Different

1. **AI Pundit Layer** — Every TxLINE odds shift triggers an AI-generated insight explaining the market movement in natural language (e.g., "France's pressing intensity up 34% since the equalizer")
2. **Micro-Wager Model** — Not full betting, but 0.01 SOL micro-predictions on atomic match events. Low friction, high engagement.
3. **Mobile-First Premium UX** — Frosted glass design, smooth animations, live pulse feed — built for the phone-in-hand football fan.

### Business / Monetization Path

- **Transaction fees** — Small % cut on each micro-wager payout
- **Premium AI insights** — Deeper statistical analysis behind paywall
- **White-label** — Sell the micro-wagering SDK to existing sports platforms
- **Data analytics** — Aggregate user prediction data as market sentiment signals

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 + Frosted Glass Design System |
| Data | **TxLINE API** (fixtures, odds, scores) |
| Blockchain | Solana (Devnet) via `@solana/wallet-adapter-react` |
| Animations | Framer Motion |
| Icons | Lucide React |
| Deployment | Vercel |

---

## 📡 TxLINE Integration

### Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /api/fixtures/snapshot` | Fetch all World Cup fixtures, identify live matches |
| `GET /api/odds/snapshot/{fixtureId}` | Get real-time odds for the live match |
| `GET /api/scores/snapshot/{fixtureId}` | Get live score, events, and game phase |

### Authentication Flow

1. Guest JWT obtained from `POST /auth/guest/start`
2. Free-tier on-chain subscription (Service Level 1 or 12)
3. API token activated via `POST /api/token/activate`
4. Both JWT and API token sent as headers on every data request

### Data Normalization

The API route (`/api/txline`) normalizes TxLINE's raw schema into our internal format:
- `GamePhase` → match status (live, half_time, finished)
- `Participant1/2` + `Participant1IsHome` → home/away teams
- `Stats` keys → goal counts
- `Actions` → match events (goals, cards, substitutions, VAR)
- `Outcomes` → odds values

### Fallback Strategy

When TxLINE credentials are not configured or no live matches are available, the app serves rich mock data (Argentina 2–2 France, minute 67) to ensure the UI is always demonstrable.

---

## 🚀 Quick Start

```bash
# Clone and install
git clone <repo-url>
cd pulsebet-ai
npm install

# Configure TxLINE (optional — app works with mock data)
cp .env.example .env.local
# Fill in TXLINE_JWT and TXLINE_API_TOKEN after activation

# Run
npm run dev
# Open http://localhost:3000
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TXLINE_JWT` | No* | Guest JWT from TxLINE `/auth/guest/start` |
| `TXLINE_API_TOKEN` | No* | Activated API token from `/api/token/activate` |
| `TXLINE_NETWORK` | No | `mainnet` (default) or `devnet` |

*Without these, the app serves mock data in demo mode.

---

## 📱 User Flow

1. **Open app** → See live World Cup scoreboard with match minute and odds
2. **Scroll pulse feed** → Real-time match events with AI insights on odds shifts
3. **See micro-wager** → AI-generated poll: "Will France score next?" with Yes/No
4. **Connect wallet** → Solana wallet (Phantom/Solflare) on Devnet
5. **Place bet** → 0.01 SOL transferred to treasury wallet
6. **Confirm on Solana Explorer** → Transaction verified on Devnet

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│              Client (Next.js)            │
│  ┌────────────────────────────────────┐  │
│  │  LiveScoreboard · PulseFeed ·      │  │
│  │  MicroWagerCard · SolanaProvider   │  │
│  └──────────┬─────────────────────────┘  │
│             │ fetch /api/txline (15s)     │
│  ┌──────────▼─────────────────────────┐  │
│  │  API Route: /api/txline            │  │
│  │  ┌──────────┐  ┌───────────────┐   │  │
│  │  │ TxLINE   │→ │ Normalizer    │   │  │
│  │  │ (live)   │  │ → Our Schema  │   │  │
│  │  └──────────┘  └───────────────┘   │  │
│  │  ┌──────────┐                      │  │
│  │  │ Mock     │ ← fallback           │  │
│  │  │ Data     │                      │  │
│  │  └──────────┘                      │  │
│  └────────────────────────────────────┘  │
│             │                            │
│  ┌──────────▼─────────────────────────┐  │
│  │  Solana Devnet                     │  │
│  │  SystemProgram.transfer → Treasury │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## 📝 TxLINE Feedback

**What we liked:**
- The normalized JSON schema across all competitions is excellent — once you understand the shape, it scales seamlessly
- Free World Cup tier with real-time data (service level 12) removes barriers for hackathon builders
- Comprehensive Mintlify docs with runnable devnet examples
- SSE streaming for real-time odds and scores updates

**Where we hit friction:**
- The activation flow (on-chain subscribe → sign message → activate token) has significant complexity for a hackathon MVP. A simpler API key model for hackathons would reduce time-to-first-request from ~30 minutes to ~2 minutes
- Documentation for the actual scores/odds JSON response schema (field names, types, example payloads) would help — we had to infer from code examples
- Having a `GET /api/fixtures/live` convenience endpoint that returns only in-progress matches would save integrators from filtering `GamePhase` values

---

## License

MIT
