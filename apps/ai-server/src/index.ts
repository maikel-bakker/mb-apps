import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { chat } from "./routes";
import { cors } from "hono/cors";
import "dotenv/config";

const app = new Hono();
const api = new Hono();

api.route("/chat", chat);
api.get("/test", (c) => {
  return c.json({ message: "Welcome to the Chat API!" });
});

app.use("/api/*", cors({ origin: "*" }));
app.route("/api", api);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
