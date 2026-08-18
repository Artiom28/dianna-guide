"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

// Позиції у відсотках висоти контейнера-банера з фото джерела.
const SPOUT_TOP_PERCENT = 50;
const LANDING_TOP_PERCENT = 76;

const FALL_DURATION_MS = 620;
const REST_DURATION_MS = 420;
const FADE_DURATION_MS = 320;
const MIN_DELAY_MS = 1500;
const MAX_DELAY_MS = 2500;
const FIRST_DROP_DELAY_MS = 700;

type Phase = "idle" | "falling" | "resting" | "fading";

function randomDelay() {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getReducedMotionServerSnapshot() {
  // На сервері немає matchMedia — за замовчуванням вважаємо, що анімація дозволена,
  // і одразу після монтування синхронізуємось із реальним станом клієнта.
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

/**
 * Крапля, що безперервно капає з джерела на екрані правил.
 * Показується, тільки поки видимий екран правил — MainScreen цей компонент не використовує.
 */
export function SpringDropAnimation() {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallDistance, setFallDistance] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [rippleKey, setRippleKey] = useState(0);

  // Вимірюємо реальну висоту банера, щоб крапля падала на точну відстань у пікселях.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const height = el.offsetHeight;
      setFallDistance((height * (LANDING_TOP_PERCENT - SPOUT_TOP_PERCENT)) / 100);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Цикл падіння краплі: очікування -> падіння -> "приземлення" -> згасання -> знову очікування.
  useEffect(() => {
    if (reducedMotion) return;

    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number, fn: () => void) => {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timeouts.push(id);
    };

    const runCycle = (delay: number) => {
      wait(delay, () => {
        setPhase("falling");
        wait(FALL_DURATION_MS, () => {
          setPhase("resting");
          setRippleKey((k) => k + 1);
          wait(REST_DURATION_MS, () => {
            setPhase("fading");
            wait(FADE_DURATION_MS, () => {
              setPhase("idle");
              runCycle(randomDelay());
            });
          });
        });
      });
    };

    runCycle(FIRST_DROP_DELAY_MS);

    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
      {phase === "falling" && (
        // eslint-disable-next-line @next/next/no-img-element -- декоративна крапля фіксованого розміру, next/image тут зайвий
        <img
          src="/images/drop-falling.png"
          alt=""
          className="drop-falling absolute h-14 w-auto -translate-x-1/2"
          style={
            {
              left: "50%",
              top: `${SPOUT_TOP_PERCENT}%`,
              "--fall-distance": `${fallDistance}px`,
            } as React.CSSProperties
          }
        />
      )}

      {(phase === "resting" || phase === "fading") && (
        // eslint-disable-next-line @next/next/no-img-element -- декоративна крапля фіксованого розміру, next/image тут зайвий
        <img
          src="/images/drop-resting.png"
          alt=""
          className={`absolute h-5 w-auto -translate-x-1/2 ${
            phase === "fading" ? "drop-resting-fade" : ""
          }`}
          style={{ left: "50%", top: `${LANDING_TOP_PERCENT}%` }}
        />
      )}

      {rippleKey > 0 && (phase === "resting" || phase === "fading") && (
        <span key={rippleKey} className="absolute" style={{ left: "50%", top: `${LANDING_TOP_PERCENT}%` }}>
          <span className="drip-ripple" />
          <span className="drip-ripple drip-ripple-delay" />
        </span>
      )}
    </div>
  );
}
