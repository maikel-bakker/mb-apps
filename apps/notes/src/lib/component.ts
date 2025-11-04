import { kebabCaseToCamelCase } from 'utils';
import { convertColorsToCSSVars, css } from './css';
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
  protected customPropsList?: string[];

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

    this.parseCustomProps(componentRoot);
  }

  /**
   * Parses custom properties defined by `customPropsList` and attaches it to the elements `_customProps` prop
   * This is used to bind functions to elements via attributes since there is no native way to pass
   * functions to web components via attributes
   */
  private parseCustomProps(componentRoot: Element) {
    this.customPropsList?.forEach((prop) => {
      const elements = componentRoot.querySelectorAll(`[${prop}]`);

      elements.forEach((element) => {
        const value = element.getAttribute(prop);
        if (!value) return;

        const methodName = value.match(
          /(?:async\s+)?([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/,
        )?.[1];
        if (!methodName) return;

        const handlerFunction = (this as any)[methodName].bind(this);
        const name = kebabCaseToCamelCase(prop.replace('data-', ''));

        if (element._customProps) {
          element._customProps = {
            ...element._customProps,
            [name]: handlerFunction,
          };
        } else {
          element._customProps = {
            [name]: handlerFunction,
          };
        }
      });
    });
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
