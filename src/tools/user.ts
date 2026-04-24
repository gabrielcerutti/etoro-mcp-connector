import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { EtoroClient } from "../client/etoro-client.js";
import { formatToolResponse, withErrorHandling } from "../utils/errors.js";
import { buildQueryString } from "../utils/http.js";

const PERIOD_ENUM = [
  "CurrMonth",
  "CurrQuarter",
  "CurrYear",
  "LastYear",
  "LastTwoYears",
  "OneMonthAgo",
  "TwoMonthsAgo",
  "ThreeMonthsAgo",
  "SixMonthsAgo",
  "OneYearAgo",
] as const;

export function registerUserTools(server: McpServer, client: EtoroClient): void {
  server.registerTool(
    "etoro_get_user_profile",
    {
      title: "Get user profile",
      description: "Get an eToro user's public profile by username.",
      inputSchema: {
        username: z.string().min(1).describe("eToro username"),
      },
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async (args) => {
      const data = await client.get(`/user-info/people?usernames=${encodeURIComponent(args.username)}`);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_user_performance",
    {
      title: "Get user performance",
      description:
        "Get a user's trading performance (returns, risk score). Pass `period` for time-windowed performance; omit for lifetime/default summary.",
      inputSchema: {
        username: z.string().min(1).describe("eToro username"),
        period: z
          .enum(PERIOD_ENUM)
          .optional()
          .describe("Optional performance period. Omit for the default lifetime summary."),
      },
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async (args) => {
      const query = buildQueryString({ period: args.period });
      const data = await client.get(`/user-info/people/${encodeURIComponent(args.username)}/gain${query}`);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_user_trades",
    {
      title: "Get user trade info",
      description: "Get a user's trade info (averages, win/loss stats) for a specific period.",
      inputSchema: {
        username: z.string().min(1).describe("eToro username"),
        period: z.enum(PERIOD_ENUM).describe("Period to retrieve trade info for"),
      },
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async (args) => {
      const data = await client.get(
        `/user-info/people/${encodeURIComponent(args.username)}/tradeinfo?period=${args.period}`
      );
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_user_portfolio",
    {
      title: "Get user public portfolio",
      description: "Get a user's live public portfolio holdings (instruments, allocation).",
      inputSchema: {
        username: z.string().min(1).describe("eToro username"),
      },
      annotations: { readOnlyHint: true },
    },
    withErrorHandling(async (args) => {
      const data = await client.get(`/user-info/people/${encodeURIComponent(args.username)}/portfolio/live`);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_discover_users",
    {
      title: "Discover popular investors",
      description: "Discover popular investors / traders on eToro filtered by performance, risk, and popularity.",
      inputSchema: {
        period: z.enum(PERIOD_ENUM).describe("Performance period to filter by"),
        gainMin: z.number().min(-100).max(10000).optional().describe("Minimum gain percentage"),
        gainMax: z.number().min(-100).max(10000).optional().describe("Maximum gain percentage"),
        maxDailyRiskScoreMax: z.number().min(1).max(10).optional().describe("Max daily risk score (1–10, lower = safer)"),
        maxMonthlyRiskScoreMax: z.number().min(1).max(10).optional().describe("Max monthly risk score (1–10, lower = safer)"),
        popularInvestor: z.boolean().optional().describe("Filter to popular investors (eligible for copy) only"),
        page: z.number().int().min(1).optional().describe("Page number (default 1)"),
        pageSize: z.number().int().min(1).max(100).optional().describe("Results per page (default 20)"),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    withErrorHandling(async (args) => {
      const query = buildQueryString({
        period: args.period,
        gainMin: args.gainMin,
        gainMax: args.gainMax,
        maxDailyRiskScoreMax: args.maxDailyRiskScoreMax,
        maxMonthlyRiskScoreMax: args.maxMonthlyRiskScoreMax,
        popularInvestor: args.popularInvestor,
        page: args.page,
        pageSize: args.pageSize,
      });
      const data = await client.get(`/user-info/people/search${query}`);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_current_user",
    {
      title: "Get authenticated user identity",
      description:
        "Get the identity of the currently authenticated user: Global Customer ID (GCID), real account CID, demo account CID. " +
        "Useful for self-referential queries and for resolving your own username.",
      inputSchema: {},
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async () => {
      const data = await client.get("/me");
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_copiers",
    {
      title: "Get my copiers",
      description:
        "Get information about users currently copying the authenticated user's portfolio (country, club, copy duration, amount category).",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    withErrorHandling(async () => {
      const data = await client.get("/pi-data/copiers");
      return formatToolResponse(data);
    })
  );
}
