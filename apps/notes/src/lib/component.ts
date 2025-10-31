import { html } from './html';
import { globalStyle, theme, type Theme } from 'styles';

type ComponentState = {};

abstract class Component<T extends ComponentState> extends HTMLElement {
  protected _state: T;
  protected theme: Theme;

  constructor(
    initialState: T,
    shadowRootOptions: ShadowRootInit = { mode: 'open' },
  ) {
    super();
    this.attachShadow(shadowRootOptions);
    this._state = initialState;
    this.theme = theme;
  }

  get state(): T {
    return this._state;
  }

  set state(newState: Partial<T>) {
    this._state = {
      ...this._state,
      ...newState,
    };
    this.onStateChange?.(this._state, newState).then(() => {});
  }

  async connectedCallback() {
    this.shadowRoot!.innerHTML = html`
      <style>
        ${globalStyle}
      </style>
      <slot name="component-root"></slot>
    `;
    this.render();
    await this.onMount?.();
  }

  private render() {
    const componentRoot = this.shadowRoot!.querySelector(
      'slot[name="component-root"]',
    );
    if (!componentRoot) {
      throw new Error('Component root slot not found');
    }

    componentRoot.innerHTML = this.renderHTML();
  }

  protected abstract renderHTML(): string;
  protected onMount?(): Promise<void>;
  protected onStateChange?(state: T, newState: Partial<T>): Promise<void>;
}

export default Component;
