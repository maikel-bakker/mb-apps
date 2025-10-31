import { darken, hexToHsl, hslToHex } from 'lib';
import { pipe } from 'utils';
import type { Theme } from '../types';

const baseColors = {
  foreground: '#ffffff',
  background: '#272231',
};

const editor = {
  editorPreview: baseColors.background,
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

export const catpuccinTheme: Theme = {
  c: {
    ...baseColors,
    ...editor,
  },
};
