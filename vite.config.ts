import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";

function platformApi(): Plugin {
  const attach = (server: ViteDevServer) => {
    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      const path = req.url?.split("?")[0];
      if (path !== "/api/platform") {
        next();
        return;
      }
      try {
        const { handlePlatform } = await import("./api/platform.js");
        let body: unknown = null;
        if (req.method === "PUT" || req.method === "POST") {
          body = await new Promise((resolve, reject) => {
            let raw = "";
            req.on("data", (chunk) => {
              raw += chunk;
            });
            req.on("end", () => {
              try {
                resolve(raw ? JSON.parse(raw) : null);
              } catch (err) {
                reject(err);
              }
            });
            req.on("error", reject);
          });
        }
        const result = await handlePlatform(req.method || "GET", body);
        res.statusCode = result.status;
        res.setHeader("Cache-Control", "no-store");
        if (result.data == null) {
          res.end();
          return;
        }
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result.data));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "store", detail: err instanceof Error ? err.message : "unknown" }));
      }
    });
  };
  return {
    name: "platform-api",
    configureServer: attach,
    configurePreviewServer: attach,
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (env.BLOB_READ_WRITE_TOKEN) process.env.BLOB_READ_WRITE_TOKEN = env.BLOB_READ_WRITE_TOKEN;
  if (env.BLOB_STORE_ID) process.env.BLOB_STORE_ID = env.BLOB_STORE_ID;
  return {
    plugins: [react(), platformApi()],
    server: {
      port: 5173,
      host: true,
    },
  };
});
