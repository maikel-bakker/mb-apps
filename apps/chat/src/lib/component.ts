import { createBaseComponent } from "@mb/ui";
import sharedCss from "@mb/styles/styles.css?inline";

const sharedStyleSheet = new CSSStyleSheet();
sharedStyleSheet.replaceSync(sharedCss);

const Component = createBaseComponent({
  sharedStyleSheet,
});

export default Component;
