import type { DeterminePositionProps } from "@mb/utils";
import { useCallback, useState, type ToggleEventHandler } from "react";
import { usePopoverPosition } from "./use-popover-position";
import { useRepositionOnResize } from "./use-reposition-on-resize";

type UsePopoverToggleProps = {
  targetRef: React.RefObject<HTMLElement | null>;
  popoverRef: React.RefObject<HTMLElement | null>;
  preferredPlacement?: DeterminePositionProps["preferredPlacement"];
};

export function usePopoverToggle({
  targetRef,
  popoverRef,
  preferredPlacement = "bottom-left",
}: UsePopoverToggleProps) {
  const [popoverPosition, setPopoverPosition] = useState<
    { top: number; left: number } | undefined
  >(undefined);

  const getPopoverPosition = usePopoverPosition({ preferredPlacement });

  const onPopoverToggle: ToggleEventHandler<HTMLElement> = useCallback(
    (e) => {
      if (!targetRef.current) return;
      popoverRef.current = e.currentTarget;

      if (e.newState === "open") {
        const { position } = getPopoverPosition(
          targetRef.current,
          e.currentTarget,
        );
        setPopoverPosition(position);
      } else {
        setPopoverPosition(undefined);
      }
    },
    [getPopoverPosition, targetRef, popoverRef],
  );

  const reposition = useCallback(() => {
    if (!targetRef.current || !popoverRef.current) return;
    setPopoverPosition(
      getPopoverPosition(targetRef.current, popoverRef.current).position,
    );
  }, [getPopoverPosition, targetRef, popoverRef]);

  useRepositionOnResize(reposition);

  return { popoverPosition, onPopoverToggle };
}
