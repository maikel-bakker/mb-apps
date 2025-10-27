import { marked } from 'marked';
import Component from '../lib/component';
import { html } from '../lib/html';
import VersionControl, { type Patch } from '../lib/version-control';

type EditorState = {
  notes: string;
  patches: Patch[];
};

marked.setOptions({
  breaks: true,
});

export default class Editor extends Component<EditorState> {
  private versionControl: VersionControl;

  constructor(initialNotes = '') {
    super({ notes: initialNotes, patches: [] });
    this.versionControl = new VersionControl(initialNotes);
  }

  queryInput() {
    return this.shadowRoot!.querySelector('textarea')!;
  }

  queryPreview() {
    return this.shadowRoot!.querySelector('article')!;
  }

  async onMount() {
    this.setupEventListeners();
  }

  renderHTML() {
    return html`
      <textarea></textarea>
      <article></article>
      <div class="toast"></div>
      <ul class="versions"></ul>

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
          background-color: #211c2b;
          color: #fff;
          border: none;
          font-size: 1em;
          resize: none;
        }

        textarea:focus-visible {
          outline: 2px solid;
          outline-offset: -2px;
          outline-color: #453a59;
          border: none;
        }

        textarea,
        article {
          padding: 1em;
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
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.1em;

          button {
            background: #191520;
            border: none;
            color: #fff;
            padding: 1em;
            cursor: pointer;
            outline: 1px solid transparent;
                          outline-offset: -1px;
            transition: outline-color 0.2s ease-in-out;

            &:hover {
              outline-color: #9e89ca;
          }
        }
      </style>
    `;
  }

  // @TODO: add method to remove event listeners on unmount
  setupEventListeners() {
    const textarea = this.queryInput();
    let debounceTimer: number;

    textarea.addEventListener('input', (event) => {
      const target = event.target as HTMLTextAreaElement;
      this.state = { notes: target.value };

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        this.saveNotes(target.value);
      }, 1000);
    });
  }

  saveNotes(notes: string) {
    this.versionControl.commitPatch(notes);
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
    const versionsList = this.shadowRoot!.querySelector('.versions');
    if (!versionsList) return;

    const patches = [...this.state.patches];

    versionsList.innerHTML = html`
      ${patches
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(
          (patch) => html`
            <li>
              <button data-patch-id="${patch.id}">
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

        this.state = { notes: version };
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

    if (newState.patches) {
      this.renderPatches();
    }
  }
}
