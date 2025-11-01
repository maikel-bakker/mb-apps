import { marked } from 'marked';
import Component from '../lib/component';
import { html } from '../lib/html';
import { darkenHex, getNoteId, VersionControl } from 'lib';
import type { Patch } from '../types';
import { notesStore } from '../stores';

type EditorState = {
  notes: string;
  noteId?: string;
  patches: Patch[];
  patchId?: string;
};

type EditorTheme = {
  previewBackground: string;
  previewForeground: string;
  textareaForeground: string;
  textareaBackground: string;
  textareaFocusBorder: string;
  historyItemBackground: string;
  historyItemHoverBackground: string;
  historyItemHoverBorderColor: string;
  historyItemSelectedBorderColor: string;
};

marked.setOptions({
  breaks: true,
});

export default class Editor extends Component<EditorState, EditorTheme> {
  private versionControl: VersionControl;

  constructor(initialNotes = '') {
    const noteId = getNoteId();
    super({ notes: initialNotes, patches: [], noteId });
    this.versionControl = new VersionControl(initialNotes);
  }

  queryInput() {
    return this.shadowRoot!.querySelector('textarea')!;
  }

  queryPreview() {
    return this.shadowRoot!.querySelector('article')!;
  }

  async onMount() {
    this.initComponentTheme(
      {
        previewBackground: this.theme.c.background,
        previewForeground: this.theme.c.foreground,
        textareaBackground: darkenHex(this.theme.c.background, 3),
        textareaForeground: this.theme.c.foreground,
        textareaFocusBorder: this.theme.c.focus,
        historyItemBackground: darkenHex(this.theme.c.background, 5),
        historyItemHoverBackground: darkenHex(this.theme.c.background, 1),
        historyItemHoverBorderColor: this.theme.c.focus,
        historyItemSelectedBorderColor: this.theme.c.secondary,
      },
      'editor',
    );
    this.setupEventListeners();
    await this.loadNote();
  }

  async loadNote() {
    let noteId = this.state.noteId;

    if (!noteId) {
      noteId = getNoteId();

      if (!noteId) {
        throw new Error('No noteId found in URL');
      }

      this.state = { noteId };
    }

    const note = await notesStore.getNote(noteId);

    if (!note) {
      throw new Error(`Note with id ${noteId} not found`);
    }

    this.versionControl = new VersionControl(note.initialVersion, note.patches);

    this.state = {
      notes: this.versionControl.getCurrentVersion(),
      patches: this.versionControl.allPatches,
      patchId: this.versionControl.allPatches.at(-1)?.id,
    };
  }

  renderHTML() {
    return html`
      <textarea></textarea>
      <article></article>
      <div class="toast"></div>
      <div class="versions">
        <ul></ul>
        <button class="secondary">History</button>
      </div>

      <style>
        :host {
          display: grid;
          grid-template-columns: 1fr 1fr;
          height: 100%;
          max-height: 100vh;
        }

        textarea {
          width: 100%;
          height: 100%;
          background-color: var(--mb-editor-textarea-background);
          color: var(--mb-editor-textarea-foreground);
          border: none;
          font-size: 1em;
          resize: none;
          outline: 2px solid transparent;
          outline-offset: -2px;
          transition: outline-color 0.1s ease;
        }

        textarea:focus-visible {
          outline-color: var(--mb-editor-textarea-focus-border);
        }

        textarea,
        article {
          padding: 1em;
        }

        article {
          background-color: var(--mb-editor-preview-background);
        }

        article * {
          margin-top: 0;
        }

        .toast {
          display: 'inline-flex';
          background: #191520;
          color: #fff;
          border: none;
          top: 0.75rem;
          right: 1rem;
          position: fixed;
          display: inline-flex;
          padding: 0.5em;
          opacity: 0;
          transform: translateY(-20px);
          transition: opacity 0.3s ease-in-out;

          &.show {
            display: inline-flex;
            opacity: 1;
          }
        }

        .versions {
          position: absolute;
          bottom: 1em;
          right: 1em;

          button {
            width: 100%;
          }

          ul {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: 0.1em;
            max-height: 0;
            overflow-y: hidden;
            transition:
              max-height 0.2s ease,
              opacity 0.2s ease;
            opacity: 0;
          }

          ul.show {
            max-height: 30vh;
            overflow-y: auto;
            opacity: 1;
          }

          li button {
            background: var(--mb-editor-history-item-background);
            border: none;
            color: #fff;
            cursor: pointer;
            outline: 1px solid transparent;
            outline-offset: -1px;
            transition:
              outline-color 0.2s ease,
              background 0.2s ease;

            &:hover {
              background: var(--mb-editor-history-item-background-hover);
              outline-color: var(--mb-editor-history-item-hover-border-color);
            }

            &[aria-pressed='true'] {
              outline-color: var(
                --mb-editor-history-item-selected-border-color
              );
            }
          }
        }
      </style>
    `;
  }

  // @TODO: add method to remove event listeners on unmount
  setupEventListeners() {
    console.log('test');
    this.setupEditor();

    // listen for history changes and get noteId from /notes/:noteId
    window.addEventListener('popstate', async () => {
      const noteId = getNoteId();
      if (!noteId) return;

      this.state = { noteId };
    });
  }

  setupEditor() {
    const textarea = this.queryInput();
    let debounceTimer: NodeJS.Timeout;

    textarea.addEventListener('input', (event) => {
      const target = event.target as HTMLTextAreaElement;
      this.state = { notes: target.value };

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(async () => {
        await this.saveNotes(target.value);
      }, 1000);
    });
  }

  async saveNotes(notes: string) {
    this.versionControl.commitPatch(notes);
    await notesStore.updateNote(this.state.noteId!, {
      patches: this.versionControl.allPatches,
    });
    this.state = { patches: this.versionControl.allPatches };
    this.showToast('Notes saved');
  }

  showToast(message: string) {
    const toast = this.shadowRoot!.querySelector('.toast')!;
    toast.innerHTML = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      toast.innerHTML = '';
    }, 1500);
  }

  renderPatches() {
    const versionsList = this.shadowRoot!.querySelector('.versions > ul');
    if (!versionsList) return;
    const historyButton = this.shadowRoot!.querySelector('.versions > button');
    if (!historyButton) return;

    historyButton.addEventListener('click', () => {
      versionsList.classList.toggle('show');
    });

    const patches = [...this.state.patches];

    versionsList.innerHTML = html`
      ${patches
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(
          (patch) => html`
            <li>
              <button
                data-patch-id="${patch.id}"
                aria-pressed="${this.state.patchId === patch.id}"
              >
                ${new Date(patch.date).toLocaleString()}
              </button>
            </li>
          `,
        )
        .join('')}
    `;

    versionsList.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', () => {
        const patchId = button.getAttribute('data-patch-id')!;
        const version = this.versionControl.getVersion(patchId);

        this.state = { notes: version, patchId };
        this.queryInput().value = version;
        this.showToast(
          `Switched to version from ${new Date(
            this.state.patches.find((p) => p.id === patchId)!.date,
          ).toLocaleString()}`,
        );
      });
    });
  }

  async onStateChange(_: EditorState, newState: Partial<EditorState>) {
    const preview = this.queryPreview();
    preview.innerHTML = await marked(this.state.notes);

    if (newState.patches || newState.patchId) {
      this.renderPatches();
    }

    if (newState.noteId) {
      await this.loadNote();
    }

    if (newState.notes) {
      this.queryInput().value = this.state.notes;
    }
  }
}
