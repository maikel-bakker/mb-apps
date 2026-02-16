import { getCssVariableValue, html, lightenHex } from "@mb/ui";
import Component from "../lib/component";
import { chatsStore } from "../stores";
import type { ChatConversation, ChatMessage } from "../types";
import OpenAI from "openai";
import { marked } from "marked";

marked.setOptions({
  breaks: true,
});

const UNTITLED_CHAT_TITLE = "New Chat";

type ChatState = {
  currentChatId?: ChatConversation["id"];
  chats: ChatConversation[];
  isResponseLoading: boolean;
};

export default class Chat extends Component<ChatState> {
  private chatAPI = new ChatAPI(import.meta.env.VITE_API_BASE_URL);

  constructor() {
    super({
      chats: [],
      isResponseLoading: false,
    });
  }

  async onMount() {
    const chats = await chatsStore.getAllChats();
    this.state = { chats };

    this.retrieveCurrentChatId();
    this.setupRouteListeners();
    this.renderSidebar();
    this.renderChatMessages();
    this.renderChatInput();
  }

  async onStateChange(state: ChatState, newState: Partial<ChatState>) {
    console.log({
      state,
      newState,
    });
    this.renderChatMessages();
    this.renderSidebar();

    if ("currentChatId" in newState || "isResponseLoading" in newState) {
      this.renderChatInput();
    }
  }

  setupRouteListeners() {
    window.addEventListener("popstate", async () => {
      this.retrieveCurrentChatId();
    });
  }

  renderHTML() {
    return html`
      <slot name="sidebar"></slot>
      <main aria-label="Chat Window">
        <slot name="chat-messages"></slot>
        <slot name="chat-input"></slot>
      </main>
      <style>
        :host {
          display: grid;
          grid-template-columns: 250px 1fr;
          height: 100vh;
        }
        main {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 16px;
          overflow: hidden;
        }
      </style>
    `;
  }

  renderChatInput() {
    const chatInputSlot = this.shadowRoot?.querySelector(
      'slot[name="chat-input"]',
    ) as HTMLSlotElement | null;
    if (!chatInputSlot) {
      return;
    }

    if (!this.state.currentChatId) {
      chatInputSlot.innerHTML = "";
      return;
    }

    chatInputSlot.innerHTML = html`
      <form class="chat-input-form">
        <textarea
          name="message"
          placeholder="Type your message..."
          class="mb-input"
          required
          ${this.state.isResponseLoading ? "disabled" : null}
        ></textarea>
        <button
          type="submit"
          class="mb-button primary"
          ${this.state.isResponseLoading ? "disabled" : null}
        >
          Send
        </button>
      </form>
      <style>
        .chat-input-form {
          display: flex;
          align-items: center;
          gap: 1em;
        }

        textarea {
          width: 100%;
          resize: none;
        }
      </style>
    `;

    const form = this.shadowRoot?.querySelector("form");
    const textarea = form?.querySelector(
      'textarea[name="message"]',
    ) as HTMLTextAreaElement | null;

    const textareaInitialHeight = textarea?.scrollHeight;

    const autoResize = () => {
      if (!textarea) {
        return;
      }
      textarea.style.height = `${textareaInitialHeight}px`;
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea?.addEventListener("keydown", (event) => {
      const e = event as KeyboardEvent;
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        form?.requestSubmit();
      }
    });

    textarea?.addEventListener("input", autoResize);

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!this.state.currentChatId) {
        console.error("No chat ID found in URL.");
        return;
      }

      const formData = new FormData(form);
      const formDataObject = Object.fromEntries(formData.entries());

      const newMessage: ChatMessage = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        sender: "user",
        message: formDataObject.message as string,
      };

      await this.addChatMessage(this.state.currentChatId, newMessage);

      const currentChat = this.state.chats.find(
        (chat) => chat.id === this.state.currentChatId,
      );

      const userMessageCount =
        currentChat?.messages.filter((msg) => msg.sender === "user").length ||
        0;

      /**
       * If this is the first user message in a new chat,
       * generate a title for the chat based on the message content.
       */
      if (
        currentChat &&
        userMessageCount === 1 &&
        currentChat.title === UNTITLED_CHAT_TITLE
      ) {
        const { title } = await this.chatAPI.createChatTitle(
          currentChat.messages,
        );
        await this.updateChat(this.state.currentChatId, { title });
      }

      form.reset();
    });
  }

  async renderChatMessages() {
    const chatMessagesSlot = this.shadowRoot?.querySelector(
      'slot[name="chat-messages"]',
    ) as HTMLSlotElement | null;
    if (!chatMessagesSlot) return;

    const currentChat = this.state.chats.find(
      (chat) => chat.id === this.state.currentChatId,
    );

    if (!currentChat) {
      console.info(
        "No chat found for currentChatId:",
        this.state.currentChatId,
      );
      chatMessagesSlot.innerHTML = html`
        <p class="empty">Select a chat or start a new one to see messages.</p>
        <style>
          .empty {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
          }
        </style>
      `;
      return;
    }

    chatMessagesSlot.innerHTML = html`
      <div class="chats">
        <ol aria-live="polite" aria-relevant="additions">
          ${(
            await Promise.all(
              currentChat.messages.map(async (message) => {
                return html`
                  <li class="${message.sender}">
                    <article>
                      <header>
                        <time
                          datetime="${new Date(
                            message.timestamp,
                          ).toISOString()}"
                          >${new Date(message.timestamp).toLocaleString()}</time
                        >
                        <strong
                          >${message.sender === "user" ? "You" : "Bot"}</strong
                        >
                      </header>
                      <div class="message">
                        ${await marked(message.message)}
                      </div>
                    </article>
                  </li>
                `;
              }),
            )
          ).join("")}
        </ol>
      </div>
      <style>
        .chats {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;

          ol {
            list-style: none;
            padding: 0;
            margin: 0;
            overflow-y: auto;
          }

          li {
            margin-bottom: 1em;
          }

          .user {
            text-align: right;

            .badge,
            .message {
              background-color: var(--mb-hint);
              align-self: flex-end;
            }
          }

          article {
            display: flex;
            flex-direction: column;
            gap: 0.25em;

            header {
              display: inline-flex;
              flex-direction: column;
              gap: 0.25em;
            }

            time {
              font-size: 0.75em;
            }

            .badge {
              display: inline-flex;
              width: fit-content;
              padding: 1em;
              aspect-ratio: 1 / 1;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              background-color: ${lightenHex(
                getCssVariableValue("--mb-background"),
                5,
              )};
            }

            .message {
              width: fit-content;
              padding: 0em 1em;
              border-radius: var(--mb-border-radius);
              background-color: ${lightenHex(
                getCssVariableValue("--mb-background"),
                5,
              )};
            }
          }
        }
      </style>
    `;

    this.renderLoader();

    // Scroll to the bottom of the chat messages
    const chatMessagesContainer = chatMessagesSlot.querySelector(".chats ol");
    if (chatMessagesContainer) {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
  }

  renderSidebar() {
    const asideSlot = this.shadowRoot?.querySelector(
      'slot[name="sidebar"]',
    ) as HTMLSlotElement | null;

    if (!asideSlot) return;

    asideSlot.innerHTML = html`
      <aside>
        <nav>
          <h3>Chats</h3>
          <ul>
            ${[...this.state.chats]
              .sort((a, b) => b.timestamp - a.timestamp)
              .map(
                (chat) => html`
                  <li>
                    <button
                      data-chat-id="${chat.id}"
                      class="${chat.id === this.state.currentChatId
                        ? "active"
                        : ""}"
                      title="${chat.title}"
                    >
                      ${chat.title}
                    </button>
                    <button
                      data-delete-chat-id="${chat.id}"
                      title="Delete Chat"
                    >
                      &#128465;
                    </button>
                  </li>
                `,
              )
              .join("")}
            <li>
              <button id="new-chat" class="mb-button primary">New Chat</button>
            </li>
          </ul>
        </nav>
      </aside>
      <style>
        aside {
          background-color: ${lightenHex(
          getCssVariableValue("--mb-background"),
          2,
        )};

          nav {
            ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            li {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 0.5em;
            }
            button {
              cursor: pointer;

              &[data-chat-id] {
                width: 100%;
                background: none;
                border: none;
                text-align: left;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding: 0.5em 1em;

                &.active {
                  border-left: 2px solid var(--mb-hint);
                }
            }
          }
        }
      </style>
    `;

    const newChatButton = this.shadowRoot?.querySelector("#new-chat");
    newChatButton?.addEventListener("click", async () => {
      const newChat = await this.addChat();
      navigateTo(`/chat/${newChat.id}`);
    });

    const buttons = asideSlot.querySelectorAll("button[data-chat-id]");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const chatId = button.getAttribute("data-chat-id");
        if (chatId) {
          navigateTo(`/chat/${chatId}`);
        }
      });
    });

    const deleteButtons = asideSlot.querySelectorAll(
      "button[data-delete-chat-id]",
    );
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const chatId = button.getAttribute("data-delete-chat-id");
        if (chatId) {
          await this.deleteChat(chatId);

          if (this.state.currentChatId === chatId) {
            navigateTo(`/`);
          }
        }
      });
    });
  }

  renderLoader() {
    const parent = this.shadowRoot?.querySelector(
      'slot[name="chat-messages"] ',
    ) as HTMLSlotElement | null;

    if (!parent) {
      return;
    }

    if (this.state.isResponseLoading) {
      parent.innerHTML += html`
        <div class="loader" aria-label="Assistant is typing">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
        <style>
          .loader {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 50%;
            padding-bottom: 1em;
          }

          .loader .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
            opacity: 0.4;
            animation: typing 1.2s infinite ease-in-out;
          }

          .loader .dot:nth-child(2) {
            animation-delay: 0.2s;
          }

          .loader .dot:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes typing {
            0%,
            80%,
            100% {
              transform: translateY(0);
              opacity: 0.4;
            }
            40% {
              transform: translateY(-4px);
              opacity: 1;
            }
          }
        </style>
      `;
    } else {
      const loader = parent.querySelector(".loader");
      if (loader) {
        loader.remove();
      }
    }
  }

  retrieveCurrentChatId() {
    const chatId = getChatId();
    this.state = { currentChatId: chatId };
  }

  async addChat() {
    this.state = { isResponseLoading: true };

    const { response: aiResponse } = await this.chatAPI.createResponse([
      {
        role: "user",
        content: "Hello, who are you?",
      },
    ]);

    const newChatData: ChatConversation = {
      id: crypto.randomUUID(),
      title: UNTITLED_CHAT_TITLE,
      messages: [
        {
          id: aiResponse.id,
          sender: "bot",
          message: aiResponse.output_text,
          timestamp: aiResponse.created_at * 1000,
        },
      ],
      timestamp: aiResponse.created_at,
    };

    const newChat = await chatsStore.saveChat(newChatData.id, newChatData);

    this.state = {
      isResponseLoading: false,
      chats: [...this.state.chats, newChat],
    };

    return newChat;
  }

  async deleteChat(chatId: string) {
    await chatsStore.deleteChat(chatId);

    this.state = {
      chats: this.state.chats.filter((chat) => chat.id !== chatId),
    };
  }

  async addChatMessage(chatId: string, message: ChatMessage) {
    const currentChat = this.state.chats.find((chat) => chat.id === chatId);
    if (!currentChat) {
      throw new Error(`Chat with id ${chatId} not found`);
    }

    const updatedChat = await this.updateChat(chatId, {
      messages: [...currentChat.messages, message],
    });

    this.state = { isResponseLoading: true };

    const previousMessageId = updatedChat.messages
      .filter((msg) => msg.sender === "bot")
      .sort((a, b) => b.timestamp - a.timestamp)
      .at(0)?.id;

    const { response: aiResponse } = await this.chatAPI.createResponse(
      [
        {
          role: message.sender === "user" ? "user" : "assistant",
          content: message.message,
        },
      ],
      previousMessageId,
    );

    this.updateChat(chatId, {
      messages: [
        ...updatedChat.messages,
        {
          id: aiResponse.id,
          sender: "bot",
          message: aiResponse.output_text,
          timestamp: aiResponse.created_at * 1000,
        },
      ],
    });

    this.state = { isResponseLoading: false };
  }

  async updateChat(chatId: string, updatedFields: Partial<ChatConversation>) {
    const updatedChat = await chatsStore.updateChat(chatId, updatedFields);

    this.state = {
      chats: this.state.chats.map((c) => {
        if (c.id === chatId) {
          return updatedChat;
        }
        return c;
      }),
    };

    return updatedChat;
  }
}

// @TODO: move to router package
function navigateTo(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function getChatId() {
  const pathParts = window.location.pathname.split("/");
  const chatPath = pathParts.findIndex((part) => part === "chat");
  if (chatPath === -1) return undefined;

  return pathParts[chatPath + 1] || undefined;
}

function matchPath(path: string) {
  const currentRoute = window.location.pathname;
  const routeParts = currentRoute.split("/").filter(Boolean);

  return routeParts.includes(path);
}

class ChatAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async createResponse(
    input: OpenAI.Responses.ResponseInput,
    previousResponseId?: string,
  ) {
    const chatRoute = "/api/chat";
    const response = await fetch(`${this.baseUrl}${chatRoute}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input, previousResponseId }),
    });

    return response.json();
  }

  async createChatTitle(messages: ChatMessage[]) {
    const chatTitleRoute = "/api/chat/title";
    const response = await fetch(`${this.baseUrl}${chatTitleRoute}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    return response.json();
  }
}
