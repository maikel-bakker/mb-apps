import { css } from "@mb/ui";

const global = css`
  * {
    box-sizing: border-box;
  }

  button,
  .button {
    cursor: pointer;
    background: var(--mb-c-hint);
    border: none;
    padding: 0.5em 0.75em;
    transition: background 0.2s ease;

    &:hover {
      background: var(--mb-c-hint-hover);
    }

    &.secondary {
      background: var(--mb-c-secondary);

      &:hover {
        background: var(--mb-c-secondary-hover);
      }
    }
  }
`;

export default global;
