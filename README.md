# eToro MCP Server

<div align="center">
  <img src="icon.png" alt="eToro MCP" width="100" />

  Connect any MCP-compatible AI assistant (Claude, Cursor, and others) to your eToro account for portfolio analysis, market research, and trading.

  [![CI](https://img.shields.io/github/actions/workflow/status/gabrielcerutti/etoro-mcp-server/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/gabrielcerutti/etoro-mcp-server/actions/workflows/ci.yml)
  [![Node.js](https://img.shields.io/badge/node-%3E%3D24-brightgreen?style=flat-square)](https://nodejs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)](https://www.typescriptlang.org)
  [![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.26%2B-purple?style=flat-square)](https://modelcontextprotocol.io)
  [![License: MIT](https://img.shields.io/badge/license-MIT-orange?style=flat-square)](LICENSE)

  [Overview](#overview) • [Installation](#installation) • [Configuration](#configuration) • [Tools](#tools-35-total)
</div>

---

## Overview

MCP server wrapping the [eToro public API](https://public-api.etoro.com/api/v1), exposing **35 tools** for AI assistants (Claude Desktop, Cursor, Claude Code, etc.). Built for **investment research and portfolio analysis** — assess positions, research instruments and themes, vet popular investors for copy-trading, backtest DCA strategies against historical data. Trading is fully supported, but use care: letting an AI agent place real-money orders is genuinely risky, and you should treat it as such.

## What Can You Do With It?

The server is built around **research workflows** first. Below are illustrative conversations with an AI assistant connected to the eToro MCP server. Numbers and symbols are representative; actual responses draw from live eToro data.

### 1. Portfolio health check

> **You:** How is my portfolio doing this quarter? Give me the sector breakdown and flag my biggest drawdown.
>
> **Assistant:** Your portfolio snapshot:
>
> - **Credit (cash):** $4,218 • **Invested:** $41,560 • **Unrealized P&L:** +$3,842 (+9.2%)
> - **Positions:** 18 open • Longest-held: 412 days
>
> **Sector exposure (approx.):**
>
> | Sector | % of invested | Unrealized P&L |
> | --- | --- | --- |
> | Technology | 38% | +14.1% |
> | Consumer Cyclical | 19% | +6.8% |
> | Crypto | 17% | −11.4% |
> | Healthcare | 12% | +3.0% |
> | Financials | 8% | +2.1% |
> | Energy / Other | 6% | +0.4% |
>
> **Biggest drawdown:** SOL — averaged in at $121, currently $79.30 (−34%). This single position is dragging the crypto sleeve down 11%. Your tech sleeve has fully offset it at the portfolio level.

---

### 2. Thematic research — AI-adjacent names

> **You:** What AI-related names are available on eToro and which of them are popular investors loading up on right now?
>
> **Assistant:** Searching for "AI" themed instruments:
>
> | Instrument | Live price | 1Y change |
> | --- | --- | --- |
> | NVDA — NVIDIA | $118.40 | +142% |
> | PLTR — Palantir | $29.60 | +78% |
> | AI — C3.ai | $24.10 | +11% |
> | TAO — Bittensor | $512.00 | +64% |
> | FET — Fetch.ai | $1.42 | +94% |
>
> **What popular investors (top-quartile annual gain, low risk score) are accumulating over the last 90 days:**
>
> - **NVDA** — 62% of popular investors holding, avg position size growing
> - **PLTR** — newer cohort, 41% holding, recent adds concentrated in the last 30 days
> - **TAO** — niche, only ~8% holding but those who do are scaling in aggressively
>
> Want me to build a watchlist for this theme?

---

### 3. Copy-trading due diligence

> **You:** Vet user jeppekirkbonde for a long-term copy allocation. I want the honest risk picture, not the marketing view.
>
> **Assistant:** Here's what the data says on **jeppekirkbonde**:
>
> **Performance:**
>
> | Window | Gain | Max intra-period drawdown |
> | --- | --- | --- |
> | 1 year | +18.6% | −9.2% |
> | 2 years | +44.1% | −18.7% (2022 tech sell-off) |
> | 5 years | +210% | −28% (2020 covid) |
>
> - **Risk score:** 4/10 daily, 4/10 monthly (moderate)
> - **Strategy:** Long-only, concentrated in US large-cap tech. Top 5 positions = 61% of portfolio. Avg holding period ≈ 380 days — genuine long-term style.
> - **Copiers:** ~48k users with >1 year of copy relationship; most in "more than $1,000" allocation bracket.
>
> **What you should know:**
>
> 1. Drawdowns are real — a 2022-like environment will cost you 15–20% on paper.
> 2. The concentration is a feature, not a bug; it's also the single biggest risk.
> 3. Low portfolio turnover means copying behaves more like "passive tech tilt" than active management.
>
> Reasonable for a multi-year allocation if you can stomach the drawdowns. Not appropriate if you need the capital inside 18 months.

---

### 4. Macro-aware portfolio review (no trade)

> **You:** My portfolio is heavy on tech. Any risks on this week's macro calendar I should be aware of?
>
> **Assistant:** Your tech exposure totals ~$15,800 (38% of invested capital) across NVDA, MSFT, GOOGL, META, AAPL and two semi ETFs. This week's watch-list:
>
> - **Wed** — CPI print (core consensus +0.3% MoM). A hotter number re-prices rate-cut odds → tech multiples compress first.
> - **Thu** — Fed speakers (Williams, Waller). Any hawkish language extends the recent USD rally, which typically pressures mega-cap tech with international revenue.
> - **Fri** — NVDA earnings (after close). Binary event for your largest position and the semi ETFs.
>
> **What this means for you specifically:**
>
> - A hot CPI + hawkish Fed combo could knock 3–5% off your tech sleeve short-term.
> - NVDA earnings will drive ~30% of your week-over-week portfolio change whether you like it or not. Know your thesis before it prints.
>
> I'm not recommending any action — just flagging the concentration. Your stop-losses are already in place on 4 of 7 tech positions.

---

### 5. Watchlist curation for a thesis

> **You:** Build me a "Defensive Quality" watchlist: large-cap US, dividend-paying, low historical volatility, minimum 10-year track record.
>
> **Assistant:** I searched across US large-caps, filtered by industry-weighted beta and dividend history. Here's a 12-name starter list:
>
> | Ticker | Sector | Div yield | 5Y β (approx) |
> | --- | --- | --- | --- |
> | KO | Consumer Staples | 3.1% | 0.58 |
> | PG | Consumer Staples | 2.4% | 0.46 |
> | JNJ | Healthcare | 3.0% | 0.55 |
> | MRK | Healthcare | 2.7% | 0.44 |
> | WMT | Consumer Staples | 1.3% | 0.51 |
> | VZ | Telecom | 6.4% | 0.42 |
> | DUK | Utilities | 4.0% | 0.47 |
> | SO | Utilities | 3.7% | 0.49 |
> | AEP | Utilities | 3.9% | 0.50 |
> | CL | Consumer Staples | 2.1% | 0.41 |
> | PEP | Consumer Staples | 3.3% | 0.50 |
> | NEE | Utilities | 3.2% | 0.56 |
>
> I've created a watchlist called **"Defensive Quality"** and added all 12. You can review it in the eToro app or ask me to drop any of them.

---

### 6. DCA backtest against historical candles

> **You:** Model a monthly $500 DCA into QQQ over the last 5 years. What would I have now? (No orders — research only.)
>
> **Assistant:** Pulling weekly QQQ candles back 5 years and simulating a $500 buy on the first trading day of each month:
>
> - **Total invested:** $30,000 (60 months × $500)
> - **Total units accumulated:** ~90.4 QQQ
> - **Current value:** $46,950
> - **Realized gain on contributions:** +$16,950 (+56.5% on invested capital)
> - **Approximate IRR:** 10.2% / year
> - **Worst rolling 12-month period:** Jan 2022 – Jan 2023, paper drawdown of −31% on the accumulated stack
>
> Notable: your cost basis is smoothed because you bought through the 2022 drawdown — lump-sum at the start would have left you ~$3k poorer on paper through mid-2022, but ~$2k ahead today on a pure return basis. DCA lost a bit of upside; it bought you psychological durability.
>
> No orders placed.

---

<details>
<summary><b>Trading is also supported</b> — one example</summary>

> [!WARNING]
> **Letting an AI execute real-money trades is risky.** The same natural-language interface that makes research fast also makes it easy to misinterpret intent — a typo, an ambiguous number, a stale context from earlier in the conversation. Mitigations: start in `ETORO_TRADING_MODE=demo`, use read-only API keys for anything that doesn't need write access, and require explicit confirmation in your conversation before any `real` order.

All examples above are research-only. When you're ready to execute, the same interface places orders. Orders always respect the configured `ETORO_TRADING_MODE` (`demo` for paper, `real` for live).

> **You:** Place a buy limit order for 5 SOL if it reaches $75, with a stop-loss at $55.
>
> **Assistant:** Current SOL is $78.21. Placed: **buy limit 5 SOL @ $75** ($375 notional), stop-loss $55. Order confirmed — ID `3418072`. Mode: `demo`.

Full trading coverage includes open position (by amount or units), partial close, limit orders, cancel order, and listing pending orders.

</details>

---

## Installation

### Claude Desktop (recommended)

Download the latest `.mcpb` file from the [Releases](../../releases) page and drag it into Claude Desktop:

**Extensions → drag `etoro-{version}.mcpb` into the window**

You'll be prompted for your API Key, User Key, and trading mode. That's it.

> [!TIP]
> Get your keys at **eToro → Settings → Trading → Create New Key**. Choose your environment (Demo or Real) and the permissions you need (Read or Write).

---

### Via npm (Claude Code, Cursor, Continue, Cody, …)

Add this to your client's MCP config — it'll launch the server from the published npm package on demand, no local install needed:

```json
{
  "mcpServers": {
    "etoro": {
      "command": "npx",
      "args": ["-y", "etoro-mcp-server"],
      "env": {
        "ETORO_API_KEY": "your-api-key",
        "ETORO_USER_KEY": "your-user-key",
        "ETORO_TRADING_MODE": "demo"
      }
    }
  }
}
```

For Claude Code, the equivalent CLI command:

```bash
claude mcp add etoro \
  -e ETORO_API_KEY=your-api-key \
  -e ETORO_USER_KEY=your-user-key \
  -e ETORO_TRADING_MODE=demo \
  -- npx -y etoro-mcp-server
```

Pin a specific version with `etoro-mcp-server@1.1.0` in the args if you want stability over auto-updates.

---

### From source (developers)

If you want to hack on the server locally, clone the repo and build:

```bash
npm install
npm run build
```

Then point your MCP client at the built file (`dist/index.js`):

```bash
claude mcp add etoro-mcp \
  -e ETORO_API_KEY=your-api-key \
  -e ETORO_USER_KEY=your-user-key \
  -e ETORO_TRADING_MODE=demo \
  -- node /path/to/etoro-mcp/dist/index.js
```

Or in `claude_desktop_config.json` / equivalent:

```json
{
  "mcpServers": {
    "etoro-mcp": {
      "command": "node",
      "args": ["/path/to/etoro-mcp/dist/index.js"],
      "env": {
        "ETORO_API_KEY": "your-api-key",
        "ETORO_USER_KEY": "your-user-key",
        "ETORO_TRADING_MODE": "demo"
      }
    }
  }
}
```

---

## MCP Registry

This server is listed on the [MCP Registry](https://registry.modelcontextprotocol.io) under the name [`io.github.gabrielcerutti/etoro-mcp-server`](https://registry.modelcontextprotocol.io/v0/servers?search=etoro-mcp-server). The registry is the public index of MCP servers — think of it as a package registry for AI tools, analogous to what npm is for JavaScript libraries. MCP-compatible clients use it to discover and install servers programmatically without users having to hand-copy configuration.

Each tagged release of this repository is auto-published to the registry by GitHub Actions (via OIDC), so the entry always tracks the latest npm version.

---

## Configuration

| Setting | Env var | CLI arg | Default |
| --- | --- | --- | --- |
| API Key | `ETORO_API_KEY` | `--api-key` | (none) |
| User Key | `ETORO_USER_KEY` | `--user-key` | (none) |
| Trading Mode | `ETORO_TRADING_MODE` | `--trading-mode` | `demo` |

**Trading mode:** `demo` routes all trading calls through eToro's virtual account. Set to `real` only when you're ready to trade with real money.

> [!WARNING]
> `trading_mode` must match the environment of your API key. A demo key used with `real` mode (or vice versa) will cause authentication errors.

---

## Tools (35 total)

All tools are prefixed with `etoro_` for namespace isolation when composed with other MCP servers.

### Market Data (8)

| Tool | Description |
| --- | --- |
| `etoro_search_instruments` | Search instruments by keyword (e.g. "AAPL", "Bitcoin") or exact ticker |
| `etoro_get_instruments` | Get full instrument details by IDs (1–100) |
| `etoro_get_instrument_types` | List all instrument types (stocks, crypto, ETFs…) |
| `etoro_get_industries` | List industry classifications |
| `etoro_get_exchanges` | List stock exchanges |
| `etoro_get_candles` | Get OHLCV candle data for technical analysis and backtesting |
| `etoro_get_closing_prices` | Get historical daily closing prices |
| `etoro_get_rates` | Get live bid/ask rates |

### Portfolio & Trading (7)

| Tool | Description |
| --- | --- |
| `etoro_get_portfolio` | Get portfolio + P&L: positions, unrealized P&L, exposure summary, longest holding |
| `etoro_get_orders` | List all pending orders (limit / entry) |
| `etoro_get_trade_history` | Closed-trade history (entry/exit, P&L, duration). Primary source for performance research |
| `etoro_open_position` | Open position by USD amount **or** units (unified tool) |
| `etoro_close_position` | Close an open position fully, or partially via `unitsToDeduct` |
| `etoro_place_limit_order` | Place a limit / entry order |
| `etoro_cancel_order` | Cancel a pending order |

### User & Discovery (7)

| Tool | Description |
| --- | --- |
| `etoro_get_current_user` | Get the authenticated user's identity (GCID, real / demo CIDs) |
| `etoro_get_user_profile` | Get a user's public profile |
| `etoro_get_user_performance` | Get performance summary (optionally by time period) |
| `etoro_get_user_trades` | Get a user's trade info for a period |
| `etoro_get_user_portfolio` | Get a user's live public portfolio holdings |
| `etoro_discover_users` | Discover popular investors filtered by gain, risk score, period |
| `etoro_get_copiers` | Get info about users copying your portfolio |

### Watchlists (9)

| Tool | Description |
| --- | --- |
| `etoro_get_watchlists` | List your watchlists |
| `etoro_create_watchlist` | Create a watchlist |
| `etoro_delete_watchlist` | Delete a watchlist |
| `etoro_rename_watchlist` | Rename a watchlist |
| `etoro_add_watchlist_items` | Add instruments to a watchlist |
| `etoro_remove_watchlist_item` | Remove an instrument from a watchlist |
| `etoro_set_default_watchlist` | Set default watchlist |
| `etoro_get_curated_lists` | Get eToro's curated lists |
| `etoro_get_public_watchlists` | Browse a user's public watchlists |

### Social Feeds (4)

| Tool | Description |
| --- | --- |
| `etoro_get_instrument_feed` | Get social feed for an instrument |
| `etoro_get_user_feed` | Get social feed for a user |
| `etoro_create_post` | Create a social feed post |
| `etoro_create_comment` | Comment on a post |
