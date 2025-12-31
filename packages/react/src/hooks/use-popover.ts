import type { DeterminePositionProps } from "@mb/utils";
import { useState, useEffect, useCallback } from "react";
import { useClickOutside } from "./use-click-outside";
import { usePopoverPosition } from "./use-popover-position";
import { useRepositionOnResize } from "./use-reposition-on-resize";

export type UsePopoverProps = {
  targetRef: React.RefObject<HTMLElement | null>;
  popoverRef: React.RefObject<HTMLElement | null>;
  containerRef?: React.RefObject<HTMLElement | null>;
  preferredPlacement?: DeterminePositionProps["preferredPlacement"];
};

export function usePopover({
  targetRef,
  popoverRef,
  containerRef,
  preferredPlacement,
}: UsePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<
    { top: number; left: number } | undefined
  >(undefined);

  const getPopoverPosition = usePopoverPosition({
    preferredPlacement,
  });

  useEffect(() => {
    if (isOpen && targetRef.current && popoverRef.current) {
      const { position } = getPopoverPosition(
        targetRef.current,
        popoverRef.current,
        containerRef?.current,
      );
      setPopoverPosition(position);
    } else {
      setPopoverPosition(undefined);
    }
  }, [isOpen, getPopoverPosition, targetRef, popoverRef, containerRef]);

  const reposition = useCallback(() => {
    if (!targetRef.current || !popoverRef.current) return;
    const { position } = getPopoverPosition(
      targetRef.current,
      popoverRef.current,
      containerRef?.current,
    );
    setPopoverPosition(position);
  }, [getPopoverPosition, targetRef, popoverRef, containerRef]);

  useRepositionOnResize(reposition);
  useClickOutside([popoverRef, targetRef], () => setIsOpen(false));

  return { isOpen, setIsOpen, popoverPosition };
}
