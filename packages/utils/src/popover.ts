export const placementOptions = [
  "bottom-left",
  "bottom-right",
  "bottom-center",
  "top-left",
  "top-right",
  "top-center",
] as const;

export type PlacementOptions = (typeof placementOptions)[number];

type CalcPositionProps = {
  targetRect: DOMRect;
  popoverRect: DOMRect;
  placement: PlacementOptions;
};

export type DeterminePositionProps = {
  targetEl: HTMLElement;
  popoverEl: HTMLElement;
  containerDimensions: Pick<Dimensions, "width" | "height">;
  preferredPlacement: PlacementOptions;
};

export function determinePosition({
  targetEl,
  popoverEl,
  containerDimensions,
  preferredPlacement,
}: DeterminePositionProps) {
  const targetRect = targetEl.getBoundingClientRect();
  const popoverRect = popoverEl.getBoundingClientRect();

  let placement = preferredPlacement;
  let position: Pick<Dimensions, "top" | "left"> = {
    top: 0,
    left: 0,
  };

  const { top, left } = calcPosition({
    targetRect,
    popoverRect,
    placement,
  });

  position = { top, left };

  const { isOffScreen, offScreenSides } = checkIfOffScreen(
    {
      top: position.top,
      left: position.left,
      width: popoverRect.width,
      height: popoverRect.height,
    },
    containerDimensions,
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
        containerDimensions,
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

export function checkIfOffScreen(
  targetDimensions: Dimensions,
  containerDimensions: Pick<Dimensions, "width" | "height">,
) {
  const offScreenSides = {
    top: targetDimensions.top < 0,
    left: targetDimensions.left < 0,
    bottom:
      targetDimensions.top + targetDimensions.height >
      containerDimensions.height,
    right:
      targetDimensions.left + targetDimensions.width >
      containerDimensions.width,
  };

  return {
    isOffScreen: Object.values(offScreenSides).some((v) => v),
    offScreenSides,
  };
}
