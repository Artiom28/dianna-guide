"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

// Позиції у відсотках висоти контейнера-банера з фото джерела.
// Крапля капає з нижнього краю фото, щоб не заважати лого й заголовку нижче.
const SPOUT_TOP_PERCENT = 72;
const LANDING_TOP_PERCENT = 95;

const FALL_DURATION_MS = 620;
const REST_DURATION_MS = 420;
const FADE_DURATION_MS = 320;
const MIN_DELAY_MS = 1500;
const MAX_DELAY_MS = 2500;
// 700мс очікування + ~620мс падіння ≈ 1.5с до першого удару об воду.
const FIRST_DROP_DELAY_MS = 880;

type Phase = "idle" | "falling" | "resting" | "fading";

function randomDelay() {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

function vibrateOnImpact() {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate(15);
    }
  } catch {
    // вібрація не критична — ігноруємо будь-які помилки API
  }
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

type SpringDropAnimationProps = {
  /** Викликається один раз — у момент, коли перша крапля вперше досягає води. */
  onFirstImpact?: () => void;
};

/**
 * Крапля, що безперервно капає з джерела на екрані правил.
 * Показується, тільки поки видимий екран правил — MainScreen цей компонент не використовує.
 *
 * Поки крапля летить, гість може торкнутись і затримати її пальцем/курсором —
 * падіння призупиняється (і крапля "тремтить"), а після відпускання
 * продовжується з того самого місця з нормальною швидкістю.
 */
export function SpringDropAnimation({ onFirstImpact }: SpringDropAnimationProps) {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [fallDistance, setFallDistance] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [held, setHeld] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  const cancelledRef = useRef(false);
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const fallTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallRemainingRef = useRef(FALL_DURATION_MS);
  const fallStartedAtRef = useRef(0);
  const scheduleFallRef = useRef<(() => void) | null>(null);
  const firstImpactFiredRef = useRef(false);
  const onFirstImpactRef = useRef(onFirstImpact);
  useEffect(() => {
    onFirstImpactRef.current = onFirstImpact;
  }, [onFirstImpact]);

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

  // Основний цикл: очікування -> падіння -> "приземлення" -> згасання -> знову очікування.
  useEffect(() => {
    if (reducedMotion) return;

    cancelledRef.current = false;
    const timeouts = timeoutsRef.current;

    function wait(ms: number, fn: () => void) {
      const id = setTimeout(() => {
        timeouts.delete(id);
        if (!cancelledRef.current) fn();
      }, ms);
      timeouts.add(id);
    }

    function onFallComplete() {
      if (cancelledRef.current) return;
      fallTimeoutRef.current = null;
      setPhase("resting");
      setHeld(false);
      setRippleKey((k) => k + 1);
      vibrateOnImpact();
      if (!firstImpactFiredRef.current) {
        firstImpactFiredRef.current = true;
        onFirstImpactRef.current?.();
      }
      wait(REST_DURATION_MS, () => {
        setPhase("fading");
        wait(FADE_DURATION_MS, () => {
          setPhase("idle");
          wait(randomDelay(), startFalling);
        });
      });
    }

    function scheduleFall() {
      fallStartedAtRef.current = Date.now();
      fallTimeoutRef.current = setTimeout(() => {
        fallTimeoutRef.current = null;
        onFallComplete();
      }, fallRemainingRef.current);
    }
    scheduleFallRef.current = scheduleFall;

    function startFalling() {
      if (cancelledRef.current) return;
      setPhase("falling");
      setHeld(false);
      fallRemainingRef.current = FALL_DURATION_MS;
      scheduleFall();
    }

    wait(FIRST_DROP_DELAY_MS, startFalling);

    return () => {
      cancelledRef.current = true;
      timeouts.forEach(clearTimeout);
      timeouts.clear();
      if (fallTimeoutRef.current) {
        clearTimeout(fallTimeoutRef.current);
        fallTimeoutRef.current = null;
      }
      scheduleFallRef.current = null;
    };
  }, [reducedMotion]);

  // Пауза/відновлення падіння у відповідь на утримання краплі гостем.
  useEffect(() => {
    if (phase !== "falling") return;

    if (held) {
      if (fallTimeoutRef.current) {
        clearTimeout(fallTimeoutRef.current);
        fallTimeoutRef.current = null;
        const elapsed = Date.now() - fallStartedAtRef.current;
        fallRemainingRef.current = Math.max(0, fallRemainingRef.current - elapsed);
      }
    } else if (!fallTimeoutRef.current) {
      scheduleFallRef.current?.();
    }
  }, [held, phase]);

  const handleHoldStart = useCallback(
    (event: React.PointerEvent) => {
      if (phase !== "falling") return;
      event.preventDefault();
      setHeld(true);
    },
    [phase]
  );

  const handleHoldEnd = useCallback(() => {
    setHeld(false);
  }, []);

  if (reducedMotion) return null;

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
      {phase === "falling" && (
        <div
          className={`drop-fall-wrapper absolute ${held ? "drop-held" : ""}`}
          style={
            {
              left: "50%",
              top: `${SPOUT_TOP_PERCENT}%`,
              "--fall-distance": `${fallDistance}px`,
            } as React.CSSProperties
          }
        >
          {/* Ловимо натискання на самій краплі — решта банера лишається "наскрізною". */}
          <div
            className="pointer-events-auto -m-3 touch-none select-none p-3"
            onPointerDown={handleHoldStart}
            onPointerUp={handleHoldEnd}
            onPointerCancel={handleHoldEnd}
            onPointerLeave={handleHoldEnd}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- декоративна крапля фіксованого розміру, next/image тут зайвий */}
            <img
              src="/images/drop-falling.png"
              alt=""
              draggable={false}
              className={`drop-img drop-jelly h-14 w-auto ${held ? "drop-held" : ""}`}
            />
          </div>
        </div>
      )}

      {(phase === "resting" || phase === "fading") && (
        <div
          className="pointer-events-none absolute"
          style={{ left: "50%", top: `${LANDING_TOP_PERCENT}%`, translate: "-50% 0" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- декоративна крапля фіксованого розміру, next/image тут зайвий */}
          <img
            src="/images/drop-resting.png"
            alt=""
            draggable={false}
            className={`drop-img h-6 w-auto ${phase === "fading" ? "drop-resting-fade" : ""}`}
          />
        </div>
      )}

      {rippleKey > 0 && (phase === "resting" || phase === "fading") && (
        <span
          key={rippleKey}
          className="pointer-events-none absolute"
          style={{ left: "50%", top: `${LANDING_TOP_PERCENT}%` }}
        >
          <span className="drip-ripple" />
          <span className="drip-ripple drip-ripple-delay" />
        </span>
      )}
    </div>
  );
}
