import { darkenHex, html, lightenHex } from "@mb/ui";
import { Component } from "lib";
import type { Note } from "../types";

interface NotesListState {
  notes: Note[];
  noteId?: string;
}

type NotesListTheme = {
  foreground: string;
  foregroundHover: string;
  foregroundActive: string;
  backgroundHover: string;
  backgroundActive: string;
};

type NotesListCustomProps = {
  onNoteInputChange: (noteId: string, newData: { title: string }) => void;
  onNewNoteClick: () => Promise<void>;
  onNoteDeleteClick: (noteId: string) => Promise<void>;
  onNoteFocus: (noteId: string) => void;
};

export const NOTES_LIST_ATTRIBUTES = {
  NOTES: "data-notes",
  NOTE_ID: "data-note-id",
};

export const NOTES_LIST_CUSTOM_PROPS = {
  ON_NOTE_INPUT_CHANGE: "data-on-note-input-change",
  ON_NEW_NOTE_CLICK: "data-on-new-note-click",
  ON_NOTE_DELETE_CLICK: "data-on-note-delete-click",
  ON_NOTE_FOCUS: "data-on-note-focus",
};

export default class NotesList extends Component<
  NotesListState,
  NotesListTheme,
  NotesListCustomProps
> {
  static observedAttributes = Object.values(NOTES_LIST_ATTRIBUTES);

  constructor() {
    super({ notes: [] });
  }

  renderHTML() {
    return html`
      <slot name="notes"></slot>
      <button id="new-note">+ New Note</button>
      <style>
        ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
        }

        li {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        input {
          width: 100%;
          background: transparent;
          color: var(--mb-notes-list-foreground);
          border: none;
          padding: 0.5em 0.75em;
          transition:
            color 0.1s ease,
            background-color 0.1s ease;

          &:focus {
            outline: none;
          }

          &:hover {
            color: var(--mb-notes-list-foreground-hover);
            background-color: var(--mb-notes-list-background-hover);

            + button {
              background-color: var(--mb-notes-list-background-hover);
            }
          }
        }

        input + button {
          background-color: transparent;
          color: var(--mb-notes-list-foreground);
          font-size: 1em;
          padding: 0;
          width: 2em;
          aspect-ratio: 1 / 1;
          display: block;

          &:hover {
            background-color: var(--mb-notes-list-background-active);
            color: red;
          }
        }

        [aria-selected="true"] input {
          color: var(--mb-notes-list-foreground-active);
          background-color: var(--mb-notes-list-background-active);

          + button {
            background-color: var(--mb-notes-list-background-active);
          }
        }

        #new-note {
          margin: 1em 0.75em;
        }
      </style>
    `;
  }

  async onMount() {
    this.initComponentTheme(
      {
        foreground: this.theme.c.foreground,
        foregroundHover: lightenHex(this.theme.c.foreground, 10),
        foregroundActive: this.theme.c.hint,
        backgroundHover: darkenHex(this.theme.c.background, 3),
        backgroundActive: darkenHex(this.theme.c.background, 3),
      },
      "notes-list",
    );
    this.setupEventListeners();
    this.renderNotes();
  }

  attributeChangedCallback(name: string, _: any, newValue: any) {
    if (name === NOTES_LIST_ATTRIBUTES.NOTES && newValue) {
      const notes = JSON.parse(newValue) as Note[];
      this.state = { notes: notes };
    }

    if (name === NOTES_LIST_ATTRIBUTES.NOTE_ID) {
      this.state = { noteId: newValue };
    }
  }

  async onStateChange() {
    this.renderHTML();
    this.renderNotes();
  }

  renderNotes() {
    const ul = this.shadowRoot!.querySelector('slot[name="notes"]');
    if (!ul) return;

    ul.innerHTML = html`
      <ul role="menu">
        ${this.state.notes
          .map(
            (note) =>
              html`<li
                role="menuitem"
                aria-selected="${this.state.noteId === note.id}"
              >
                <input
                  type="text"
                  value="${note.title}"
                  data-note-id="${note.id}"
                />
                <button aria-label="Delete note" data-note-id="${note.id}">
                  &times;
                </button>
              </li>`,
          )
          .join("")}
      </ul>
    `;

    const input = ul.querySelectorAll("input");
    input.forEach((inputElement) => {
      let debounceTimer: NodeJS.Timeout;

      inputElement.addEventListener("change", async (e) => {
        const target = e.target as HTMLInputElement;
        const noteId = NotesList.getNoteIdFromElement(target)!;
        const newTitle = target.value;

        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(async () => {
          this.props?.onNoteInputChange(noteId, { title: newTitle });
        }, 1000);
      });

      inputElement.addEventListener("focusin", (e) => {
        const target = e.target as HTMLInputElement;
        const noteId = NotesList.getNoteIdFromElement(target)!;
        this.props?.onNoteFocus(noteId);
      });
    });

    const deleteButtons = ul.querySelectorAll("li > button");
    deleteButtons.forEach((buttonElement) => {
      buttonElement.addEventListener("click", async (e) => {
        const target = e.target as HTMLButtonElement;
        const noteId = NotesList.getNoteIdFromElement(target)!;
        await this.props?.onNoteDeleteClick(noteId);
      });
    });
  }

  setupEventListeners() {
    const newNoteButton = this.shadowRoot!.querySelector("#new-note")!;

    newNoteButton.addEventListener("click", async () => {
      await this.props?.onNewNoteClick();
    });
  }

  static getNoteIdFromElement(element: Element) {
    return element.getAttribute("data-note-id");
  }
}
