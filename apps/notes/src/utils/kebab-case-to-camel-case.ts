export function kebabCaseToCamelCase(input: string): string {
  return input.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase());
}
