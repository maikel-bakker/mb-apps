declare global {
  interface HTMLElement {
    _customProps?: Record<string, any>;
  }
  interface Element {
    _customProps?: Record<string, any>;
  }
}

export {};
