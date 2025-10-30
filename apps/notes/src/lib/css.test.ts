import { describe, expect, it } from 'vitest';
import { convertColorsToCSSVars, hexToHsl, hslToHex } from './css';

describe('hex/hsl conversion', () => {
  it('should convert hex to hsl and back to hex', () => {
    const color = '#d4cdba';
    const hsl = hexToHsl(color);
    const hex = hslToHex(hsl);

    expect(hex.toLowerCase()).toBe(color.toLowerCase());
  });
});

describe('convert colors to css variables', () => {
  it('should turn object to css variables', () => {
    const theme = {
      c: {
        foreground: '#d4cdbb',
        background: '#272e33',
        editorBackground: '#1a1a1a',
      },
    };

    const expected = [
      '--mb-c-foreground: #d4cdbb;',
      '--mb-c-background: #272e33;',
      '--mb-c-editor-background: #1a1a1a;',
    ].join('\n');

    const result = convertColorsToCSSVars(theme);
    expect(result).toBe(expected);
  });
});
