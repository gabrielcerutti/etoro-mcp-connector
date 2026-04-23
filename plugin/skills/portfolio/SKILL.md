---
name: portfolio
description: Check eToro portfolio, open positions, P&L, and account performance. Use when the user asks "show my portfolio", "what positions do I have", "how am I performing", "what's my P&L", "show my open trades", "how's my account doing", or "check my eToro positions".
---

# Portfolio Skill

Retrieve and present the user's eToro portfolio clearly and concisely.

## Steps

1. Call `mcp__etoro__get_portfolio` to retrieve all open positions.
2. If the user asks about performance, also call `mcp__etoro__get_user_performance` for a summary, or `mcp__etoro__get_user_performance_granular` for a breakdown by time period.
3. If instrument names are not included in the portfolio response, call `mcp__etoro__get_instruments` with the relevant instrument IDs to resolve names.
4. If the user wants live prices, call `mcp__etoro__get_rates` with the relevant instrument IDs.

## Presentation

- Summarize total portfolio value, number of open positions, and overall P&L.
- List positions in a readable table or grouped summary: instrument name, direction (buy/sell), invested amount, current value, P&L.
- Highlight any large gains or losses.
- Keep the tone factual and concise — don't editorialize on individual positions unless asked.
- If the account is in demo mode, note that clearly.