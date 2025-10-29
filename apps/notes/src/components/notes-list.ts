import { Component, html, navigateTo } from '../lib';
import type { Note } from '../types';
import { notesStore } from '../stores';
import { NOTE_EVENTS } from '../stores/notes';

interface NotesListState {
  notes: Note[];
}

export default class NotesList extends Component<NotesListState> {
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
          gap: 0.5em;
        }

        input {
          width: 100%;
        }

        #new-note {
          margin-top: 1em;
        }
      </style>
    `;
  }

  protected async onMount() {
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

    this.state = { notes: notesArray };
  }

  renderNotes() {
    const ul = this.shadowRoot!.querySelector('slot[name="notes"]');
    if (!ul) return;

    ul.innerHTML = html`
      <ul>
        ${this.state.notes
          .map(
            (note) =>
              html`<li>
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
      inputElement.addEventListener('change', async (e) => {
        const target = e.target as HTMLInputElement;
        const noteId = target.getAttribute('data-note-id')!;
        const newTitle = target.value;

        await notesStore.updateNote(noteId, { title: newTitle });
      });

      inputElement.addEventListener('focus', (e) => {
        const target = e.target as HTMLInputElement;

        // push history state to /:noteID
        const noteId = target.getAttribute('data-note-id')!;
        navigateTo(`/notes/${noteId}`);
      });
    });
  }

  setupEventListeners() {
    const newNoteButton = this.shadowRoot!.querySelector('#new-note')!;

    newNoteButton.addEventListener('click', async () => {
      await this.createNote();
    });

    notesStore.addEventListener(NOTE_EVENTS.NOTES_UPDATED, (event) => {
      this.state = { notes: event.detail.notes };
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
