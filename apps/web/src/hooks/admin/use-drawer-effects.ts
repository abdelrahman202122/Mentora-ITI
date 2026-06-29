
import { useEffect } from "react";

/**
 * Hook: closes a drawer/modal on ESC key press.
 */
export function useEscapeClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);
}

/**
 * Hook: locks body scroll while a modal/drawer is open.
 * Restores the previous overflow value on cleanup.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isLocked]);
}

/**
 * Combined hook: ESC close + body scroll lock.
 * Used by every drawer and modal in the admin dashboard.
 */
export function useDrawerEffects(isOpen: boolean, onClose: () => void) {
  useEscapeClose(isOpen, onClose);
  useBodyScrollLock(isOpen);
}
