import { Component, html } from '../lib';
import type { Note } from '../types';

interface NotesListState {
  notes: Note[];
}

export default class NotesList extends Component<NotesListState> {
  constructor(initialNotes: Note[] = []) {
    super({ notes: initialNotes });
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
    this.renderNotes();
  }

  protected async onStateChange() {
    this.renderNotes();
  }

  renderNotes() {
    const ul = this.shadowRoot!.querySelector('slot[name="notes"]');
    if (!ul) return;

    ul.innerHTML = html`
      <ul>
        ${this.state.notes
          .map(
            (note) =>
              html`<li><input type="text" value="${note.title}" /></li>`,
          )
          .join('')}
      </ul>
    `;

    const input = ul.querySelectorAll('input');
    input.forEach((inputElement, index) => {
      inputElement.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        const updatedNotes = [...this.state.notes];
        updatedNotes[index] = {
          ...updatedNotes[index],
          title: target.value,
        };
      });
    });
  }

  setupEventListeners() {
    const newNoteButton = this.shadowRoot!.querySelector('#new-note')!;

    newNoteButton.addEventListener('click', () => {
      const newNote: Note = {
        id: crypto.randomUUID(),
        title: 'Untitled Note',
        initialVersion: '',
        patches: [],
      };
      this.state = { notes: [...this.state.notes, newNote] };
    });
  }

  createNote(title = 'Untitled Note') {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: title,
      initialVersion: `# ${title}`,
      patches: [],
    };
    this.state = { notes: [...this.state.notes, newNote] };
  }
}
