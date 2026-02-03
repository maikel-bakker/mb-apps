import {
  createContext,
  useContext,
  useRef,
  type Key,
  type ReactNode,
} from "react";
import { usePopover, type UsePopoverProps } from "../../hooks/use-popover";
import { createPortal } from "react-dom";

type PopoverProps = Pick<
  UsePopoverProps,
  "preferredPlacement" | "containerRef"
> & {
  children: ReactNode;
  portalOptions?: {
    container: HTMLElement;
    key?: Key | null;
  };
};

const PopoverContext = createContext<
  ReturnType<typeof usePopover> &
    Pick<UsePopoverProps, "targetRef" | "popoverRef"> &
    Pick<PopoverProps, "portalOptions">
>({
  isOpen: false,
  setIsOpen: () => {},
  popoverPosition: undefined,
  targetRef: { current: null },
  popoverRef: { current: null },
});

export function Popover({
  preferredPlacement,
  children,
  containerRef,
  portalOptions,
}: PopoverProps) {
  const targetRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { isOpen, setIsOpen, popoverPosition } = usePopover({
    targetRef,
    popoverRef,
    containerRef,
    preferredPlacement,
  });

  return (
    <PopoverContext.Provider
      value={{
        isOpen,
        setIsOpen,
        popoverPosition,
        targetRef,
        popoverRef,
        portalOptions,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
}

type PopoverContentProps = React.HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: React.ElementType | string;
};

function PopoverTarget({ children, as, ...props }: PopoverContentProps) {
  const { setIsOpen, targetRef } = useContext(PopoverContext);

  const Component = as || "button";

  return (
    <Component
      ref={targetRef}
      onClick={() => setIsOpen((prev) => !prev)}
      {...props}
    >
      {children}
    </Component>
  );
}

function PopoverContent({ children, as }: PopoverContentProps) {
  const { isOpen, popoverPosition, popoverRef, portalOptions } =
    useContext(PopoverContext);
  if (!isOpen) return null;

  const Component = as || "div";

  const content = (
    <Component
      ref={popoverRef}
      className="popover"
      style={{
        top: popoverPosition ? `${popoverPosition.top}px` : undefined,
        left: popoverPosition ? `${popoverPosition.left}px` : undefined,
        visibility: popoverPosition ? "visible" : "hidden",
      }}
    >
      {children}
    </Component>
  );

  return portalOptions
    ? createPortal(content, portalOptions.container, portalOptions.key)
    : content;
}

Popover.Target = PopoverTarget;
Popover.Content = PopoverContent;
