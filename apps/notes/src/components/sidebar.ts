import { Component } from '../lib';
import { html } from '../lib/html';
import type { Note } from '../types';

type SidebarState = {
  notes: Note[];
};

export default class Sidebar extends Component<SidebarState> {
  constructor(initialNotes: Note[] = []) {
    super({ notes: initialNotes });
  }

  protected renderHTML() {
    return html`
      <aside>
        <h1>Notes</h1>
        <slot></slot>
      </aside>
      <style>
        aside {
          background: #15121c;
          height: 100%;
          padding: 0.75em;

          h1 {
            margin-top: 0;
            font-size: 1em;
          }
        }
      </style>
    `;
  }
}
