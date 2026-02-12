import localforage from "localforage";
import type { ChatConversation } from "../types";

export const CHAT_EVENTS = {
  CHAT_ADDED: "chat::added",
  CHAT_UPDATED: "chat::updated",
  CHAT_DELETED: "chat::deleted",
};

class ChatsStore extends EventTarget {
  private db = localforage.createInstance({
    driver: localforage.INDEXEDDB,
    name: "chat-app",
    storeName: "chats_store",
  });

  constructor() {
    super();
  }

  async saveChat(
    id: string,
    chat: ChatConversation,
  ): Promise<ChatConversation> {
    const item = await this.db.setItem(id, chat);
    this.dispatchEvent(
      new CustomEvent(CHAT_EVENTS.CHAT_ADDED, {
        detail: { id, value: chat },
      }),
    );
    return item;
  }

  async getChat(id: string): Promise<ChatConversation | null> {
    return await this.db.getItem<ChatConversation>(id);
  }

  async updateChat(id: string, chat: Partial<ChatConversation>) {
    const existingChat = await this.getChat(id);
    if (!existingChat) {
      throw new Error(`Chat with id ${id} not found`);
    }

    const newChat = {
      ...existingChat,
      ...chat,
      timestamp: Date.now(),
    };

    const updatedChat = await this.db.setItem(id, newChat);
    this.dispatchEvent(
      new CustomEvent(CHAT_EVENTS.CHAT_UPDATED, {
        detail: { id, value: newChat },
      }),
    );

    return updatedChat;
  }

  async deleteChat(id: string) {
    await this.db.removeItem(id);
    this.dispatchEvent(
      new CustomEvent(CHAT_EVENTS.CHAT_DELETED, { detail: { id } }),
    );
  }

  async getAllChats(): Promise<ChatConversation[]> {
    const chats = new Map<string, ChatConversation>();
    await this.db.iterate((value, key) => {
      chats.set(key, value as ChatConversation);
    });
    return Array.from(chats.values());
  }
}

const chatsStore = new ChatsStore();
export default chatsStore;
