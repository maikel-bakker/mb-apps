type ComponentState = {};

abstract class Component<T extends ComponentState> extends HTMLElement {
  protected _state: T;

  constructor(
    initialState: T,
    shadowRootOptions: ShadowRootInit = { mode: 'open' },
  ) {
    super();
    this.attachShadow(shadowRootOptions);
    this._state = initialState;

    const globalStyle = document.createElement('style');
    globalStyle.textContent = `
      * {
        box-sizing: border-box;
      }
    `;
    this.shadowRoot!.appendChild(globalStyle);
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
    this.render();
    await this.onMount();
  }

  private render() {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.renderHTML();

    // Append each child of the temp div to the shadow root
    while (tempDiv.firstChild) {
      this.shadowRoot!.appendChild(tempDiv.firstChild);
    }
  }

  protected abstract renderHTML(): string;
  protected abstract onMount(): Promise<void>;
  protected abstract onStateChange?(
    state: T,
    newState: Partial<T>,
  ): Promise<void>;
}

export default Component;
