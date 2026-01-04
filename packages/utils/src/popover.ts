export const placementOptions = [
  "bottom-left",
  "bottom-right",
  "bottom-center",
  "top-left",
  "top-right",
  "top-center",
] as const;

export type PlacementOptions = (typeof placementOptions)[number];

type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type CalcPositionProps = {
  targetRect: DOMRect;
  popoverRect: DOMRect;
  placement: PlacementOptions;
};

export type DeterminePositionProps = {
  targetEl: HTMLElement;
  popoverEl: HTMLElement;
  containerEl?: HTMLElement | null;
  preferredPlacement: PlacementOptions;
};

export function determinePosition({
  targetEl,
  popoverEl,
  containerEl,
  preferredPlacement,
}: DeterminePositionProps) {
  let targetRect = targetEl.getBoundingClientRect();
  const popoverRect = popoverEl.getBoundingClientRect();
  const containerRect = containerEl?.getBoundingClientRect();

  // If we're positioning within a scrollable container, the target's `getBoundingClientRect()`
  // changes as you scroll, but the popover is positioned in the container's content
  // coordinate space (relative to its padding box). We need to add the container's scroll
  // offsets to map viewport coords -> container content coords.
  if (containerRect && containerEl) {
    const { scrollLeft, scrollTop } = getScrollOffsets(containerEl);

    targetRect = new DOMRect(
      targetRect.left - (containerRect.left ?? 0) + scrollLeft,
      targetRect.top - (containerRect.top ?? 0) + scrollTop,
      targetRect.width,
      targetRect.height,
    );
  }

  let placement = preferredPlacement;
  let position: Pick<Dimensions, "top" | "left"> = {
    top: 0,
    left: 0,
  };

  const { top: originalTop, left: originalLeft } = calcPosition({
    targetRect,
    popoverRect,
    placement,
  });

  position = { top: originalTop, left: originalLeft };

  const bounds =
    containerRect && containerEl
      ? getContainerBounds(containerEl, containerRect)
      : {
          minX: 0,
          minY: 0,
          maxX: window.innerWidth,
          maxY: window.innerHeight,
        };

  const { isOffScreen, offScreenSides } = checkIfOffScreen(
    {
      top: position.top,
      left: position.left,
      width: popoverRect.width,
      height: popoverRect.height,
    },
    bounds,
  );

  if (isOffScreen) {
    let newPlacement = placement.split("-");
    if (offScreenSides.top) {
      newPlacement[0] = "bottom";
    }

    if (offScreenSides.bottom) {
      newPlacement[0] = "top";
    }

    if (offScreenSides.left || offScreenSides.right) {
      const side = offScreenSides.left ? "left" : "right";
      newPlacement[1] = "center";
      placement = newPlacement.join("-") as PlacementOptions;

      const { top, left } = calcPosition({
        targetRect,
        popoverRect,
        placement,
      });

      const { offScreenSides: newOffScreenSides } = checkIfOffScreen(
        {
          top,
          left,
          width: popoverRect.width,
          height: popoverRect.height,
        },
        bounds,
      );

      if (newOffScreenSides[side]) {
        newPlacement[1] = side;
      }
    }

    placement = newPlacement.join("-") as PlacementOptions;

    const { top, left } = calcPosition({
      targetRect,
      popoverRect,
      placement,
    });

    position = { top, left };
  }

  const { isOffScreen: isFinalOffScreen } = checkIfOffScreen(
    {
      top: position.top,
      left: position.left,
      width: popoverRect.width,
      height: popoverRect.height,
    },
    bounds,
  );

  // If still off-screen, revert to preferred placement
  if (isFinalOffScreen) {
    placement = preferredPlacement;
    position = {
      top: originalTop,
      left: originalLeft,
    };
  }

  return { position, placement };
}

export function calcPosition({
  targetRect,
  popoverRect,
  placement = "bottom-left",
}: CalcPositionProps) {
  switch (placement) {
    case "top-left":
      return {
        top: targetRect.top - popoverRect.height,
        left: targetRect.left,
      };
    case "top-right":
      return {
        top: targetRect.top - popoverRect.height,
        left: targetRect.right - popoverRect.width,
      };
    case "top-center":
      return {
        top: targetRect.top - popoverRect.height,
        left: targetRect.left + targetRect.width / 2 - popoverRect.width / 2,
      };
    case "bottom-left":
      return {
        top: targetRect.bottom,
        left: targetRect.left,
      };
    case "bottom-right":
      return {
        top: targetRect.bottom,
        left: targetRect.right - popoverRect.width,
      };
    case "bottom-center":
      return {
        top: targetRect.bottom,
        left: targetRect.left + targetRect.width / 2 - popoverRect.width / 2,
      };
  }
}

type Dimensions = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function checkIfOffScreen(targetDimensions: Dimensions, bounds: Bounds) {
  const topEdge = targetDimensions.top;
  const leftEdge = targetDimensions.left;
  const bottomEdge = targetDimensions.top + targetDimensions.height;
  const rightEdge = targetDimensions.left + targetDimensions.width;

  const offScreenSides = {
    top: topEdge < bounds.minY,
    left: leftEdge < bounds.minX,
    bottom: bottomEdge > bounds.maxY,
    right: rightEdge > bounds.maxX,
  };

  return {
    isOffScreen: Object.values(offScreenSides).some((v) => v),
    offScreenSides,
  };
}

function getContainerBounds(
  containerEl: HTMLElement,
  containerRect: DOMRect,
): Bounds {
  const { scrollLeft, scrollTop } = getScrollOffsets(containerEl);

  // All popover/target positions in `determinePosition()` are calculated in the container's
  // *content* coordinate space (we add scroll offsets when mapping from viewport -> content).
  // So off-screen detection must use the container's *visible viewport* expressed in that same
  // content coordinate space:
  // - top-left of visible viewport: (scrollLeft, scrollTop)
  // - bottom-right: (scrollLeft + rect.width, scrollTop + rect.height)
  return {
    minX: scrollLeft,
    minY: scrollTop,
    maxX: scrollLeft + (containerRect.width ?? window.innerWidth),
    maxY: scrollTop + (containerRect.height ?? window.innerHeight),
  };
}

function getScrollOffsets(el: HTMLElement) {
  return {
    scrollLeft: el.scrollLeft ?? 0,
    scrollTop: el.scrollTop ?? 0,
  };
}
