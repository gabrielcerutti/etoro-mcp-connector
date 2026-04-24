import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { EtoroClient } from "../client/etoro-client.js";
import { formatToolResponse, withErrorHandling } from "../utils/errors.js";

interface WatchlistItem {
  itemId: number;
  itemType: string;
  itemRank: number;
  market?: {
    symbolName?: string;
    displayName?: string;
    exchangeId?: number;
  };
}

interface Watchlist {
  watchlistId: string;
  name: string;
  watchlistType: string;
  totalItems: number;
  isDefault: boolean;
  items?: WatchlistItem[];
}

interface WatchlistsResponse {
  watchlists: Watchlist[];
}

function trimWatchlists(data: WatchlistsResponse) {
  return {
    watchlists: data.watchlists.map((w) => ({
      watchlistId: w.watchlistId,
      name: w.name,
      type: w.watchlistType,
      totalItems: w.totalItems,
      isDefault: w.isDefault,
      items: (w.items || []).map((item) => ({
        instrumentId: item.itemId,
        symbol: item.market?.symbolName,
        displayName: item.market?.displayName,
      })),
    })),
  };
}

export function registerWatchlistsTools(server: McpServer, client: EtoroClient): void {
  server.registerTool(
    "etoro_get_watchlists",
    {
      title: "List watchlists",
      description: "Get all watchlists for the current user.",
      inputSchema: {},
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async () => {
      const data = await client.get<WatchlistsResponse>("/watchlists");
      return formatToolResponse(trimWatchlists(data));
    })
  );

  server.registerTool(
    "etoro_create_watchlist",
    {
      title: "Create watchlist",
      description: "Create a new watchlist with the given name.",
      inputSchema: {
        name: z.string().min(1).max(100).describe("Name for the new watchlist (max 100 chars)"),
      },
      annotations: { destructiveHint: false },
    },
    withErrorHandling(async (args) => {
      const params = new URLSearchParams({ name: args.name });
      const data = await client.post(`/watchlists?${params}`);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_delete_watchlist",
    {
      title: "Delete watchlist",
      description: "Delete a watchlist by its ID.",
      inputSchema: {
        watchlistId: z.number().int().positive().describe("Watchlist ID to delete"),
      },
      annotations: { destructiveHint: true, idempotentHint: true },
    },
    withErrorHandling(async (args) => {
      const data = await client.delete(`/watchlists/${args.watchlistId}`);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_rename_watchlist",
    {
      title: "Rename watchlist",
      description: "Rename an existing watchlist.",
      inputSchema: {
        watchlistId: z.number().int().positive().describe("Watchlist ID to rename"),
        name: z.string().min(1).max(100).describe("New name for the watchlist (max 100 chars)"),
      },
      annotations: { idempotentHint: true },
    },
    withErrorHandling(async (args) => {
      const params = new URLSearchParams({ newName: args.name });
      const data = await client.put(`/watchlists/${args.watchlistId}?${params}`);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_add_watchlist_items",
    {
      title: "Add items to watchlist",
      description: "Add one or more instruments to an existing watchlist.",
      inputSchema: {
        watchlistId: z.number().int().positive().describe("Watchlist ID"),
        instrumentIds: z.array(z.number().int().positive()).min(1).max(100).describe("Instrument IDs to add (1–100)"),
      },
      annotations: { idempotentHint: true },
    },
    withErrorHandling(async (args) => {
      const data = await client.post(`/watchlists/${args.watchlistId}/items`, args.instrumentIds);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_remove_watchlist_item",
    {
      title: "Remove item from watchlist",
      description: "Remove an instrument from a watchlist.",
      inputSchema: {
        watchlistId: z.number().int().positive().describe("Watchlist ID"),
        instrumentId: z.number().int().positive().describe("Instrument ID to remove"),
      },
      annotations: { destructiveHint: true, idempotentHint: true },
    },
    withErrorHandling(async (args) => {
      const data = await client.delete(`/watchlists/${args.watchlistId}/items`, [
        { ItemId: args.instrumentId, ItemType: "Instrument" },
      ]);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_set_default_watchlist",
    {
      title: "Set default watchlist",
      description: "Mark a watchlist as the user's default.",
      inputSchema: {
        watchlistId: z.number().int().positive().describe("Watchlist ID to set as default"),
      },
      annotations: { idempotentHint: true },
    },
    withErrorHandling(async (args) => {
      const data = await client.put(`/watchlists/setUserSelectedUserDefault/${args.watchlistId}`);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_curated_lists",
    {
      title: "Get curated lists",
      description: "Get eToro's curated / featured instrument lists.",
      inputSchema: {},
      annotations: { readOnlyHint: true, idempotentHint: true },
    },
    withErrorHandling(async () => {
      const data = await client.get("/curated-lists");
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_get_public_watchlists",
    {
      title: "Get user's public watchlists",
      description: "Get publicly shared watchlists from a specific user.",
      inputSchema: {
        userId: z.number().int().positive().describe("User ID whose public watchlists to retrieve"),
      },
      annotations: { readOnlyHint: true },
    },
    withErrorHandling(async (args) => {
      const data = await client.get(`/watchlists/public/${args.userId}`);
      return formatToolResponse(data);
    })
  );
}
