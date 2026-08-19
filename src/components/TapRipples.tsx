import type { TapRippleDescriptor } from "@/lib/useTapRipple";

type TapRipplesProps = {
  ripples: TapRippleDescriptor[];
};

/** Рендерить активні ripple-хвилі поверх кнопки — сама кнопка має бути position:relative + overflow-hidden. */
export function TapRipples({ ripples }: TapRipplesProps) {
  return (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute"
          style={{ left: r.x, top: r.y, ["--tap-ripple-size" as string]: `${r.size}px` }}
          aria-hidden="true"
        >
          <span className="tap-ripple" />
          <span className="tap-ripple tap-ripple-delay" />
        </span>
      ))}
    </>
  );
}
