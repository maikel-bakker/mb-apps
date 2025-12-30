import { useEffect } from "react";

export type UseRepositionOnResizeOptions = {
  /**
   * Repositions using `window.resize`. Defaults to true.
   */
  enabled?: boolean;

  /**
   * If true, also listens to `visualViewport.resize` when available.
   * This helps on mobile where the visual viewport changes due to zoom / on-screen keyboard.
   *
   * Defaults to true.
   */
  useVisualViewport?: boolean;
};

/**
 * Re-run a reposition callback when the viewport size changes.
 *
 * Typical usage is to pass a callback that:
 * - checks refs (target/popover)
 * - calls your positioning function
 * - updates state with the new `{top,left}` (or equivalent)
 *
 * Keep the callback stable (e.g. `useCallback`) so the listener
 * doesn't churn on every render.
 */
export function useRepositionOnResize(
  reposition: () => void,
  options: UseRepositionOnResizeOptions = {},
) {
  const { enabled = true, useVisualViewport = true } = options;

  useEffect(() => {
    if (!enabled) return;

    // Ensure we only run at most once per frame even if resize fires rapidly.
    let raf = 0;

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        reposition();
      });
    };

    window.addEventListener("resize", schedule);

    const vv = useVisualViewport ? window.visualViewport : null;
    vv?.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("resize", schedule);
      vv?.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [enabled, reposition, useVisualViewport]);
}
