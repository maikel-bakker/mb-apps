import type { DeterminePositionProps } from "@mb/utils";
import { useState, useEffect, useCallback } from "react";
import { useClickOutside } from "./use-click-outside";
import { usePopoverPosition } from "./use-popover-position";
import { useRepositionOnResize } from "./use-reposition-on-resize";

type UsePopoverProps = {
  targetRef: React.RefObject<HTMLElement | null>;
  popoverRef: React.RefObject<HTMLElement | null>;
  containerRef?: React.RefObject<HTMLElement | null>;
  preferredPlacement?: DeterminePositionProps["preferredPlacement"];
};

export function usePopover({
  targetRef: buttonRef,
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
    if (isOpen && buttonRef.current && popoverRef.current) {
      const { position } = getPopoverPosition(
        buttonRef.current,
        popoverRef.current,
        containerRef?.current,
      );
      setPopoverPosition(position);
    } else {
      setPopoverPosition(undefined);
    }
  }, [isOpen, getPopoverPosition, buttonRef, popoverRef]);

  const reposition = useCallback(() => {
    if (!buttonRef.current || !popoverRef.current) return;
    setPopoverPosition(
      getPopoverPosition(buttonRef.current, popoverRef.current).position,
    );
  }, [getPopoverPosition, buttonRef, popoverRef, containerRef]);

  useRepositionOnResize(reposition);
  useClickOutside([popoverRef, buttonRef], () => setIsOpen(false));

  return { isOpen, setIsOpen, popoverPosition };
}
