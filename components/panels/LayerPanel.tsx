import { useId } from "react";
import Icon from "@/components/ui/Icon";
import type { Basemap } from "@/components/map/LakeMap";
import { RAMPS } from "@/lib/indices";
import type { OverlayKind } from "@/lib/types";
import { cn } from "@/lib/cn";

const OPTIONS: ReadonlyArray<{ kind: OverlayKind; label: string; estimate?: boolean }> = [
  { kind: "ndti", label: "NDTI ดัชนีความขุ่น" },
  { kind: "turb", label: "ความขุ่นโดยประมาณ (FNU)", estimate: true },
  { kind: "ndci", label: "NDCI ดัชนีคลอโรฟิลล์" },
  { kind: "chla", label: "คลอโรฟิลล์-a โดยประมาณ (µg/L)", estimate: true },
  { kind: "truecolor", label: "ภาพสีจริง" },
];
const TRUE_SWATCH = "linear-gradient(90deg,#3f5566,#6f6a52,#a89a7a)";

export interface LayerPanelProps {
  kind: OverlayKind;
  onKind: (k: OverlayKind) => void;
  opacity: number;
  onOpacity: (v: number) => void;
  basemap: Basemap;
  onBasemap: (b: Basemap) => void;
  /** กำลังสร้างภาพซ้อนที่ Earth Engine */
  loading?: boolean;
  error?: string | null;
  className?: string;
}

/** เลือกชั้นข้อมูลบนแผนที่ + สเกลสี + ความทึบ + แผนที่ฐาน */
export default function LayerPanel({ kind, onKind, opacity, onOpacity, basemap, onBasemap, loading, error, className }: LayerPanelProps) {
  const id = useId();
  const ramp = kind === "truecolor" ? null : RAMPS[kind];

  return (
    <section aria-labelledby={`${id}-t`} className={cn("panel p-4", className)}>
      <h2 id={`${id}-t`} className="flex items-center gap-2 px-1 text-[15px] font-semibold">
        <Icon name="layers" size={14} className="text-lake" />
        ชั้นข้อมูลบนแผนที่
      </h2>

      <div role="radiogroup" aria-labelledby={`${id}-t`} className="mt-2 flex flex-col gap-0.5">
        {OPTIONS.map((o) => {
          const r = o.kind === "truecolor" ? null : RAMPS[o.kind];
          const on = kind === o.kind;
          return (
            <label
              key={o.kind}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-3 rounded-control px-2.5 text-sm transition-colors",
                on ? "bg-lake-soft font-medium text-ink" : "text-body hover:bg-haze",
              )}
            >
              <input type="radio" name={`${id}-layer`} checked={on} onChange={() => onKind(o.kind)} className="sr-only" />
              <span
                aria-hidden="true"
                className={cn("grid size-[18px] shrink-0 place-items-center rounded-full border-2", on ? "border-lake" : "border-line")}
              >
                {on && <span className="size-2 rounded-full bg-lake" />}
              </span>
              <span
                aria-hidden="true"
                className="h-2.5 w-7 shrink-0 rounded-full"
                style={{ background: r ? `linear-gradient(90deg, ${r.palette.join(",")})` : TRUE_SWATCH }}
              />
              <span className="min-w-0 flex-1 leading-snug">{o.label}</span>
              {o.estimate && <span className="shrink-0 rounded-full bg-buoy-soft px-2 text-[11px] leading-5 font-medium text-buoy-deep">ประมาณ</span>}
            </label>
          );
        })}
      </div>

      {/* สเกลสีของชั้นที่เลือก */}
      <div className="mt-3 rounded-control bg-haze px-3 py-2.5 text-xs" aria-live="polite">
        {loading ? (
          <p className="flex items-center gap-2 text-lake">
            <Icon name="refresh" spin size={12} /> กำลังสร้างภาพซ้อนที่ Earth Engine…
          </p>
        ) : error ? (
          <p className="flex items-start gap-2 text-bad" role="alert">
            <Icon name="error" size={12} className="mt-0.5" /> สร้างภาพซ้อนไม่สำเร็จ: {error}
          </p>
        ) : ramp ? (
          <>
            <span
              aria-hidden="true"
              className="block h-2 rounded-full"
              style={{ background: `linear-gradient(90deg, ${ramp.palette.join(",")})` }}
            />
            <span className="mt-1.5 flex justify-between text-muted tabular-nums">
              <span>{ramp.min} {ramp.lowLabel}</span>
              <span>{ramp.highLabel} {ramp.max}{ramp.unit && ` ${ramp.unit}`}</span>
            </span>
          </>
        ) : (
          <p className="text-muted">สีจริงจากแบนด์ B4, B3, B2 ใช้ดูเมฆ ตะกอน และสีน้ำด้วยตา</p>
        )}
      </div>

      <label className="mt-4 grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-1.5 px-1 text-[13px] text-muted">
        <span>ความทึบภาพซ้อน</span>
        <output className="font-medium text-ink tabular-nums">{Math.round(opacity * 100)}%</output>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => onOpacity(Number(e.target.value))}
          className="col-span-2 w-full"
        />
      </label>

      <div role="radiogroup" aria-label="แผนที่ฐาน" className="mt-4 grid grid-cols-2 gap-1 rounded-control bg-haze p-1">
        {(["osm", "sat"] as const).map((b) => (
          <button
            key={b}
            type="button"
            role="radio"
            aria-checked={basemap === b}
            onClick={() => onBasemap(b)}
            className={cn(
              "min-h-10 rounded-[9px] text-[13px] transition-colors",
              basemap === b ? "bg-night font-medium text-white shadow-sm" : "text-body hover:bg-white",
            )}
          >
            {b === "osm" ? "แผนที่ถนน" : "ภาพถ่ายดาวเทียม"}
          </button>
        ))}
      </div>
    </section>
  );
}
