import { useCallback, useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };

type Bounds =
  | { left: number; top: number; right: number; bottom: number }
  | (() => { left: number; top: number; right: number; bottom: number });

type UseDraggableOptions = {
  initialPosition?: Point;
  bounds?: Bounds;
  onDragStart?: (pos: Point, ev: PointerEvent) => void;
  onDrag?: (pos: Point, ev: PointerEvent) => void;
  onDragEnd?: (pos: Point, ev: PointerEvent) => void;

  /**
   * Pixel threshold after which we consider the interaction a "drag".
   * This is useful for suppressing click after dragging (e.g. for popovers).
   */
  dragThresholdPx?: number;
};

type UseDraggableResult = {
  position: Point;

  /**
   * True while the pointer is captured for the active interaction.
   */
  isDragging: boolean;

  /**
   * Latched flag: becomes true once the pointer has moved more than `dragThresholdPx`
   * during the current interaction. Cleared on the next `onPointerDown`.
   *
   * This is specifically to help consumers suppress the "click" that fires after
   * a drag ends (since `isDragging` is usually already false by then).
   */
  didDrag: boolean;

  style: React.CSSProperties;
  handlers: {
    onPointerDown: React.PointerEventHandler<HTMLElement>;
    onPointerMove: React.PointerEventHandler<HTMLElement>;
    onPointerUp: React.PointerEventHandler<HTMLElement>;
    onPointerCancel: React.PointerEventHandler<HTMLElement>;
  };
  setPosition: React.Dispatch<React.SetStateAction<Point>>;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function resolveBounds(bounds?: Bounds) {
  if (!bounds) return null;
  return typeof bounds === "function" ? bounds() : bounds;
}

export function useDraggable(
  options: UseDraggableOptions = {},
): UseDraggableResult {
  const {
    initialPosition = { x: 0, y: 0 },
    bounds,
    onDragStart,
    onDrag,
    onDragEnd,
    dragThresholdPx = 5,
  } = options;

  const [position, setPosition] = useState<Point>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);

  // Latched "did drag" flag for the current interaction. See `UseDraggableResult.didDrag`.
  const [didDrag, setDidDrag] = useState(false);

  const dragRef = useRef<{
    pointerId: number | null;
    offsetX: number;
    offsetY: number;
    startClientX: number;
    startClientY: number;
    el: HTMLElement | null;
  }>({
    pointerId: null,
    offsetX: 0,
    offsetY: 0,
    startClientX: 0,
    startClientY: 0,
    el: null,
  });

  const applyBounds = useCallback(
    (next: Point): Point => {
      const b = resolveBounds(bounds);
      if (!b) return next;
      return {
        x: clamp(next.x, b.left, b.right),
        y: clamp(next.y, b.top, b.bottom),
      };
    },
    [bounds],
  );

  const onPointerDown = useCallback<React.PointerEventHandler<HTMLElement>>(
    (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);

      dragRef.current.pointerId = e.pointerId;
      dragRef.current.el = el;
      dragRef.current.offsetX = e.clientX - position.x;
      dragRef.current.offsetY = e.clientY - position.y;
      dragRef.current.startClientX = e.clientX;
      dragRef.current.startClientY = e.clientY;

      // Reset per interaction.
      setDidDrag(false);

      setIsDragging(true);
      onDragStart?.(position, e.nativeEvent);
    },
    [onDragStart, position],
  );

  const onPointerMove = useCallback<React.PointerEventHandler<HTMLElement>>(
    (e) => {
      const { pointerId, offsetX, offsetY, el, startClientX, startClientY } =
        dragRef.current;

      if (!el || pointerId == null) return;
      if (!el.hasPointerCapture(pointerId)) return;

      const ev = e.nativeEvent;

      // Latch once the move exceeds the threshold (useful for suppressing post-drag clicks).
      if (!didDrag) {
        const dx = Math.abs(ev.clientX - startClientX);
        const dy = Math.abs(ev.clientY - startClientY);
        if (dx > dragThresholdPx || dy > dragThresholdPx) {
          setDidDrag(true);
        }
      }

      const next = applyBounds({
        x: ev.clientX - offsetX,
        y: ev.clientY - offsetY,
      });

      setPosition(next);
      onDrag?.(next, ev);
    },
    [applyBounds, didDrag, dragThresholdPx, onDrag],
  );

  const endDrag = useCallback(
    (ev: PointerEvent) => {
      const { pointerId, el } = dragRef.current;

      if (!el || pointerId == null) return;
      if (ev.pointerId !== pointerId) return;

      if (el.hasPointerCapture(pointerId)) {
        try {
          el.releasePointerCapture(pointerId);
        } catch {
          // ignore
        }
      }

      dragRef.current.pointerId = null;
      dragRef.current.el = null;
      setIsDragging(false);
      onDragEnd?.(position, ev);
    },
    [onDragEnd, position],
  );

  const onPointerUp = useCallback<React.PointerEventHandler<HTMLElement>>(
    (e) => {
      endDrag(e.nativeEvent);
    },
    [endDrag],
  );

  const onPointerCancel = useCallback<React.PointerEventHandler<HTMLElement>>(
    (e) => {
      endDrag(e.nativeEvent);
    },
    [endDrag],
  );

  const style = useMemo<React.CSSProperties>(
    () => ({
      transform: `translate(${position.x}px, ${position.y}px)`,
      touchAction: "none",
      cursor: isDragging ? "grabbing" : "grab",
      userSelect: "none",
    }),
    [position.x, position.y, isDragging],
  );

  return {
    position,
    isDragging,
    didDrag,
    style,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
    setPosition,
  };
}
