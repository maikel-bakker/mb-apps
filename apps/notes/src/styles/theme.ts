import { convertColorsToCSSVars } from 'lib';
import { forestTheme } from './themes';

export const theme = forestTheme;
export const themeCSSVars = convertColorsToCSSVars(theme);
export * from './types';
