import { kebabCaseToCamelCase } from "@mb/utils";
import { convertColorsToCSSVars, css } from "./css";
import { html } from "./html";

type ComponentOptions<Theme extends Record<string, any>> = {
  /** @deprecated use `sharedStyleSheet` instead */
  globalStyle?: string;
  theme?: Theme;
  sharedStyleSheet?: CSSStyleSheet;
};

export function createBaseComponent<Theme extends {}>(
  options?: ComponentOptions<Theme>,
) {
  const { globalStyle, theme = {} as Theme, sharedStyleSheet } = options || {};
  return class Component<
    T extends {},
    K extends {} = {},
    P extends {} = {},
  > extends HTMLElement {
    _state: T;
    theme: Theme;
    componentTheme?: K;
    propsList?: string[];

    constructor(
      initialState: T,
      shadowRootOptions: ShadowRootInit = { mode: "open" },
      componentThemeFn?: (theme: Theme) => K,
    ) {
      super();
      const shadowRoot = this.attachShadow(shadowRootOptions);
      if (sharedStyleSheet) {
        shadowRoot.adoptedStyleSheets = [sharedStyleSheet];
      }
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

    get props(): P | undefined {
      const el = this as Element & { _props?: P };
      return el._props;
    }

    async connectedCallback() {
      this.shadowRoot!.innerHTML = html`
        ${globalStyle &&
        `
          <style>
            ${globalStyle}
          </style>
        `}
        <slot name="component-root"></slot>
      `;
      this.render();
      await this.onMount?.();
    }

    render() {
      const componentRoot = this.shadowRoot!.querySelector(
        'slot[name="component-root"]',
      );
      if (!componentRoot) {
        throw new Error("Component root slot not found");
      }

      componentRoot.innerHTML = this.renderHTML();

      this.parseCustomProps(componentRoot);
    }

    /**
     * Parses custom properties defined by `customPropsList` and attaches it to the elements `_props` prop
     * This is used to bind functions to elements via attributes since there is no native way to pass
     * functions to web components via attributes
     */
    parseCustomProps(componentRoot: Element) {
      this.propsList?.forEach((prop) => {
        const elements = componentRoot.querySelectorAll(`[${prop}]`);

        elements.forEach((element) => {
          const el = element as Element & { _props?: P };

          const value = el.getAttribute(prop);
          if (!value) return;

          const methodName = value.match(
            /(?:async\s+)?([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/,
          )?.[1];
          if (!methodName) return;

          const handlerFunction = (this as any)[methodName].bind(this);
          const name = kebabCaseToCamelCase(prop.replace("data-", ""));

          if (el._props) {
            el._props = {
              ...el._props,
              [name]: handlerFunction,
            };
          } else {
            el._props = {
              [name]: handlerFunction,
            } as P;
          }
        });
      });
    }

    initComponentTheme(componentTheme: K, prefix: string) {
      const style = document.createElement("style");
      style.innerHTML = css`
        :host {
          ${convertColorsToCSSVars(componentTheme, `--mb-${prefix}`)}
        }
      `;
      this.shadowRoot!.prepend(style);
    }

    renderHTML(): string {
      throw new Error("Method 'renderHTML' must be implemented.");
    }
    onMount?(): Promise<void>;
    onStateChange?(state: T, newState: Partial<T>): Promise<void>;
  };
}
