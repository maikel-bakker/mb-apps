import { html } from "@mb/ui";
import { Component, getNoteId, navigateTo, VersionControl } from "lib";
import { notesStore, NOTE_EVENTS } from "stores";
import type { Note, Patch } from "types";
import { NOTES_LIST_ATTRIBUTES, NOTES_LIST_CUSTOM_PROPS } from "./notes-list";
import { EDITOR_ATTRIBUTES, EDITOR_CUSTOM_PROPS } from "./editor";

interface NotesState {
  notes: Note[];
  noteId?: string;
  noteVersion: string;
  patches: Patch[];
  patchId?: string;
}

export default class Notes extends Component<NotesState> {
  propsList = [
    ...Object.values(NOTES_LIST_CUSTOM_PROPS),
    ...Object.values(EDITOR_CUSTOM_PROPS),
  ];
  private versionControl: VersionControl;

  constructor() {
    super({ notes: [], noteVersion: "", patches: [] });
    this.versionControl = new VersionControl("");
  }

  renderHTML() {
    return html`
      <div class="notes">
        <mb-sidebar>
          <mb-notes-list
            ${NOTES_LIST_ATTRIBUTES.NOTES}="${JSON.stringify(this.state.notes)}"
            ${NOTES_LIST_ATTRIBUTES.NOTE_ID}="${this.state.noteId || ""}"
            ${NOTES_LIST_CUSTOM_PROPS.ON_NOTE_INPUT_CHANGE}="${this.updateNote}"
            ${NOTES_LIST_CUSTOM_PROPS.ON_NEW_NOTE_CLICK}="${this.createNote}"
            ${NOTES_LIST_CUSTOM_PROPS.ON_NOTE_DELETE_CLICK}="${this.deleteNote}"
            ${NOTES_LIST_CUSTOM_PROPS.ON_NOTE_FOCUS}="${this.navigateToNote}"
          ></mb-notes-list>
        </mb-sidebar>
        <mb-editor
          ${EDITOR_ATTRIBUTES.NOTE_ID}="${this.state.noteId || ""}"
          ${EDITOR_ATTRIBUTES.NOTE_VERSION}="${this.state.noteVersion}"
          ${EDITOR_ATTRIBUTES.PATCHES}="${JSON.stringify(this.state.patches)}"
          ${EDITOR_ATTRIBUTES.PATCH_ID}="${this.state.patchId || ""}"
          ${EDITOR_CUSTOM_PROPS.ON_NOTE_SAVE}="${this.saveNoteVersion}"
          ${EDITOR_CUSTOM_PROPS.ON_PATCH_SELECT}="${this.onPatchSelect}"
        ></mb-editor>
      </div>
      <style>
        .notes {
          display: grid;
          grid-template-columns: 200px 1fr;
          height: 100%;
        }
      </style>
    `;
  }

  async onStateChange(state: NotesState, newState: Partial<NotesState>) {
    this.setNotesListAttributes(state, newState);
    this.setEditorAttributes(state, newState);
    debugger;
  }

  private setNotesListAttributes(
    state: NotesState,
    newState: Partial<NotesState>,
  ) {
    const mbNotesList = this.shadowRoot?.querySelector("mb-notes-list");
    if (!mbNotesList) return;

    if (newState.notes) {
      mbNotesList.setAttribute(
        NOTES_LIST_ATTRIBUTES.NOTES,
        JSON.stringify(state.notes),
      );
    }

    if (newState.noteId) {
      mbNotesList.setAttribute(
        NOTES_LIST_ATTRIBUTES.NOTE_ID,
        state.noteId || "",
      );
    }
  }

  private setEditorAttributes(
    state: NotesState,
    newState: Partial<NotesState>,
  ) {
    const mbEditor = this.shadowRoot?.querySelector("mb-editor");
    if (!mbEditor) return;

    if (newState.noteId) {
      mbEditor.setAttribute(EDITOR_ATTRIBUTES.NOTE_ID, state.noteId || "");
    }

    if (newState.noteVersion) {
      mbEditor.setAttribute(EDITOR_ATTRIBUTES.NOTE_VERSION, state.noteVersion);
    }

    if (newState.patches) {
      mbEditor.setAttribute(
        EDITOR_ATTRIBUTES.PATCHES,
        JSON.stringify(state.patches),
      );
    }

    if (newState.patchId) {
      mbEditor.setAttribute(EDITOR_ATTRIBUTES.PATCH_ID, state.patchId || "");
    }
  }

  async onMount() {
    this.setupEventListeners();
    await this.loadNotes();
  }

  setupEventListeners() {
    notesStore.addEventListener(NOTE_EVENTS.NOTES_UPDATED, (event) => {
      const customEvent = event as CustomEvent<{ notes: Note[] }>;
      this.state = { notes: customEvent.detail.notes };
    });
  }

  async loadNotes() {
    const allNotes = await notesStore.getAllNotes();
    const notesArray = Object.values(allNotes);
    const note = await this.getInitialNote(notesArray);

    navigateTo(`/notes/${note.id}`);

    this.versionControl = new VersionControl(note.initialVersion, note.patches);

    this.state = {
      notes: notesArray,
      noteId: note.id,
      noteVersion: this.versionControl.getCurrentVersion(),
      patches: this.versionControl.allPatches,
      patchId: this.versionControl.allPatches.at(-1)?.id,
    };
  }

  private async getInitialNote(notes: Note[]) {
    let note: Note | undefined;
    const noteIdFromRouter = getNoteId();

    if (noteIdFromRouter) {
      note = notes.find((note) => note.id === noteIdFromRouter);
    }

    if (!note) {
      note = notes.at(0);
    }

    if (!note) {
      note = await this.createNote();
    }

    if (!note) {
      throw new Error("Unable to get initial note");
    }

    return note;
  }

  setNote(id: Note["id"]) {
    const note = this.state.notes.find((note) => note.id === id);
    if (!note) {
      throw new Error(`Note with id ${id} not found`);
    }

    this.versionControl = new VersionControl(note.initialVersion, note.patches);
    this.state = {
      noteId: id,
      noteVersion: this.versionControl.getCurrentVersion(),
      patches: this.versionControl.allPatches,
      patchId: this.versionControl.allPatches.at(-1)?.id,
    };
  }

  async updateNote(...args: Parameters<typeof notesStore.updateNote>) {
    await notesStore.updateNote(...args);
  }

  async createNote(title = "Untitled Note") {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: title,
      initialVersion: `# ${title}`,
      patches: [],
    };
    await notesStore.setNote(newNote.id, newNote);
    return newNote;
  }

  async deleteNote(...args: Parameters<typeof notesStore.deleteNote>) {
    await notesStore.deleteNote(...args);
    const firstNote = this.state.notes.at(0);
    if (firstNote) {
      this.navigateToNote(firstNote.id);
    }
  }

  navigateToNote(id: Note["id"]) {
    const noteIdFromRouter = getNoteId();
    if (id === noteIdFromRouter) return;

    this.setNote(id);

    navigateTo(`/notes/${id}`);
  }

  async saveNoteVersion(noteId: Note["id"], noteVersion: string) {
    this.versionControl.commitPatch(noteVersion);
    await this.updateNote(noteId, {
      patches: this.versionControl.allPatches,
    });

    this.state = {
      patches: this.versionControl.allPatches,
      patchId: this.versionControl.allPatches.at(-1)?.id,
    };
  }

  getNoteVersion(
    ...args: Parameters<typeof VersionControl.prototype.getVersion>
  ) {
    return this.versionControl.getVersion(...args);
  }

  onPatchSelect(patchId: Patch["id"]) {
    const version = this.versionControl.getVersion(patchId);
    this.state = { noteVersion: version, patchId };
  }
}
