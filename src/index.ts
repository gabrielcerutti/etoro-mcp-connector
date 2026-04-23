#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { createServer } from "./server.js";
import { logger } from "./utils/logger.js";

async function main(): Promise<void> {
  const httpEnvPort = process.env.MCP_HTTP_PORT ? parseInt(process.env.MCP_HTTP_PORT, 10) : null;
  const httpArgIndex = process.argv.indexOf("--http");
  const httpArgPort = httpArgIndex !== -1 ? parseInt(process.argv[httpArgIndex + 1] ?? "3000", 10) : null;
  const httpPort = httpEnvPort ?? httpArgPort;

  if (httpPort) {
    const { startHttpServer } = await import("./http.js");
    startHttpServer(httpPort);
    return;
  }

  const config = loadConfig();
  const server = createServer(config);
  const transport = new StdioServerTransport();
  logger.info("Starting eToro MCP server...");
  await server.connect(transport);
  logger.info("eToro MCP server running on stdio.");
}

process.on("uncaughtException", (err) => {
  process.stderr.write(`UNCAUGHT: ${err.message}\n${err.stack}\n`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  process.stderr.write(`UNHANDLED REJECTION: ${String(reason)}\n`);
  process.exit(1);
});

main().catch((error) => {
  logger.error("Fatal error:", error);
  process.exit(1);
});
