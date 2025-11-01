import { convertColorsToCSSVars, css, insertStyle } from './css';
import { html } from './html';
import { globalStyle, theme, type Theme } from 'styles';

type ComponentState = {};

abstract class Component<
  T extends ComponentState,
  K extends {} = {},
> extends HTMLElement {
  protected _state: T;
  protected theme: Theme;
  protected componentTheme?: K;

  constructor(
    initialState: T,
    shadowRootOptions: ShadowRootInit = { mode: 'open' },
    componentThemeFn?: (theme: Theme) => K,
  ) {
    super();
    this.attachShadow(shadowRootOptions);
    this._state = initialState;
    this.theme = theme;

    if (componentThemeFn) {
      this.componentTheme = componentThemeFn(this.theme);
    }
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

  protected initComponentTheme(componentTheme: K, prefix: string) {
    const style = document.createElement('style');
    style.innerHTML = css`
      :host {
        ${convertColorsToCSSVars(componentTheme, `--mb-${prefix}`)}
      }
    `;
    this.shadowRoot!.prepend(style);
  }

  protected abstract renderHTML(): string;
  protected onMount?(): Promise<void>;
  protected onStateChange?(state: T, newState: Partial<T>): Promise<void>;
}

export default Component;
