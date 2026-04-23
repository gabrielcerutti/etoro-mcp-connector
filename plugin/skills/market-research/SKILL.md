---
name: market-research
description: Research instruments, check live prices, view price history, and manage watchlists on eToro. Use when the user asks "search for", "look up [stock/crypto/instrument]", "what's the price of", "show me the chart for", "price history", "candles for", "my watchlist", "add to watchlist", "what can I trade", "find [instrument]", or "how has [instrument] performed".
---

# Market Research Skill

Help the user research instruments and manage watchlists on eToro.

## Searching for Instruments

1. Call `mcp__etoro__search_instruments` with the user's query (ticker, name, keyword).
2. Return a short list of matches with name, type (stock, crypto, ETF, etc.), and exchange.
3. If the user wants more detail on a specific instrument, call `mcp__etoro__get_instruments`.

## Live Prices

1. Resolve the instrument ID via `mcp__etoro__search_instruments` if not already known.
2. Call `mcp__etoro__get_rates` to get the current bid/ask.
3. Present the spread clearly.

## Price History / Candles

1. Resolve the instrument ID if needed.
2. Call `mcp__etoro__get_candles` with appropriate parameters for the time period the user wants.
3. Summarize key price movements: high, low, trend direction over the period.
4. For closing prices only, use `mcp__etoro__get_closing_prices`.

## Watchlists

- To view watchlists: call `mcp__etoro__get_watchlists` for the user's own lists, or `mcp__etoro__get_public_watchlists` for public ones.
- To add an instrument: resolve it first, then call `mcp__etoro__add_watchlist_items`.
- To remove: call `mcp__etoro__remove_watchlist_item`.
- To create a new one: call `mcp__etoro__create_watchlist`.

## Browsing Available Markets

- Use `mcp__etoro__get_instrument_types` to list categories (stocks, crypto, ETFs, etc.).
- Use `mcp__etoro__get_exchanges` to list available exchanges.
- Use `mcp__etoro__get_industries` to browse by sector/industry.