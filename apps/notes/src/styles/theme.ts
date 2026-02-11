import { convertColorsToCSSVars } from "@mb/ui";
import { forestTheme } from "./themes";

export const theme = forestTheme;
export const themeCSSVars = convertColorsToCSSVars(theme);
export * from "./types";
