import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { EtoroClient } from "../client/etoro-client.js";
import { formatToolResponse, withErrorHandling } from "../utils/errors.js";
import { buildQueryString } from "../utils/http.js";

export function registerMarketDataTools(server: McpServer, client: EtoroClient): void {
  server.registerTool(
    "etoro_search_instruments",
    {
      title: "Search instruments",
      description: "Search eToro instruments (stocks, crypto, ETFs, etc.) by keyword or exact ticker.",
      inputSchema: {
        query: z.string().min(1).describe("Search keyword (e.g. 'AAPL', 'Bitcoin', 'Tesla')"),
        exactSymbol: z.boolean().optional().describe("If true, match by exact ticker symbol (e.g. 'AAPL') instead of free-text"),
        page: z.number().int().min(1).optional().describe("Page number (default 1)"),
        pageSize: z.number().int().min(1).max(100).optional().describe("Results per page (default 10, max 100)"),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: true,
      },
    },
    withErrorHandling(async (args) => {
      const query = buildQueryString({
        [args.exactSymbol ? "internalSymbolFull" : "searchText"]: args.query,
        pageNumber: args.page,
        pageSize: args.pageSize ?? 10,
      });
      const data = await client.get<{ page: number; pageSize: number; totalItems: number; items: Record<string, unknown>[] }>(
        `/market-data/search${query}`
      );

      const ids = data.items
        .map((item) => item.instrumentId as number)
        .filter((id) => id !== undefined && id > 0);

      const enriched: Record<number, Record<string, unknown>> = {};
      if (ids.length > 0) {
        try {
          const meta = await client.get<{ instrumentDisplayDatas: Record<string, unknown>[] }>(
            `/market-data/instruments?instrumentIds=${ids.join(",")}`
          );
          for (const inst of meta.instrumentDisplayDatas || []) {
            enriched[inst.instrumentID as number] = inst;
          }
        } catch {
          // If metadata fetch fails, continue with IDs only
        }
      }

      const pageSize = data.pageSize;
      const page = data.page;
      const hasMore = page * pageSize < data.totalItems;
      return formatToolResponse({
        page,
        pageSize,
        total: data.totalItems,
        hasMore,
        items: data.items.map((item) => {
          const id = item.instrumentId as number;
          const meta = enriched[id];
          return {
            instrumentId: id,
            symbol: meta?.symbolFull ?? item.internalSymbolFull,
            displayName: meta?.instrumentDisplayName ?? item.displayName,
            instrumentTypeId: meta?.instrumentTypeID ?? item.instrumentTypeId,
            exchangeId: meta?.exchangeID ?? item.exchangeId,
          };
        }),
      });
    })
  );

  server.registerTool(
    "etoro_get_instruments",
    {
      title: "Get instrument details",
      description: "Get full details for one or more instruments by their IDs.",
      inputSchema: {
        instrumentIds: z.array(z.number().int().positive()).min(1).max(100).describe("Array of instrument IDs (1–100)"),
      },
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async (args) => {
      const ids = args.instrumentIds.join(",");
      const data = await client.get(`/market-data/instruments?instrumentIds=${ids}`);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_instrument_types",
    {
      title: "List instrument types",
      description: "List all instrument types eToro supports (stocks, crypto, ETFs, etc.).",
      inputSchema: {},
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async () => {
      const data = await client.get("/market-data/instrument-types");
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_industries",
    {
      title: "List industries",
      description: "List all industry classifications used for stock instruments.",
      inputSchema: {},
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async () => {
      const data = await client.get("/market-data/stocks-industries");
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_exchanges",
    {
      title: "List exchanges",
      description: "List all stock exchanges eToro supports.",
      inputSchema: {},
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async () => {
      const data = await client.get("/market-data/exchanges");
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_candles",
    {
      title: "Get OHLCV candles",
      description: "Fetch OHLCV candle data for an instrument. Useful for technical analysis and historical price research.",
      inputSchema: {
        instrumentId: z.number().int().positive().describe("Instrument ID"),
        period: z
          .enum(["OneMinute", "FiveMinutes", "TenMinutes", "FifteenMinutes", "ThirtyMinutes", "OneHour", "FourHours", "OneDay", "OneWeek"])
          .describe("Candle period"),
        count: z.number().int().min(1).max(1000).optional().describe("Number of candles to return (default 10, max 1000)"),
        direction: z.enum(["asc", "desc"]).optional().describe("Sort: 'asc' (oldest first) or 'desc' (newest first). Default: desc"),
      },
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async (args) => {
      const direction = args.direction || "desc";
      const count = args.count || 10;
      const data = await client.get(
        `/market-data/instruments/${args.instrumentId}/history/candles/${direction}/${args.period}/${count}`
      );
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_closing_prices",
    {
      title: "Get daily closing prices",
      description: "Fetch historical closing prices across all instruments.",
      inputSchema: {},
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async () => {
      const data = await client.get("/market-data/instruments/history/closing-price");
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_rates",
    {
      title: "Get live rates",
      description: "Get live bid/ask rates for one or more instruments.",
      inputSchema: {
        instrumentIds: z.array(z.number().int().positive()).min(1).max(100).describe("Array of instrument IDs (1–100)"),
      },
      annotations: { readOnlyHint: true },
    },
    withErrorHandling(async (args) => {
      const ids = args.instrumentIds.join(",");
      const data = await client.get(`/market-data/instruments/rates?instrumentIds=${ids}`);
      return formatToolResponse(data);
    })
  );
}
