import { browserScrape, BrowserScrapeArgs } from "@mb/browser-scrape";
import OpenAI from "openai";

export const browserScrapeTool: NonNullable<
  OpenAI.Responses.ResponseCreateParamsNonStreaming["tools"]
>[number] = {
  type: "function" as const,
  name: "browser_scrape",
  description:
    "Open a web page in a headless Chromium browser (JavaScript enabled) and extract readable content.",
  parameters: {
    type: "object",
    properties: {
      url: { type: "string", description: "The URL to open in the browser" },
      waitUntil: {
        type: "string",
        enum: ["domcontentloaded", "load", "networkidle"],
        description: "When the page is considered loaded",
      },
      selectorToWaitFor: {
        type: "string",
        description:
          "Optional CSS selector to wait for before extracting content",
      },
      timeoutMs: {
        type: "number",
        description: "Navigation timeout in milliseconds",
      },
      screenshot: {
        type: "boolean",
        description: "Whether to capture a full-page screenshot",
      },
    },
    // IMPORTANT: must include every key in properties
    required: [
      "url",
      "waitUntil",
      "selectorToWaitFor",
      "timeoutMs",
      "screenshot",
    ],
    additionalProperties: false,
  },
  strict: true,
};

export async function runBrowserScrapeTool(
  args: Omit<BrowserScrapeArgs, "returnHtml">,
) {
  return await browserScrape({
    url: String(args.url),
    returnHtml: true,
    waitUntil: (args.waitUntil ?? "networkidle") as
      | "domcontentloaded"
      | "load"
      | "networkidle",
    selectorToWaitFor: args.selectorToWaitFor,
    timeoutMs: typeof args.timeoutMs === "number" ? args.timeoutMs : 25_000,
    screenshot: Boolean(args.screenshot),
  });
}
