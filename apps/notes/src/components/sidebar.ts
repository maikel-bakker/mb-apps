import { Component, darkenHex, html } from 'lib';
import type { Note } from 'types';

type SidebarState = {
  notes: Note[];
};

type SidebarTheme = {
  background: string;
};

export default class Sidebar extends Component<SidebarState, SidebarTheme> {
  constructor(initialNotes: Note[] = []) {
    super({ notes: initialNotes });
  }

  async onMount() {
    this.initComponentTheme(
      {
        background: darkenHex(this.theme.c.background, 8),
      },
      'sidebar',
    );
  }

  protected renderHTML() {
    return html`
      <aside>
        <h1>Notes</h1>
        <slot></slot>
      </aside>
      <style>
        aside {
          background: var(--mb-sidebar-background);
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
