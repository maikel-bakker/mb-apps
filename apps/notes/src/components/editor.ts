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

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot!.innerHTML = html`
      <textarea></textarea>
      <article></article>

      <style>
        :host * {
          box-sizing: border-box;
        }

        :host {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        textarea {
          width: 100%;
        }
      </style>
    `;
    this.setupEventListeners();
  }

  setupEventListeners() {
    const textarea = this.queryInput();
    textarea.addEventListener('input', (event) => {
      const target = event.target as HTMLTextAreaElement;
      this.state = { notes: target.value };
    });
  }

  protected async onStateChange() {
    const preview = this.queryPreview();
    preview.innerHTML = await marked(this.state.notes);
  }
}
