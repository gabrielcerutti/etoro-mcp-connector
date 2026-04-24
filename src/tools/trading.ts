import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { EtoroClient } from "../client/etoro-client.js";
import { formatToolResponse, withErrorHandling } from "../utils/errors.js";
import { buildQueryString } from "../utils/http.js";

interface Position {
  positionId?: number;
  positionID?: number;
  instrumentId?: number;
  instrumentID?: number;
  isBuy?: boolean;
  amount?: number;
  initialAmountInDollars?: number;
  units?: number;
  leverage?: number;
  openRate?: number;
  currentRate?: number;
  openDateTime?: string;
  stopLossRate?: number;
  takeProfitRate?: number;
  totalFees?: number;
  [key: string]: unknown;
}

interface PortfolioWithPnlResponse {
  clientPortfolio: {
    credit: number;
    bonusCredit?: number;
    unrealizedPnL?: number;
    positions: Position[];
    orders?: unknown[];
    stockOrders?: unknown[];
    entryOrders?: unknown[];
    ordersForOpen?: unknown[];
    ordersForClose?: unknown[];
    mirrors?: unknown[];
  };
}

function pnlPath(mode: string): string {
  return mode === "demo" ? "/trading/info/demo/pnl" : "/trading/info/real/pnl";
}

function trimPosition(pos: Position) {
  return {
    positionId: pos.positionID ?? pos.positionId,
    instrumentId: pos.instrumentID ?? pos.instrumentId,
    isBuy: pos.isBuy,
    amount: pos.amount ?? pos.initialAmountInDollars,
    units: pos.units,
    leverage: pos.leverage,
    openRate: pos.openRate,
    currentRate: pos.currentRate,
    openDateTime: pos.openDateTime,
    stopLossRate: pos.stopLossRate,
    takeProfitRate: pos.takeProfitRate,
    totalFees: pos.totalFees,
  };
}

function summarizePortfolio(p: PortfolioWithPnlResponse["clientPortfolio"]) {
  const positions = p.positions || [];
  const totalInvested = positions.reduce<number>((sum, pos) => sum + (pos.amount ?? pos.initialAmountInDollars ?? 0), 0);
  const now = Date.now();
  const holdingDays = positions
    .map((pos) => (pos.openDateTime ? (now - new Date(pos.openDateTime).getTime()) / 86_400_000 : 0))
    .filter((d) => d > 0);
  const longestHoldingDays = holdingDays.length ? Math.round(Math.max(...holdingDays)) : 0;
  const exposureByInstrument = new Map<number, number>();
  for (const pos of positions) {
    const id = (pos.instrumentID ?? pos.instrumentId) as number | undefined;
    if (id === undefined) continue;
    const exposure = (pos.amount ?? pos.initialAmountInDollars ?? 0) * (pos.leverage ?? 1);
    exposureByInstrument.set(id, (exposureByInstrument.get(id) ?? 0) + exposure);
  }
  let topExposureInstrumentId: number | undefined;
  let topExposureValue = 0;
  for (const [id, value] of exposureByInstrument) {
    if (value > topExposureValue) {
      topExposureValue = value;
      topExposureInstrumentId = id;
    }
  }
  return {
    credit: p.credit,
    bonusCredit: p.bonusCredit,
    unrealizedPnL: p.unrealizedPnL,
    totalInvested,
    positionCount: positions.length,
    longestHoldingDays,
    topExposureInstrumentId,
    topExposureValue,
  };
}

export function registerTradingTools(server: McpServer, client: EtoroClient): void {
  server.registerTool(
    "etoro_open_position",
    {
      title: "Open position",
      description:
        "Open a new position on an instrument. Provide exactly one of `amount` (USD) or `units` (share/coin count). " +
        "Respects the configured trading mode (demo or real).",
      inputSchema: {
        instrumentId: z.number().int().positive().describe("Instrument ID to trade"),
        amount: z.number().positive().optional().describe("Investment amount in USD (mutually exclusive with `units`)"),
        units: z.number().positive().optional().describe("Number of units / shares / coins (mutually exclusive with `amount`)"),
        isBuy: z.boolean().describe("true = Buy/Long, false = Sell/Short"),
        leverage: z.number().int().min(1).max(400).optional().describe("Leverage multiplier (1, 2, 5, 10, etc.; max 400)"),
        stopLossRate: z.number().positive().optional().describe("Stop-loss price"),
        takeProfitRate: z.number().positive().optional().describe("Take-profit price"),
      },
      annotations: { destructiveHint: true, openWorldHint: true },
    },
    withErrorHandling(async (args) => {
      if ((args.amount === undefined) === (args.units === undefined)) {
        throw new Error("Provide exactly one of `amount` or `units` (not both, not neither).");
      }
      const byAmount = args.amount !== undefined;
      const body: Record<string, unknown> = {
        InstrumentID: args.instrumentId,
        IsBuy: args.isBuy,
        Leverage: args.leverage ?? 1,
      };
      if (byAmount) body.Amount = args.amount;
      else body.AmountInUnits = args.units;
      if (args.stopLossRate !== undefined) body.StopLossRate = args.stopLossRate;
      if (args.takeProfitRate !== undefined) body.TakeProfitRate = args.takeProfitRate;

      const path = client.executionPath(byAmount ? "/market-open-orders/by-amount" : "/market-open-orders/by-units");
      const data = await client.post(path, body);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_close_position",
    {
      title: "Close position",
      description:
        "Close an open position (fully or partially). Pass `unitsToDeduct` to close only part of the position; omit it to close fully.",
      inputSchema: {
        positionId: z.number().int().positive().describe("The position ID to close"),
        instrumentId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Instrument ID of the position (optional; will be looked up from portfolio if omitted)"),
        unitsToDeduct: z
          .number()
          .positive()
          .optional()
          .describe("Number of units to close for partial close. Omit for full close."),
      },
      annotations: { destructiveHint: true },
    },
    withErrorHandling(async (args) => {
      let instrumentId = args.instrumentId;
      if (instrumentId === undefined) {
        const portfolio = await client.get<PortfolioWithPnlResponse>(pnlPath(client.tradingMode));
        const pos = portfolio.clientPortfolio.positions.find(
          (p) => (p.positionID ?? p.positionId) === args.positionId
        );
        if (!pos) throw new Error(`Position ${args.positionId} not found in portfolio`);
        instrumentId = (pos.instrumentID ?? pos.instrumentId) as number;
      }
      const path = client.executionPath(`/market-close-orders/positions/${args.positionId}`);
      const data = await client.post(path, {
        InstrumentID: instrumentId,
        UnitsToDeduct: args.unitsToDeduct ?? null,
      });
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_place_limit_order",
    {
      title: "Place limit order",
      description: "Place a limit / entry order that executes when the market reaches the specified price.",
      inputSchema: {
        instrumentId: z.number().int().positive().describe("Instrument ID"),
        amount: z.number().positive().describe("Investment amount in USD"),
        isBuy: z.boolean().describe("true = Buy/Long, false = Sell/Short"),
        rate: z.number().positive().describe("Limit price at which the order should execute"),
        leverage: z.number().int().min(1).max(400).optional().describe("Leverage multiplier (default 1)"),
        stopLossRate: z.number().positive().optional().describe("Stop-loss price"),
        takeProfitRate: z.number().positive().optional().describe("Take-profit price"),
      },
      annotations: { destructiveHint: true, openWorldHint: true },
    },
    withErrorHandling(async (args) => {
      const body: Record<string, unknown> = {
        InstrumentID: args.instrumentId,
        Amount: args.amount,
        IsBuy: args.isBuy,
        Rate: args.rate,
        Leverage: args.leverage ?? 1,
      };
      if (args.stopLossRate !== undefined) body.StopLossRate = args.stopLossRate;
      if (args.takeProfitRate !== undefined) body.TakeProfitRate = args.takeProfitRate;

      const path = client.executionPath("/limit-orders");
      const data = await client.post(path, body);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_cancel_order",
    {
      title: "Cancel pending order",
      description: "Cancel a pending limit or market order before it executes.",
      inputSchema: {
        orderId: z.number().int().positive().describe("The order ID to cancel"),
      },
      annotations: { destructiveHint: true, idempotentHint: true },
    },
    withErrorHandling(async (args) => {
      const path = client.executionPath(`/market-open-orders/${args.orderId}`);
      const data = await client.delete(path);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_orders",
    {
      title: "List pending orders",
      description: "List all pending orders (limit orders, entry orders, etc.) for the current account.",
      inputSchema: {},
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async () => {
      const data = await client.get<PortfolioWithPnlResponse>(pnlPath(client.tradingMode));
      const p = data.clientPortfolio;
      return formatToolResponse([
        ...(p.orders || []),
        ...(p.stockOrders || []),
        ...(p.entryOrders || []),
        ...(p.ordersForOpen || []),
      ]);
    })
  );

  server.registerTool(
    "etoro_get_portfolio",
    {
      title: "Get portfolio + P&L",
      description:
        "Get the current account's portfolio with P&L: credit, open positions (with current rates), unrealized P&L, " +
        "total invested, exposure summary, and longest-held position. Respects demo/real mode.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    withErrorHandling(async () => {
      const data = await client.get<PortfolioWithPnlResponse>(pnlPath(client.tradingMode));
      const p = data.clientPortfolio;
      return formatToolResponse({
        summary: summarizePortfolio(p),
        positions: (p.positions || []).map(trimPosition),
      });
    })
  );

  server.registerTool(
    "etoro_get_trade_history",
    {
      title: "Get closed-trade history",
      description:
        "Fetch the history of closed trades (entry/exit, P&L, fees, duration). Supports pagination. " +
        "Primary data source for performance analysis, win-rate, and drawdown research.",
      inputSchema: {
        minDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe("Start date (YYYY-MM-DD). Required by the API."),
        page: z.number().int().min(1).optional().describe("Page number (default 1)"),
        pageSize: z.number().int().min(1).max(500).optional().describe("Results per page (default 100)"),
      },
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async (args) => {
      const query = buildQueryString({
        minDate: args.minDate,
        page: args.page,
        pageSize: args.pageSize,
      });
      const data = await client.get(`/trading/info/trade/history${query}`);
      return formatToolResponse(data);
    })
  );
}
