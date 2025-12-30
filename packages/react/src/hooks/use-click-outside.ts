import { useEffect } from "react";

export function useClickOutside(
  refs: React.RefObject<HTMLElement | null>[],
  handler: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        !refs.some(
          (ref) => ref.current && ref.current.contains(event.target as Node),
        )
      ) {
        handler(event);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [refs, handler]);
}
