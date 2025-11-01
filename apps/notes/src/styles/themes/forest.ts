import { darkenHex } from 'lib';
import type { Theme } from '../types';

const baseColors = {
  foreground: '#d4cdbb',
  background: '#272e33',
  hint: '#83c092',
  hintHover: darkenHex('#83c092', 5),
  secondary: '#eeb275',
  secondaryHover: darkenHex('#eeb275', 5),
  focus: '#d4cdbb',
};

export const forestTheme: Theme = {
  c: baseColors,
};
