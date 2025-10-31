import { convertColorsToCSSVars } from 'lib';
import { catpuccinTheme, forestTheme } from './themes';

export const theme = forestTheme;
export const themeCSSVars = convertColorsToCSSVars(theme);
export * from './types';
