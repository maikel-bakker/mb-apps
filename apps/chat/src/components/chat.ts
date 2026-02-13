import { getCssVariableValue, html, lightenHex } from "@mb/ui";
import Component from "../lib/component";
import { chatsStore } from "../stores";
import type { ChatConversation, ChatMessage, ChatState } from "../types";

export default class Chat extends Component<ChatState> {
  constructor() {
    super({
      chats: [],
    });
  }

  async onMount() {
    const chats = await chatsStore.getAllChats();
    this.state = { chats };

    this.retrieveCurrentChatId();
    this.setupEventListeners();
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

    if ("currentChatId" in newState) {
      this.renderChatInput();
    }
  }

  setupEventListeners() {
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

          form {
            display: flex;
            align-items: center;
            gap: 1em;
          }

          textarea {
            width: 100%;
          }
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
      <form>
        <textarea
          name="message"
          placeholder="Type your message..."
          class="mb-input"
          required
        ></textarea>
        <button type="submit" class="mb-button primary">Send</button>
      </form>
    `;

    const form = this.shadowRoot?.querySelector("form");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!this.state.currentChatId) {
        console.error("No chat ID found in URL.");
        return;
      }

      const formData = new FormData(form);
      const formDataObject = Object.fromEntries(formData.entries());

      const newMessage: ChatMessage = {
        timestamp: Date.now(),
        sender: "user",
        message: formDataObject.message as string,
      };

      const currentChat = this.state.chats.find(
        (chat) => chat.id === this.state.currentChatId,
      );

      if (!currentChat) {
        console.error(
          "No chat found for currentChatId:",
          this.state.currentChatId,
        );
        return;
      }

      await this.updateChat(currentChat.id, {
        messages: [...currentChat.messages, newMessage],
      });

      form.reset();
    });
  }

  renderChatMessages() {
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
          ${currentChat.messages
            .map((message) => {
              return html`
                <li class="${message.sender}">
                  <article>
                    <header>
                      <time
                        datetime="${new Date(message.timestamp).toISOString()}"
                        >${new Date(message.timestamp).toLocaleString()}</time
                      >
                      <strong
                        >${message.sender === "user" ? "You" : "Bot"}</strong
                      >
                    </header>
                    <div class="message">${message.message}</div>
                  </article>
                </li>
              `;
            })
            .join("")}
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
              padding: 0.75em 1em;
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
              &.active {
                border-color: var(--mb-hint);
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

  retrieveCurrentChatId() {
    const chatId = getChatId();
    this.state = { currentChatId: chatId };
  }

  async addChat() {
    const newChatData: ChatConversation = {
      id: crypto.randomUUID(),
      title: `Chat ${Object.keys(this.state.chats).length + 1}`,
      messages: [],
      timestamp: Date.now(),
    };

    const newChat = await chatsStore.saveChat(newChatData.id, newChatData);

    this.state = {
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

  async updateChat(chatId: string, chat: Partial<ChatConversation>) {
    const updatedChat = await chatsStore.updateChat(chatId, chat);
    this.state = {
      chats: this.state.chats.map((chat) => {
        if (chat.id === chatId) {
          return updatedChat;
        }
        return chat;
      }),
    };
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
