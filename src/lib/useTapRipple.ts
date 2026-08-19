"use client";

import { useCallback, useState, type PointerEvent } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export type TapRippleDescriptor = {
  id: number;
  x: number;
  y: number;
  size: number;
};

let rippleIdCounter = 0;
const RIPPLE_LIFETIME_MS = 650;

/**
 * Ripple "як по воді" в точці дотику — той самий підхід (два кільця з
 * невеликою затримкою), що й у ripple-ефекті краплі на екрані правил
 * (.drip-ripple в globals.css), тільки розмір рахується від ширини самої
 * кнопки, а не фіксований.
 */
export function useTapRipple() {
  const reducedMotion = usePrefersReducedMotion();
  const [ripples, setRipples] = useState<TapRippleDescriptor[]>([]);

  const addRipple = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (reducedMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const id = ++rippleIdCounter;
      const ripple: TapRippleDescriptor = {
        id,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        size: rect.width * 1.5,
      };
      setRipples((prev) => [...prev, ripple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, RIPPLE_LIFETIME_MS);
    },
    [reducedMotion]
  );

  return { ripples, addRipple };
}
