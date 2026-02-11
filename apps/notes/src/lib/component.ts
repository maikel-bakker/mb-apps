import { createBaseComponent } from "@mb/ui";

import { globalStyle, theme, type Theme } from "styles";

const Component = createBaseComponent<Theme>({
  globalStyle,
  theme,
});

export default Component;
