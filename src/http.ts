import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "./server.js";
import { logger } from "./utils/logger.js";
import { Config } from "./config.js";

export function startHttpServer(port: number): void {
  const app = createMcpExpressApp();

  app.post("/mcp", async (req, res) => {
    const apiKey = (req.headers["x-api-key"] as string) ?? "";
    const userKey = (req.headers["x-user-key"] as string) ?? "";
    const tradingModeRaw = (req.headers["x-trading-mode"] as string) ?? "demo";
    const tradingMode: Config["tradingMode"] = tradingModeRaw === "real" ? "real" : "demo";

    const config: Config = { apiKey, userKey, tradingMode };
    const server = createServer(config);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        transport.close();
        server.close();
      });
    } catch (err) {
      logger.error("HTTP request error:", err);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", (_req, res) => {
    res.status(405).json({ error: "Method not allowed" });
  });

  app.delete("/mcp", (_req, res) => {
    res.status(405).json({ error: "Method not allowed" });
  });

  app.listen(port, () => {
    logger.info(`eToro MCP HTTP server listening on port ${port}`);
  });
}
