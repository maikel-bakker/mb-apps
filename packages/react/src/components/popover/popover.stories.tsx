import { useRef } from "react";
import type { StoryObj, Meta } from "@storybook/react-vite";
import { Popover } from "./popover";
import "../../popover.css";

const meta = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GeneralImplementation: Story = {
  args: {
    preferredPlacement: "bottom-left",
    children: null,
  },
  render: ({ preferredPlacement }) => {
    return (
      <Popover preferredPlacement={preferredPlacement}>
        <Popover.Target className="button primary">
          Toggle the popover
        </Popover.Target>
        <Popover.Content>Popover content</Popover.Content>
      </Popover>
    );
  },
};

export const WithinContainer: Story = {
  args: {
    preferredPlacement: "bottom-left",
    children: null,
  },
  render: ({ preferredPlacement }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "500px",
          height: "300px",
          border: "1px solid black",
        }}
      >
        <div style={{ marginTop: 200 }}>
          <Popover
            preferredPlacement={preferredPlacement}
            containerRef={containerRef}
          >
            <Popover.Target className="button primary">
              Toggle the popover
            </Popover.Target>
            <Popover.Content>Popover content</Popover.Content>
          </Popover>
        </div>
      </div>
    );
  },
};

export const WithinScrollContainer: Story = {
  args: {
    preferredPlacement: "bottom-left",
    children: null,
  },
  render: ({ preferredPlacement }) => {
    const containerRef = useRef<HTMLDivElement>(null);
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
        <div
          style={{
            height: "1200px",
            position: "relative",
            paddingTop: "400px",
          }}
        >
          <Popover
            preferredPlacement={preferredPlacement}
            containerRef={containerRef}
          >
            <Popover.Target className="button primary">
              Toggle the popover
            </Popover.Target>
            <Popover.Content>Popover content</Popover.Content>
          </Popover>
        </div>
      </div>
    );
  },
};

export const WithinOverflowHiddenContainer: Story = {
  args: {
    preferredPlacement: "bottom-left",
    children: null,
  },
  render: ({ preferredPlacement }) => {
    return (
      <div
        style={{
          position: "relative",
          width: "500px",
          height: "100px",
          border: "1px solid black",
          overflow: "hidden",
        }}
      >
        <Popover
          preferredPlacement={preferredPlacement}
          portalOptions={{
            container: document.body,
          }}
        >
          <Popover.Target className="button primary">
            Toggle the popover
          </Popover.Target>
          <Popover.Content>Popover content</Popover.Content>
        </Popover>
      </div>
    );
  },
};

export const WithDifferentTargetElement: Story = {
  args: {
    preferredPlacement: "bottom-left",
    children: null,
  },
  render: ({ preferredPlacement }) => {
    return (
      <Popover preferredPlacement={preferredPlacement}>
        <Popover.Target as="a">Toggle the popover</Popover.Target>
        <Popover.Content>Popover content</Popover.Content>
      </Popover>
    );
  },
};
