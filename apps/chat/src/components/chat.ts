import { getCssVariableValue, html, lightenHex } from "@mb/ui";
import Component from "../lib/component";

type ChatData = {
  timestamp: number;
  sender: "user" | "bot";
  message: string;
};

interface ChatState {
  chats: ChatData[];
}

export default class Chat extends Component<ChatState> {
  constructor() {
    super({
      chats: [],
    });
  }

  async onMount() {
    this.setupEventListeners();
  }

  async onStateChange(state: ChatState, newState: Partial<ChatState>) {
    if (newState.chats) {
      this.renderChatMessages();
    }
  }

  renderHTML() {
    return html`
      <aside>
        <nav>
          <h3>Chats</h3>
          <ul>
            <li>Chat List Item 1</li>
            <li><button class="mb-button primary">New Chat</button></li>
          </ul>
        </nav>
      </aside>
      <main aria-label="Chat Window">
        <slot name="chat-messages"></slot>
        <form>
          <textarea
            name="message"
            placeholder="Type your message..."
            class="mb-input"
          ></textarea>
          <button type="submit" class="mb-button primary">Send</button>
        </form>
      </main>
      <style>
        :host {
          display: grid;
          grid-template-columns: 250px 1fr;
          height: 100vh;
        }
        aside {
          background-color: ${lightenHex(
            getCssVariableValue("--mb-background"),
            2,
          )};
        }
        main {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 16px;

          form {
            display: flex;
            align-items: center;
          }

          textarea {
            width: 100%;
          }
        }
      </style>
    `;
  }

  renderChatMessages() {
    const chatMessagesSlot = this.shadowRoot?.querySelector(
      'slot[name="chat-messages"]',
    ) as HTMLSlotElement | null;

    if (!chatMessagesSlot) return;

    chatMessagesSlot.innerHTML = html`
      <ol class="chats" aria-live="polite" aria-relevant="additions">
        ${this.state.chats.map((chat) => {
          return html`
            <li>
              <article>
                <header>
                  <strong>${chat.sender === "user" ? "You" : "Bot"}</strong>
                  <time datetime="${new Date(chat.timestamp).toISOString()}"
                    >${new Date(chat.timestamp).toLocaleString()}</time
                  >
                  <p>${chat.message}</p>
                </header>
              </article>
            </li>
          `;
        })}
      </ol>
    `;
  }

  setupEventListeners() {
    const form = this.shadowRoot?.querySelector("form");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const formDataObject = Object.fromEntries(formData.entries());

      const newChat: ChatData = {
        timestamp: Date.now(),
        sender: "user",
        message: formDataObject.message as string,
      };

      this.state = {
        chats: [...this.state.chats, newChat],
      };

      form.reset();
    });
  }
}
