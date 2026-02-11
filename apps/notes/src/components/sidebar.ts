import { darkenHex, html } from "@mb/ui";
import { Component } from "lib";
import type { Note } from "types";

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
      "sidebar",
    );
  }

  renderHTML() {
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
            margin: 0;
            padding: 0.75em;
            font-size: 1em;
          }
        }
      </style>
    `;
  }
}
