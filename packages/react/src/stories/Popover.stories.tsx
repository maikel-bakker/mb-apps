import { useRef } from "react";
import type { StoryObj, Meta } from "@storybook/react-vite";
import { placementOptions, type PlacementOptions } from "@mb/utils";
import "../popover.css";
import { usePopover } from "../hooks/use-popover";

type NativePopoverArgs = {
  placement: PlacementOptions;
};

const meta = {
  title: "Example/Popover",
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

export const Popover: Story = {
  render: (args) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const { isOpen, setIsOpen, popoverPosition } = usePopover({
      targetRef: buttonRef,
      popoverRef,
      preferredPlacement: args.placement,
    });

    return (
      <>
        <button ref={buttonRef} onClick={() => setIsOpen((prev) => !prev)}>
          Toggle the popover
        </button>
        {isOpen && (
          <div
            ref={popoverRef}
            className="popover"
            style={{
              top: popoverPosition ? `${popoverPosition.top}px` : undefined,
              left: popoverPosition ? `${popoverPosition.left}px` : undefined,
              visibility: popoverPosition ? "visible" : "hidden",
            }}
          >
            Popover content
          </div>
        )}
      </>
    );
  },
};

export const WithinContainer: Story = {
  render: (args) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isOpen, setIsOpen, popoverPosition } = usePopover({
      targetRef: buttonRef,
      popoverRef,
      containerRef,
      preferredPlacement: args.placement,
    });

    return (
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "500px",
          height: "500px",
          overflow: "auto",
          border: "1px solid black",
        }}
      >
        <button
          ref={buttonRef}
          onClick={() => setIsOpen((prev) => !prev)}
          style={{ marginTop: "350px" }}
        >
          Toggle the popover
        </button>
        {isOpen && (
          <div
            ref={popoverRef}
            className="popover"
            style={{
              top: popoverPosition ? `${popoverPosition.top}px` : undefined,
              left: popoverPosition ? `${popoverPosition.left}px` : undefined,
              visibility: popoverPosition ? "visible" : "hidden",
            }}
          >
            Popover content
          </div>
        )}
      </div>
    );
  },
};

export const WithinScrollContainer: Story = {
  render: (args) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isOpen, setIsOpen, popoverPosition } = usePopover({
      targetRef: buttonRef,
      popoverRef,
      containerRef,
      preferredPlacement: args.placement,
    });

    return (
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "500px",
          height: "500px",
          overflow: "auto",
          border: "1px solid black",
        }}
      >
        <div style={{ height: "1200px", position: "relative" }}>
          <button
            ref={buttonRef}
            onClick={() => setIsOpen((prev) => !prev)}
            style={{ marginTop: "350px" }}
          >
            Toggle the popover
          </button>
          {isOpen && (
            <div
              ref={popoverRef}
              className="popover"
              style={{
                top: popoverPosition ? `${popoverPosition.top}px` : undefined,
                left: popoverPosition ? `${popoverPosition.left}px` : undefined,
                visibility: popoverPosition ? "visible" : "hidden",
              }}
            >
              Popover content
            </div>
          )}
        </div>
      </div>
    );
  },
};
