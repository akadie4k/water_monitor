"use client";

import { RAMPS, fmtIndex } from "@/lib/indices";
import { useCountUp } from "@/hooks/useCountUp";
import type { OverlayKind, Scene } from "@/lib/types";

export interface MapLegendProps {
  kind: OverlayKind;
  /** ภาพที่เลือก (ใช้อ่านค่าดัชนีที่จุดทุ่น) */
  scene: Scene | null;
}

/** แถบสีของดัชนีที่แสดงอยู่ พร้อมขีดบอกตำแหน่งค่าที่จุดทุ่นบนสเกล */
export default function MapLegend({ kind, scene }: MapLegendProps) {
  if (kind === "truecolor") {
    return <TrueColorNote />;
  }
  // key: เปลี่ยนชนิดดัชนีแล้วเริ่มใหม่ ไม่นับข้ามหน่วย (เช่น NDTI → FNU)
  return <RampLegend key={kind} kind={kind} scene={scene} />;
}

function TrueColorNote() {
  return (
    <p className="text-[13px] text-muted">
      ภาพสีจริงจากแบนด์ B4, B3, B2 ใช้ดูเมฆ ตะกอน และสีน้ำด้วยตา
    </p>
  );
}

function RampLegend({ kind, scene }: { kind: Exclude<OverlayKind, "truecolor">; scene: Scene | null }) {
  const ramp = RAMPS[kind];
  const { min, max, palette } = ramp;
  const raw = scene ? ramp.read(scene) : null;
  const value = typeof raw === "number" && !Number.isNaN(raw) ? raw : null;
  const has = value != null;
  // ค่าที่จุดทุ่นนับขึ้น/ลงไปหาค่าใหม่เมื่อเปลี่ยนภาพ (~400ms) และขีดบนสเกลเลื่อนตาม
  const shown = useCountUp(value, 400) ?? value;
  const pos = has && shown != null ? Math.min(1, Math.max(0, (shown - min) / (max - min))) : 0;

  return (
    <figure className="m-0">
      <figcaption className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]">
        <span className="text-muted">{ramp.short} ที่จุดทุ่น</span>
        <span className="font-display text-lg leading-none font-medium text-ink tabular-nums">
          {has ? `${ramp.estimate ? "≈ " : ""}${fmtIndex(shown, ramp.digits)}` : "ไม่มีค่า"}
          {has && ramp.unit && <span className="ml-1 text-xs font-normal text-muted">{ramp.unit}</span>}
        </span>
      </figcaption>
      <div className="relative pt-2">
        {has && (
          <span
            aria-hidden="true"
            className="absolute top-0 -ml-[5px] h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-ink"
            style={{ left: `${pos * 100}%` }}
          />
        )}
        <div
          role="img"
          aria-label={`สเกล ${ramp.name} จาก ${min} (${ramp.lowLabel}) ถึง ${max} ${ramp.unit} (${ramp.highLabel})${has ? ` ค่าที่จุดทุ่น ${fmtIndex(value, ramp.digits)}` : ""}`}
          className="relative h-2.5 rounded-sm ring-1 ring-black/10"
          style={{ background: `linear-gradient(90deg, ${palette.join(", ")})` }}
        >
          {has && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -bottom-0.5 w-0.5 -translate-x-1/2 bg-ink"
              style={{ left: `${pos * 100}%` }}
            />
          )}
        </div>
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted tabular-nums">
        <span>{ramp.estimate ? min : min.toFixed(1)} {ramp.lowLabel}</span>
        <span>{ramp.estimate ? `${max}+ ${ramp.unit}` : max.toFixed(1)} {ramp.highLabel}</span>
      </div>
      {ramp.note && <p className="mt-1 text-xs text-muted">{ramp.note}</p>}
      {!has && <p className="mt-1 text-xs text-muted">จุดทุ่นถูกเมฆบังหรือไม่อยู่บนพิกเซลน้ำในภาพนี้</p>}
    </figure>
  );
}
