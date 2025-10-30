import { Editor, Sidebar, NotesList } from './components';
import { css, insertStyle } from './lib/css';
import { themeCSSVars, globalStyle } from './style';

insertStyle(css`
  :root {
    ${themeCSSVars}
  }
`);
insertStyle(globalStyle);

customElements.define('mb-editor', Editor);
customElements.define('mb-sidebar', Sidebar);
customElements.define('mb-notes-list', NotesList);
