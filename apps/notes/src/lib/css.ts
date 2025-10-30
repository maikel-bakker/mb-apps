import { camelCaseToKebabCase } from '../utils';

export function css(strings: TemplateStringsArray, ...values: any[]) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
}

export function insertStyle(
  styleContent: string,
  element: Document | ShadowRoot | HTMLElement = document.head,
) {
  const style = document.createElement('style');
  style.textContent = styleContent;
  element.appendChild(style);
}

export function hexToHsl(hex: string): [number, number, number] {
  // Remove the hash if present
  hex = hex.replace(/^#/, '');

  // Convert 3-char hex to 6-char hex
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((x) => x + x)
      .join('');
  }

  // Parse r, g, b values from the hex string
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  // Find min and max values from r, g, b
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

export function lighten(
  hsl: [number, number, number],
  percent: number,
): [number, number, number] {
  const [hue, saturation, lightness] = hsl;
  const newLightness = Math.min(lightness + percent, 100);
  return [hue, saturation, newLightness];
}

export function darken(
  hsl: [number, number, number],
  percent: number,
): [number, number, number] {
  const [hue, saturation, lightness] = hsl;
  const newLightness = Math.max(lightness - percent, 0);
  return [hue, saturation, newLightness];
}

export function hslToHex(hsl: [number, number, number]): string {
  let [h, s, l] = hsl;
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number): string => {
    // Round the numbers after adding m and scale to [0, 255]
    const hex = Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');
    return hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function convertColorsToCSSVars(
  colors: Record<string, any>,
  prefix = '--mb',
): string {
  const convert = (obj: Record<string, any>, path: string[]): string => {
    return Object.entries(obj)
      .map(([key, value]) => {
        const kebabKey = camelCaseToKebabCase(key);
        if (typeof value === 'object' && value !== null) {
          return convert(value, [...path, kebabKey]);
        } else {
          return `${path.concat(kebabKey).join('-')}: ${value};`;
        }
      })
      .join('\n');
  };

  return convert(colors, [prefix]);
}
