import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { EtoroClient } from "../client/etoro-client.js";
import { formatToolResponse, withErrorHandling } from "../utils/errors.js";
import { buildQueryString } from "../utils/http.js";

interface FeedResponse {
  discussions: Array<Record<string, unknown>>;
  paging?: Record<string, unknown>;
}

function trimFeed(data: FeedResponse) {
  return {
    posts: (data.discussions || []).map((d) => {
      const post = d.post as Record<string, unknown> | undefined;
      const msg = post?.message as Record<string, unknown> | undefined;
      const owner = post?.owner as Record<string, unknown> | undefined;
      const tags = (post?.tags as Array<Record<string, unknown>> || []);
      const summary = d.summary as Record<string, unknown> | undefined;
      const emotions = d.emotionsData as Record<string, unknown> | undefined;
      const like = emotions?.like as Record<string, unknown> | undefined;
      const likePaging = like?.paging as Record<string, unknown> | undefined;
      return {
        id: post?.id,
        created: post?.created,
        author: owner ? { username: owner.username, name: `${owner.firstName} ${owner.lastName}` } : undefined,
        text: msg?.text,
        language: msg?.languageCode,
        tags: tags.map((t) => {
          const m = t.market as Record<string, unknown> | undefined;
          return m ? { symbol: m.symbolName, name: m.displayName } : undefined;
        }).filter(Boolean),
        likes: likePaging?.totalCount ?? 0,
        comments: summary?.totalCommentsAndReplies ?? 0,
        shares: summary?.sharedCount ?? 0,
      };
    }),
    paging: data.paging ? { offset: data.paging.offSet, take: data.paging.take } : undefined,
  };
}

export function registerFeedsTools(server: McpServer, client: EtoroClient): void {
  server.registerTool(
    "etoro_get_instrument_feed",
    {
      title: "Get instrument feed",
      description: "Get the social feed (posts, discussions) for a specific instrument.",
      inputSchema: {
        instrumentId: z.number().int().positive().describe("Instrument ID"),
        take: z.number().int().min(1).max(100).optional().describe("Number of posts to retrieve (default 20, max 100)"),
        offset: z.number().int().min(0).optional().describe("Number of posts to skip (default 0)"),
      },
      annotations: { readOnlyHint: true },
    },
    withErrorHandling(async (args) => {
      const query = buildQueryString({ take: args.take, offset: args.offset });
      const data = await client.get<FeedResponse>(`/feeds/instrument/${args.instrumentId}${query}`);
      return formatToolResponse(trimFeed(data));
    })
  );

  server.registerTool(
    "etoro_get_user_feed",
    {
      title: "Get user feed",
      description: "Get the social feed (posts, discussions) for a specific user by their eToro username.",
      inputSchema: {
        username: z.string().min(1).describe("eToro username"),
        take: z.number().int().min(1).max(100).optional().describe("Number of posts to retrieve (default 20, max 100)"),
        offset: z.number().int().min(0).optional().describe("Number of posts to skip (default 0)"),
      },
      annotations: { readOnlyHint: true },
    },
    withErrorHandling(async (args) => {
      const profile = await client.get<{ users: Array<{ gcid: number }> }>(
        `/user-info/people?usernames=${encodeURIComponent(args.username)}`
      );
      if (!profile.users?.length) {
        throw new Error(`User "${args.username}" not found`);
      }
      const userId = profile.users[0].gcid;
      const query = buildQueryString({ take: args.take, offset: args.offset });
      const data = await client.get<FeedResponse>(`/feeds/user/${userId}${query}`);
      return formatToolResponse(trimFeed(data));
    })
  );

  server.registerTool(
    "etoro_create_post",
    {
      title: "Create feed post",
      description: "Create a new post on the eToro social feed. Optionally tag an instrument.",
      inputSchema: {
        content: z.string().min(1).describe("Post content / text"),
        instrumentId: z.number().int().positive().optional().describe("Optional instrument ID to tag in the post"),
      },
      annotations: { destructiveHint: false, openWorldHint: true },
    },
    withErrorHandling(async (args) => {
      const body: Record<string, unknown> = { message: args.content };
      if (args.instrumentId !== undefined) {
        body.tags = { tags: [{ name: "instrument", id: String(args.instrumentId) }] };
      }
      const data = await client.post("/feeds/post", body);
      return formatToolResponse(data);
    })
  );

  server.registerTool(
    "etoro_create_comment",
    {
      title: "Comment on a post",
      description: "Add a comment to an existing post on the eToro social feed.",
      inputSchema: {
        postId: z.string().min(1).describe("ID of the post to comment on"),
        content: z.string().min(1).describe("Comment content / text"),
      },
      annotations: { destructiveHint: false, openWorldHint: true },
    },
    withErrorHandling(async (args) => {
      const data = await client.post(`/reactions/${args.postId}/comment`, {
        content: args.content,
      });
      return formatToolResponse(data);
    })
  );
}
