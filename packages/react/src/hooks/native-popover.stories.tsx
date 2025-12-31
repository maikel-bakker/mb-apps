import type { StoryObj, Meta } from "@storybook/react-vite";
import { useRef, useState, useCallback } from "react";
import { placementOptions, type PlacementOptions } from "@mb/utils";
import { usePopoverToggle } from "./use-popover-toggle";
import { usePopoverPosition } from "./use-popover-position";
import { useDraggable } from "./use-draggable";
import "../popover.css";

type NativePopoverArgs = {
  placement: PlacementOptions;
};

const meta = {
  title: "Hooks/Native Popover",
  args: {
    placement: "bottom-left" as PlacementOptions,
  },
  argTypes: {
    placement: {
      control: { type: "select" },
      options: placementOptions,
    },
  },
  tags: ["autodocs"],
} satisfies Meta<NativePopoverArgs>;

export default meta;
type Story = StoryObj<NativePopoverArgs>;

export const NativePopover: Story = {
  render: (args) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const { popoverPosition, onPopoverToggle } = usePopoverToggle({
      targetRef: buttonRef,
      popoverRef: popoverRef,
      preferredPlacement: args.placement,
    });

    return (
      <>
        <button popoverTarget="native-popover" ref={buttonRef}>
          Toggle the popover
        </button>
        <div
          id="native-popover"
          popover=""
          onToggle={onPopoverToggle}
          style={{
            top: popoverPosition ? `${popoverPosition.top}px` : undefined,
            left: popoverPosition ? `${popoverPosition.left}px` : undefined,
            visibility: popoverPosition ? "visible" : "hidden",
          }}
        >
          Popover content
        </div>
      </>
    );
  },
};

export const Draggable: Story = {
  render: (args) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [popoverPosition, setPopoverPosition] = useState<{
      top: number;
      left: number;
    } | null>(null);
    const getPopoverPosition = usePopoverPosition({
      preferredPlacement: args.placement,
    });

    const { style, handlers, didDrag } = useDraggable();

    const determinePopoverPosition = useCallback(
      (popoverEl: HTMLElement) => {
        if (buttonRef.current) {
          const { position } = getPopoverPosition(buttonRef.current, popoverEl);
          setPopoverPosition(position);
        }
      },
      [getPopoverPosition, buttonRef],
    );

    return (
      <>
        <button
          popoverTarget="draggable-popover"
          ref={buttonRef}
          style={style}
          onPointerDown={handlers.onPointerDown}
          onPointerMove={(e) => {
            handlers.onPointerMove(e);
            if (popoverRef.current)
              determinePopoverPosition(popoverRef.current);
          }}
          onPointerUp={handlers.onPointerUp}
          onPointerCancel={handlers.onPointerCancel}
          onClickCapture={(e) => {
            if (didDrag) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          Toggle the popover
        </button>

        <div
          ref={popoverRef}
          id="draggable-popover"
          popover=""
          onToggle={(e) => {
            determinePopoverPosition(e.currentTarget);
          }}
          style={{
            top: popoverPosition ? `${popoverPosition.top}px` : undefined,
            left: popoverPosition ? `${popoverPosition.left}px` : undefined,
          }}
        >
          Popover content
        </div>
      </>
    );
  },
};
