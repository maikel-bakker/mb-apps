import { describe, it, expect } from "vitest";
import { determinePosition, PlacementOptions } from "./popover";

describe("determinePosition", () => {
  it("should return position for preferred placement", () => {
    const targetEl = createElement({
      top: 100,
      left: 100,
      bottom: 150,
      width: 50,
      height: 50,
    });
    const popoverEl = createElement({
      width: 100,
      height: 100,
    });
    const containerEl = createElement({
      top: 0,
      left: 0,
      width: 500,
      height: 500,
    });
    const preferredPlacement = "bottom-left";

    const result = determinePosition({
      targetEl,
      popoverEl,
      containerEl,
      preferredPlacement,
    });

    expect(result.placement).toBe("bottom-left");
    expect(result.position).toEqual({ top: 150, left: 100 });
  });

  it("should return position within container bounds", () => {
    const targetEl = createElement({
      top: 450,
      left: 450,
      bottom: 500,
      width: 50,
      height: 50,
    });
    const popoverEl = createElement({
      width: 100,
      height: 100,
    });
    const containerEl = createElement({
      top: 10,
      left: 10,
      width: 500,
      height: 500,
    });
    const preferredPlacement = "bottom-right";

    const result = determinePosition({
      targetEl,
      popoverEl,
      containerEl,
      preferredPlacement,
    });

    expect(result.placement).toBe("top-right");
    expect(result.position).toEqual({ top: 340, left: 390 });
  });

  it("should return position within container bounds and scroll position", () => {
    const targetEl = createElement(
      {
        top: 450,
        left: 450,
        bottom: 500,
        width: 50,
        height: 50,
      },
      0,
      100,
    );
    const popoverEl = createElement({
      width: 100,
      height: 100,
    });
    const containerEl = createElement(
      {
        top: 10,
        left: 10,
        width: 500,
        height: 500,
      },
      50,
      100,
    );
    const preferredPlacement = "bottom-right";

    const result = determinePosition({
      targetEl,
      popoverEl,
      containerEl,
      preferredPlacement,
    });

    expect(result.placement).toBe("top-right");
    expect(result.position).toEqual({ top: 440, left: 440 });
  });
});

describe.each([
  {
    description: "determinePosition - 'top-left' off screen adjustment",
    testCases: [
      {
        preferredPlacement: "top-left",
        expectedPlacement: "top-right",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 950,
          left: 900,
          right: 950,
          bottom: 1000,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 850, left: 750 },
      },
      {
        preferredPlacement: "top-left",
        expectedPlacement: "top-center",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 150,
          left: 810,
          bottom: 100,
          width: 150,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 50, left: 785 },
      },
      {
        preferredPlacement: "top-left",
        expectedPlacement: "bottom-left",
        popoverRect: { width: 200, height: 100 },
        targetRect: { top: 50, left: 50, bottom: 100, width: 50, height: 50 },
        containerDimensions: { width: 500, height: 500 },
        expectedPosition: { top: 100, left: 50 },
      },
      {
        preferredPlacement: "top-left",
        expectedPlacement: "bottom-center",
        popoverRect: { width: 200, height: 100 },
        targetRect: { top: 50, left: 810, bottom: 100, width: 150, height: 50 },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 100, left: 785 },
      },
      {
        preferredPlacement: "top-left",
        expectedPlacement: "bottom-right",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 50,
          left: 900,
          right: 950,
          bottom: 100,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 100, left: 750 },
      },
    ],
  },
  {
    description: "determinePosition - 'top-center' off screen adjustment",
    testCases: [
      {
        preferredPlacement: "top-center",
        expectedPlacement: "top-left",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 950,
          left: 0,
          right: 50,
          bottom: 1000,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 850, left: 0 },
      },
      {
        preferredPlacement: "top-center",
        expectedPlacement: "top-right",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 950,
          left: 950,
          right: 1000,
          bottom: 1000,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 850, left: 800 },
      },
      {
        preferredPlacement: "top-center",
        expectedPlacement: "bottom-left",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 50,
          left: 0,
          right: 50,
          bottom: 100,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 100, left: 0 },
      },
      {
        preferredPlacement: "top-center",
        expectedPlacement: "bottom-center",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 50,
          left: 200,
          right: 250,
          bottom: 100,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 100, left: 125 },
      },
      {
        preferredPlacement: "top-center",
        expectedPlacement: "bottom-right",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 50,
          left: 950,
          right: 1000,
          bottom: 100,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 100, left: 800 },
      },
    ],
  },
  {
    description: "determinePosition - 'top-right' off screen adjustment",
    testCases: [
      {
        preferredPlacement: "top-right",
        expectedPlacement: "top-left",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 950,
          left: 50,
          right: 100,
          bottom: 1000,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 850, left: 50 },
      },
      {
        preferredPlacement: "top-right",
        expectedPlacement: "top-center",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 150,
          left: 40,
          right: 190,
          bottom: 100,
          width: 150,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 50, left: 15 },
      },
      {
        preferredPlacement: "top-right",
        expectedPlacement: "bottom-right",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 50,
          left: 450,
          right: 500,
          bottom: 100,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 500, height: 500 },
        expectedPosition: { top: 100, left: 300 },
      },
      {
        preferredPlacement: "top-right",
        expectedPlacement: "bottom-center",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 50,
          left: 40,
          right: 190,
          bottom: 100,
          width: 150,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 100, left: 15 },
      },
      {
        preferredPlacement: "top-right",
        expectedPlacement: "bottom-left",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 50,
          left: 50,
          right: 100,
          bottom: 100,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 100, left: 50 },
      },
    ],
  },
  {
    description: "determinePosition - 'bottom-left' off screen adjustment",
    testCases: [
      {
        preferredPlacement: "bottom-left",
        expectedPlacement: "top-left",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 450,
          left: 50,
          right: 100,
          bottom: 500,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 500, height: 500 },
        expectedPosition: { top: 350, left: 50 },
      },
      {
        preferredPlacement: "bottom-left",
        expectedPlacement: "top-right",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 950,
          left: 950,
          right: 1000,
          bottom: 1000,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 850, left: 800 },
      },
      {
        preferredPlacement: "bottom-left",
        expectedPlacement: "bottom-right",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 150,
          left: 950,
          right: 1000,
          bottom: 200,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 200, left: 800 },
      },
    ],
  },
  {
    description: "determinePosition - 'bottom-center' off screen adjustment",
    testCases: [
      {
        preferredPlacement: "bottom-center",
        expectedPlacement: "top-center",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 450,
          left: 200,
          right: 250,
          bottom: 500,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 500, height: 500 },
        expectedPosition: { top: 350, left: 125 },
      },
      {
        preferredPlacement: "bottom-center",
        expectedPlacement: "bottom-left",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 150,
          left: 0,
          right: 50,
          bottom: 200,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 200, left: 0 },
      },
      {
        preferredPlacement: "bottom-center",
        expectedPlacement: "bottom-right",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 150,
          left: 950,
          right: 1000,
          bottom: 200,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 200, left: 800 },
      },
      {
        preferredPlacement: "bottom-center",
        expectedPlacement: "top-left",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 950,
          left: 0,
          right: 50,
          bottom: 1000,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 850, left: 0 },
      },
      {
        preferredPlacement: "bottom-center",
        expectedPlacement: "top-right",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 950,
          left: 950,
          right: 1000,
          bottom: 1000,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 850, left: 800 },
      },
    ],
  },
  {
    description: "determinePosition - 'bottom-right' off screen adjustment",
    testCases: [
      {
        preferredPlacement: "bottom-right",
        expectedPlacement: "top-right",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 450,
          left: 400,
          right: 450,
          bottom: 500,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 500, height: 500 },
        expectedPosition: { top: 350, left: 250 },
      },
      {
        preferredPlacement: "bottom-right",
        expectedPlacement: "bottom-left",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 150,
          left: 0,
          right: 50,
          bottom: 200,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 200, left: 0 },
      },
      {
        preferredPlacement: "bottom-right",
        expectedPlacement: "top-left",
        popoverRect: { width: 200, height: 100 },
        targetRect: {
          top: 950,
          left: 0,
          right: 50,
          bottom: 1000,
          width: 50,
          height: 50,
        },
        containerDimensions: { width: 1000, height: 1000 },
        expectedPosition: { top: 850, left: 0 },
      },
    ],
  },
])("$description", ({ testCases }) => {
  it.each(testCases)(
    "should adjust placement to $expectedPlacement if $preferredPlacement is off-screen",
    ({
      preferredPlacement,
      expectedPlacement,
      expectedPosition,
      targetRect,
      popoverRect,
      containerDimensions,
    }) => {
      const popoverEl = createElement(popoverRect);
      const targetEl = createElement(targetRect);
      const containerEl = createElement({
        width: containerDimensions.width,
        height: containerDimensions.height,
      });

      const result = determinePosition({
        targetEl,
        popoverEl,
        containerEl,
        preferredPlacement: preferredPlacement as PlacementOptions,
      });

      expect(result.placement).toBe(expectedPlacement);
      expect(result.position).toEqual(expectedPosition);
    },
  );
});

function createElement(
  rect: Partial<DOMRect>,
  scrollLeft = 0,
  scrollTop = 0,
): HTMLElement {
  return {
    getBoundingClientRect: () => ({
      top: rect.top ?? 0,
      left: rect.left ?? 0,
      bottom: rect.bottom ?? 0,
      right: rect.right ?? 0,
      width: rect.width ?? 0,
      height: rect.height ?? 0,
    }),
    scrollLeft,
    scrollTop,
  } as HTMLElement;
}
