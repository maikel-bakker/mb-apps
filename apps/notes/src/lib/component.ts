type ComponentState = {};

abstract class Component<T extends ComponentState> extends HTMLElement {
  protected _state: T;

  constructor(initialState: T, shadowRootOptions: ShadowRootInit = { mode: "open" }) {
    super();
    this.attachShadow(shadowRootOptions);
    this._state = initialState;
  }

  get state(): T {
    return this._state;
  }

  set state(newState: T) {
    this._state = {
      ...this._state,
      ...newState,
    };
    this.onStateChange?.(this._state).then(() => {});
  }

  protected abstract onStateChange?(state: T): Promise<void>;
}

export default Component;
