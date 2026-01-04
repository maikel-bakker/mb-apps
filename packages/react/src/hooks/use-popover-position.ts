import { useCallback } from "react";
import { determinePosition, type DeterminePositionProps } from "@mb/utils";

export type UsePopoverPositionOptions = {
  /**
   * Where you prefer the popover to appear relative to the target.
   * Falls back to `"bottom-left"`.
   */
  preferredPlacement?: DeterminePositionProps["preferredPlacement"];
};

export type UsePopoverPositionResult = (
  targetEl: HTMLElement,
  popoverEl: HTMLElement,
  containerEl?: HTMLElement | null,
) => ReturnType<typeof determinePosition>;

/**
 * Returns a stable callback you can call to compute popover position for a given
 * target element and popover element.
 *
 * Designed for cases where you want to reposition as the target moves (e.g. dragging),
 * without coupling the hook to a specific popover "open/close" mechanism.
 */
export function usePopoverPosition({
  preferredPlacement = "bottom-left" as DeterminePositionProps["preferredPlacement"],
}: UsePopoverPositionOptions): UsePopoverPositionResult {
  return useCallback(
    (
      targetEl: HTMLElement,
      popoverEl: HTMLElement,
      containerEl?: HTMLElement | null,
    ) => {
      return determinePosition({
        targetEl,
        popoverEl,
        containerEl,
        preferredPlacement,
      });
    },
    [preferredPlacement],
  );
}
