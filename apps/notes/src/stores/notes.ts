import type { Note } from '../types';
import localForage from 'localforage';

export const NOTE_EVENTS = {
  NOTE_ADDED: 'note::added',
  NOTE_REMOVED: 'note::removed',
  NOTE_UPDATED: 'note::updated',
  NOTES_UPDATED: 'notes::updated',
};

class NotesStore extends EventTarget {
  private db = localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: 'notes-app',
    storeName: 'notes_store',
  });
  private notes: Note[];

  constructor() {
    super();
    this.notes = [];
  }

  async setNote(id: string, note: Note) {
    return this.db.setItem(id, note).then(() => {
      this.dispatchEvent(
        new CustomEvent(NOTE_EVENTS.NOTE_ADDED, {
          detail: { id, value: note },
        }),
      );
      this.notes = [...this.notes, note];

      this.dispatchEvent(
        new CustomEvent(NOTE_EVENTS.NOTES_UPDATED, {
          detail: { notes: this.notes },
        }),
      );
    });
  }

  async getNote(id: string): Promise<Note | null> {
    return this.db.getItem<Note>(id);
  }

  async removeNote(id: string) {
    return this.db.removeItem(id).then(() => {
      this.dispatchEvent(new CustomEvent('note::removed', { detail: { id } }));
      this.dispatchEvent(
        new CustomEvent(NOTE_EVENTS.NOTES_UPDATED, {
          detail: { notes: this.notes },
        }),
      );
    });
  }

  async updateNote(id: string, updatedFields: Partial<Note>) {
    const existingNote = await this.getNote(id);
    if (!existingNote) {
      throw new Error(`Note with id ${id} does not exist.`);
    }
    const updatedNote = { ...existingNote, ...updatedFields };
    await this.db.setItem(id, updatedNote);

    this.notes = this.notes.map((note) =>
      note.id === id ? updatedNote : note,
    );

    this.dispatchEvent(
      new CustomEvent(NOTE_EVENTS.NOTE_UPDATED, {
        detail: { id, value: updatedNote },
      }),
    );
    this.dispatchEvent(
      new CustomEvent(NOTE_EVENTS.NOTES_UPDATED, {
        detail: { notes: this.notes },
      }),
    );
  }

  async getAllNotes(): Promise<{ [key: string]: Note }> {
    const notes: { [key: string]: Note } = {};
    await this.db.iterate<Note, void>((value, key) => {
      notes[key] = value;
    });
    this.notes = Object.values(notes);
    return notes;
  }
}

const notesStore = new NotesStore();

export default notesStore;
