import { createServer } from "node:http";

export function createApp() {
  return createServer((request, response) => {
    if (request.url === "/health") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "not_found" }));
  });
}

if (process.argv[1]?.endsWith("server.js")) {
  createApp().listen(3000);
}
