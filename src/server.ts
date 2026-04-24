import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Config } from "./config.js";
import { EtoroClient } from "./client/etoro-client.js";
import { registerAllTools } from "./tools/index.js";

const pkgPath = fileURLToPath(new URL("../package.json", import.meta.url));
const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { name: string; version: string };

export function createServer(config: Config): McpServer {
  const server = new McpServer({
    name: pkg.name,
    version: pkg.version,
  });

  const client = new EtoroClient(config);
  registerAllTools(server, client);

  return server;
}
