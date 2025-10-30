import { css } from '../lib';

const global = css`
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

  * {
    box-sizing: border-box;
  }

  #app {
    display: grid;
    grid-template-columns: 200px 1fr;
    height: 100%;
  }
`;

export default global;
