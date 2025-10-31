import { Editor, Sidebar, NotesList } from './components';
import { css, insertStyle } from './lib/css';
import { themeCSSVars, globalStyle } from './styles';

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
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
      Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 16px;
    background-color: var(--mb-c-background);
    color: var(--mb-c-foreground);
    height: 100%;
  }

  #app {
    display: grid;
    grid-template-columns: 200px 1fr;
    height: 100%;
  }
`);
insertStyle(globalStyle);

customElements.define('mb-editor', Editor);
customElements.define('mb-sidebar', Sidebar);
customElements.define('mb-notes-list', NotesList);
