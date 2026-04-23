# eToro MCP Plugin

Connects Claude Cowork to your local eToro MCP server, enabling natural-language portfolio management, trading, and market research.

## Prerequisites

Build the MCP server before installing the plugin (the compiled `dist/` folder is gitignored):

```bash
cd ..          # repo root
npm install
npm run build
```

The plugin expects `../dist/index.js` to exist relative to this directory, i.e. the plugin lives at `D:\Sandbox\etoro-mcp\plugin\`.

## Credentials

The `.mcp.json` file contains your `ETORO_API_KEY` and `ETORO_USER_KEY`. Keep this file private and do not commit it to a public repository.

To switch between demo and live trading, change `ETORO_TRADING_MODE` in `.mcp.json`:
- `"demo"` — uses your demo account (default)
- `"real"` — uses your live account ⚠️

## Skills

| Skill | Triggers |
|-------|----------|
| **Portfolio** | "show my portfolio", "what positions do I have", "how am I performing" |
| **Trading** | "buy", "sell", "open a position", "place a limit order", "close my [X] position" |
| **Market Research** | "search for [instrument]", "what's the price of [X]", "show candles for [X]", "my watchlist" |

## Installation

1. Copy this `plugin/` folder into your `etoro-mcp` repo (or it's already there).
2. In Claude Cowork, install the `.plugin` file.
3. Cowork will launch the MCP server automatically when the plugin is active.