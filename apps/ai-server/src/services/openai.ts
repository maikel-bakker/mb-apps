import OpenAI, { type ClientOptions } from "openai";

export type OpenAIChatOptions = Pick<
  OpenAI.Responses.ResponseCreateParamsNonStreaming,
  "model" | "instructions" | "tools"
>;

export class OpenAIService {
  private openAI: OpenAI;
  private options: OpenAIChatOptions = {};

  constructor(options: ClientOptions, chatOptions?: OpenAIChatOptions) {
    this.openAI = new OpenAI(options);
    this.options = { ...this.options, ...chatOptions };
  }

  async createResponse(
    input: OpenAI.Responses.ResponseInput,
    previousResponseId?: string,
  ) {
    const response = await this.openAI.responses.create({
      ...this.options,
      input,
      previous_response_id: previousResponseId,
    });

    return response;
  }

  async createChatTitle(input: OpenAI.Responses.ResponseInput) {
    const response = await this.openAI.responses.create({
      model: "gpt-4.1-mini",
      input,
      instructions: `You generate short chat titles.
        Return a concise title of at most 10 words.
        No punctuation. No quotes. No emojis.`,
    });

    return response.output_text;
  }
}
