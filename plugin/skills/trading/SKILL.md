---
name: trading
description: Execute trades on eToro — open and close positions, place limit orders, and manage orders. Use when the user says "buy", "sell", "open a position", "close my position", "place a limit order", "cancel my order", "trade", "invest in", "go long", "go short", "open a trade on", or "close my [instrument] position".
---

# Trading Skill

Help the user execute trades safely and clearly on eToro.

## Important — Demo Mode Warning

Always check the trading mode (demo vs. live). If the account is in demo mode, confirm this to the user before executing any trade. If live mode, add an extra confirmation step.

## Opening a Position

1. If the instrument isn't identified by ID, call `mcp__etoro__search_instruments` to find it.
2. Call `mcp__etoro__get_rates` to show the user the current bid/ask price before committing.
3. Ask the user to confirm: instrument, direction (buy/sell), and amount (in USD) or units.
4. Use `mcp__etoro__open_position_by_amount` when the user specifies a dollar amount, or `mcp__etoro__open_position_by_units` when they specify a number of units/shares.
5. Confirm the result clearly: what was opened, at what price, and for how much.

## Closing a Position

1. Call `mcp__etoro__get_portfolio` to list open positions if the user hasn't specified an exact position ID.
2. Identify the correct position and confirm with the user before closing.
3. Call `mcp__etoro__close_position` with the position ID.
4. Confirm the result: what was closed and the realized P&L.

## Limit Orders

1. Resolve the instrument if needed via `mcp__etoro__search_instruments`.
2. Show current rates via `mcp__etoro__get_rates`.
3. Confirm the order details (instrument, direction, amount, limit price) with the user.
4. Call `mcp__etoro__place_limit_order`.
5. Confirm the order was placed successfully.

## Cancelling an Order

1. Call `mcp__etoro__get_orders` to list open orders if the user hasn't specified an order ID.
2. Confirm which order to cancel.
3. Call `mcp__etoro__cancel_order`.
4. Confirm cancellation.

## Safety Rules

- Never execute a trade without explicit user confirmation of the key parameters.
- Always show the current price before a trade is placed.
- If something looks off (e.g., very large amount, unusual instrument), flag it and ask again.