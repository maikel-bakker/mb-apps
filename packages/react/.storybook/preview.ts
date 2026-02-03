import type { Preview } from "@storybook/react-vite";
import "../src/index.css";
import "@mb/styles/styles.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      codePanel: true,
      source: {
        type: "code",
      },
    },
  },
};

export default preview;
