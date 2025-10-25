import { marked } from 'marked';
import Component from '../lib/component';
import { html } from '../lib/html';

type EditorState = {
  notes: string;
};

export default class Editor extends Component<EditorState> {
  constructor() {
    super({ notes: '' });
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
      </style>
    `;
  }

  setupEventListeners() {
    const textarea = this.queryInput();
    textarea.addEventListener('input', (event) => {
      const target = event.target as HTMLTextAreaElement;
      this.state = { notes: target.value };
    });
  }

  async onStateChange() {
    const preview = this.queryPreview();
    preview.innerHTML = await marked(this.state.notes);
  }
}
