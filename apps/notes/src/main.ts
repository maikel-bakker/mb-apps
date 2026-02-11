import { Editor, Sidebar, NotesList, Notes } from "components";
import { css, insertStyle } from "@mb/ui";
import { themeCSSVars, globalStyle } from "./styles";

insertStyle(css`
  :root {
    ${themeCSSVars}
  }
`);
insertStyle(css`
  html,
  body {
    margin: 0;
    padding: 0;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
      Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    font-size: 16px;
    background-color: var(--mb-c-background);
    color: var(--mb-c-foreground);
    height: 100%;
  }

  #app {
    height: 100%;
  }
`);
insertStyle(globalStyle);

customElements.define("mb-notes", Notes);
customElements.define("mb-editor", Editor);
customElements.define("mb-sidebar", Sidebar);
customElements.define("mb-notes-list", NotesList);
