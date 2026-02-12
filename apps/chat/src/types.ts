export type ChatConversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
};

export type ChatMessage = {
  timestamp: number;
  sender: "user" | "bot";
  message: string;
};

export type ChatState = {
  currentChatId?: ChatConversation["id"];
  chats: ChatConversation[];
};
