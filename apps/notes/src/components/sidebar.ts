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
          background: var(--mb-c-sidebar-background);
          height: 100%;

          h1 {
            margin-top: 0;
            font-size: 1em;
          }
        }
      </style>
    `;
  }
}
