import OpenAI from "openai";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { env } from "hono/adapter";
import { OpenAIService } from "../services";
import { browserScrapeTool, runBrowserScrapeTool } from "../tools";

export const chatRoutes = {
  path: "chat",
  title: {
    path: "title",
  },
};

export const chat = new Hono();

chat.post("/", async (c) => {
  const body = await c.req.json();
  const { input, previousResponseId } = body;

  const { VITE_OPEN_AI_KEY } = env<{
    VITE_OPEN_AI_KEY: string;
  }>(c);

  const openAIChat = initOpenAIChat(VITE_OPEN_AI_KEY);

  const maxToolTurns = 5;
  let toolTurns = 0;

  let response = await openAIChat.createResponse(input, previousResponseId);

  while (toolTurns < maxToolTurns) {
    const toolCalls = response.output.filter((o) => o.type === "function_call");

    if (toolCalls.length === 0) {
      break;
    }

    const toolOutputPromise = toolCalls.map(async (o) => {
      const result = await runTool(o.name, JSON.parse(o.arguments));

      return {
        type: "function_call_output",
        call_id: o.call_id,
        output: JSON.stringify(result),
      };
    });

    const toolOutput = await Promise.all(toolOutputPromise);

    response = await openAIChat.createResponse(
      toolOutput as OpenAI.Responses.ResponseFunctionToolCallOutputItem[],
      response.id,
    );

    toolTurns += 1;
  }

  return c.json({ response });
});

chat.post("/title", async (c) => {
  const body = await c.req.json();
  const { messages } = body;

  const { VITE_OPEN_AI_KEY } = env<{
    VITE_OPEN_AI_KEY: string;
  }>(c);

  try {
    const openAIChat = initOpenAIChat(VITE_OPEN_AI_KEY);
    const title = await openAIChat.createChatTitle(messages);
    return c.json({ title });
  } catch (error) {
    throw new HTTPException(500, {
      message: "Failed to create chat title",
      cause: JSON.stringify(error),
    });
  }
});

function initOpenAIChat(apiKey: string) {
  return new OpenAIService(
    {
      apiKey,
    },
    {
      model: "gpt-5.2-chat-latest",
      instructions: [
        "You are a helpful assistant that helps users with their queries.",
        "When a user asks to look up information on a specific website or asks for current/up-to-date information, use web_search to find the right URL.",
        "If needed, then use browser_scrape to fetch and summarize the page content.",
        "Do not claim to have visited or checked a site unless a tool was used.",
      ].join(" "),
      tools: [{ type: "web_search" }, browserScrapeTool],
    },
  );
}

async function runTool(name: string, args: any) {
  switch (name) {
    case "browser_scrape":
      return await runBrowserScrapeTool(args);

    default:
      return { ok: false, error: `Unknown tool: ${name}` };
  }
}
