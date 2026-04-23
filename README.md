# eToro MCP Server

<div align="center">
  <img src="icon.png" alt="eToro MCP" width="100" />

  Connect Claude to your eToro account for portfolio management, trading, and market research.

  [![CI](https://img.shields.io/github/actions/workflow/status/gabrielcerutti/etoro-mcp-server/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/gabrielcerutti/etoro-mcp-server/actions/workflows/ci.yml)
  [![Node.js](https://img.shields.io/badge/node-%3E%3D24-brightgreen?style=flat-square)](https://nodejs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)](https://www.typescriptlang.org)
  [![MCP SDK](https://img.shields.io/badge/MCP%20SDK-1.26%2B-purple?style=flat-square)](https://modelcontextprotocol.io)
  [![License: MIT](https://img.shields.io/badge/license-MIT-orange?style=flat-square)](LICENSE)

  [Overview](#overview) • [Installation](#installation) • [Configuration](#configuration) • [Tools](#tools-34-total)
</div>

---

## Overview

MCP server that wraps the [eToro public API](https://public-api.etoro.com/api/v1), exposing **34 tools** for AI assistants (Claude Desktop, Cursor, Claude Code, etc.). Ask Claude to analyze your portfolio, place limit orders, research instruments, discover top traders, and manage watchlists — all in natural language.

## What Can You Do With It?

Below are real conversations with an AI assistant connected to the eToro MCP server.

### Place a limit order

> **You:** Place a buy limit order for 5 SOL if it reaches $75
>
> **Assistant:** Current SOL price is $78.21. I've placed a buy limit order for 5 SOL at $75 ($375 total) with a stop loss at $1. Order confirmed.

---

### DCA ladder based on technical analysis

> **You:** Can you place some DCA buy limit orders for ETH based on key support levels?
>
> **Assistant:** Based on the chart, here are the key support levels for ETH:
>
> - $1,750 — first support zone
> - $1,500 — strong horizontal support
> - $1,200 — macro support
> - $1,000 — psychological floor
>
> I've placed 4 limit orders:
>
> | Level | Amount | ~ETH |
> | --- | --- | --- |
> | $1,750 | $1,000 | 0.57 |
> | $1,500 | $1,500 | 1.00 |
> | $1,200 | $2,000 | 1.67 |
> | $1,000 | $2,500 | 2.50 |

---

### Portfolio analysis and average entry price

> **You:** What's my average entry price on SOL including all my positions?
>
> **Assistant:** You have 27 SOL positions totaling **124.62 SOL** with an average entry of **$120.99**.
>
> Including your 4 pending limit orders (39.81 SOL), if all trigger your new average would be **$106.14** on 164.43 SOL.

---

### Market research and opinion

> **You:** What do you think about SUI?
>
> **Assistant:** SUI is trading at **$0.905**, down 75% from its October high of $3.70. Your 4 positions total 3,434 SUI at an average of $1.18 — currently -23%.
>
> **Key levels:** Support at $0.874 and $0.788. Resistance at $1.00 and $1.10.
>
> **Catalysts:** SUI ETF applications under SEC review, SuiPlay0X1 gaming device launching Q3 2026. The $0.78-$0.85 zone is a strong accumulation area.

---

### Daily market check

> **You:** Check the market related to my portfolio today and tell me if there is some macro news that could explain
>
> **Assistant:**
>
> | Asset | Price | Your Avg Entry | Status |
> | --- | --- | --- | --- |
> | **BTC** | $66,455 | ~$68,500 | Underwater on recent buys |
> | **ETH** | $1,948 | ~$2,114 | Recovering |
> | **SOL** | $79.32 | ~$121 | -34% |
> | **SUI** | $0.93 | ~$1.18 | -21% |
> | **LINK** | $8.42 | ~$14.4 | -41% |
>
> **What's driving the selloff:**
>
> 1. CPI report tomorrow — expected +0.3% MoM, still above Fed's 2% target
> 2. Strong US economic data reinforcing "higher for longer" rate narrative
> 3. BTC broke below 365-day moving average for first time since March 2022
> 4. Mixed Spot Bitcoin ETF flows — no institutional conviction

---

### More examples

<details>
<summary>Discover top traders, manage watchlists, check prices</summary>

#### Find the best performing popular investors this year

> **You:** Find me the best performing popular investors this year
>
> **Assistant:** Here are the top popular investors for the current year, sorted by gain...

---

#### Create a watchlist

> **You:** Create a watchlist called "AI Coins" and add SUI, NEAR, and TAO to it
>
> **Assistant:** Done! Created watchlist "AI Coins" and added:
>
> - SUI (Sui) — ID 100340
> - NEAR (Near Protocol) — ID 100337
> - TAO (Bittensor) — ID 100418

---

#### Quick price check

> **You:** What's the current price of Bitcoin and Ethereum?
>
> **Assistant:** Live rates:
>
> - **BTC**: $68,503 (bid) / $68,520 (ask)
> - **ETH**: $1,801 (bid) / $1,803 (ask)

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

### Manual setup (Claude Code / Claude Desktop)

For developers who want to run from source.

#### 1. Build

```bash
npm install
npm run build
```

#### 2. Add to Claude Code

```bash
claude mcp add etoro-mcp \
  -e ETORO_API_KEY=your-api-key \
  -e ETORO_USER_KEY=your-user-key \
  -e ETORO_TRADING_MODE=demo \
  node /path/to/etoro-mcp/dist/index.js
```

#### 3. Add to Claude Desktop (`claude_desktop_config.json`)

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

## Tools (34 total)

### Market Data (8)

| Tool | Description |
| --- | --- |
| `search_instruments` | Search instruments by keyword (e.g. "AAPL", "Bitcoin") |
| `get_instruments` | Get instrument details by IDs |
| `get_instrument_types` | List all instrument types (stocks, crypto, ETFs…) |
| `get_industries` | List industry classifications |
| `get_exchanges` | List stock exchanges |
| `get_candles` | Get OHLCV candle data |
| `get_closing_prices` | Get closing prices for instruments |
| `get_rates` | Get live bid/ask rates |

### Trading (7)

| Tool | Description |
| --- | --- |
| `open_position_by_amount` | Open position by USD amount |
| `open_position_by_units` | Open position by unit count |
| `close_position` | Close an open position |
| `place_limit_order` | Place a limit/entry order |
| `cancel_order` | Cancel a pending order |
| `get_orders` | List all pending orders |
| `get_portfolio` | Get all open positions |

### Social Feeds (4)

| Tool | Description |
| --- | --- |
| `get_instrument_feed` | Get social feed for an instrument |
| `get_user_feed` | Get social feed for a user |
| `create_post` | Create a social feed post |
| `create_comment` | Comment on a post |

### Watchlists (9)

| Tool | Description |
| --- | --- |
| `get_watchlists` | List your watchlists |
| `create_watchlist` | Create a watchlist |
| `delete_watchlist` | Delete a watchlist |
| `rename_watchlist` | Rename a watchlist |
| `add_watchlist_items` | Add instruments to a watchlist |
| `remove_watchlist_item` | Remove an instrument from a watchlist |
| `set_default_watchlist` | Set default watchlist |
| `get_curated_lists` | Get eToro's curated lists |
| `get_public_watchlists` | Browse public watchlists |

### User & Discovery (6)

| Tool | Description |
| --- | --- |
| `get_user_profile` | Get a user's public profile |
| `get_user_performance` | Get performance summary |
| `get_user_performance_granular` | Get detailed performance over a period |
| `get_user_trades` | Get trade history |
| `get_user_portfolio` | Get public portfolio holdings |
| `discover_users` | Discover popular investors (filterable) |
