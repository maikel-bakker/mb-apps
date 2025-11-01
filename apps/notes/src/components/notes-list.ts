import {
  Component,
  darkenHex,
  getNoteId,
  html,
  lightenHex,
  navigateTo,
} from 'lib';
import type { Note } from '../types';
import { notesStore } from '../stores';
import { NOTE_EVENTS } from '../stores/notes';

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

export default class NotesList extends Component<
  NotesListState,
  NotesListTheme
> {
  constructor() {
    super({ notes: [] });
  }

  protected renderHTML() {
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
          }
        }

        [aria-selected='true'] input {
          color: var(--mb-notes-list-foreground-active);
          background-color: var(--mb-notes-list-background-active);
        }

        #new-note {
          margin: 1em 0.75em;
        }
      </style>
    `;
  }

  protected async onMount() {
    this.initComponentTheme(
      {
        foreground: this.theme.c.foreground,
        foregroundHover: lightenHex(this.theme.c.foreground, 10),
        foregroundActive: this.theme.c.hint,
        backgroundHover: darkenHex(this.theme.c.background, 3),
        backgroundActive: darkenHex(this.theme.c.background, 3),
      },
      'notes-list',
    );
    this.setupEventListeners();
    await this.loadNotes();
    this.renderNotes();
  }

  protected async onStateChange() {
    this.renderNotes();
  }

  async loadNotes() {
    const allNotes = await notesStore.getAllNotes();
    const notesArray = Object.values(allNotes);

    // @TODO: handle noteId when no notes are available
    if (!notesArray?.length) {
      throw new Error('No notes found in store');
    }

    let noteId = getNoteId();

    if (!noteId) {
      const firstNoteId = notesArray[0].id;
      navigateTo(`/notes/${firstNoteId}`);
      noteId = firstNoteId;
    }

    this.state = { notes: notesArray, noteId: noteId };
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
              </li>`,
          )
          .join('')}
      </ul>
    `;

    const input = ul.querySelectorAll('input');
    input.forEach((inputElement) => {
      let debounceTimer: NodeJS.Timeout;

      inputElement.addEventListener('change', async (e) => {
        const target = e.target as HTMLInputElement;
        const noteId = target.getAttribute('data-note-id')!;
        const newTitle = target.value;

        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(async () => {
          await notesStore.updateNote(noteId, { title: newTitle });
        }, 1000);
      });

      inputElement.addEventListener('focusin', (e) => {
        const target = e.target as HTMLInputElement;
        const noteId = target.getAttribute('data-note-id')!;
        const noteIdFromRouter = getNoteId();

        if (noteId !== noteIdFromRouter) {
          navigateTo(`/notes/${noteId}`);
          this.state = { noteId: noteId };
        }
      });
    });
  }

  setupEventListeners() {
    const newNoteButton = this.shadowRoot!.querySelector('#new-note')!;

    newNoteButton.addEventListener('click', async () => {
      await this.createNote();
    });

    notesStore.addEventListener(NOTE_EVENTS.NOTES_UPDATED, (event) => {
      const customEvent = event as CustomEvent<{ notes: Note[] }>;
      this.state = { notes: customEvent.detail.notes };
    });
  }

  async createNote(title = 'Untitled Note') {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: title,
      initialVersion: `# ${title}`,
      patches: [],
    };
    await notesStore.setNote(newNote.id, newNote);
  }
}
