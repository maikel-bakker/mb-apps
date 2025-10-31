import { darken, hexToHsl, hslToHex } from 'lib';
import { pipe } from 'utils';
import type { Theme } from '../types';

const baseColors = {
  foreground: '#d4cdbb',
  background: '#272e33',
  hint: '#83c092',
};

const editor = {
  editorPreview: baseColors.background,
  editorForeground: baseColors.foreground,
  editorBackground: pipe(
    hexToHsl,
    (hsl: any) => darken(hsl, 3),
    hslToHex,
  )(baseColors.background),
  sidebarBackground: pipe(
    hexToHsl,
    (hsl: any) => darken(hsl, 8),
    hslToHex,
  )(baseColors.background),
};

export const forestTheme: Theme = {
  c: {
    ...baseColors,
    ...editor,
  },
};
