export type ChatConversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
};

export type ChatMessage = {
  id: string;
  timestamp: number;
  sender: "user" | "bot";
  message: string;
};
