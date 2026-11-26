"use client";

import { useId, useState } from "react";
import SegmentedControl, { type SegmentOption } from "@/components/ui/SegmentedControl";
import Icon from "@/components/ui/Icon";
import Slider from "@/components/ui/Slider";
import MapLegend from "./MapLegend";
import { cn } from "@/lib/cn";
import { fmtDate, fmtTime } from "@/lib/format";
import type { OverlayKind, Scene } from "@/lib/types";

export interface OverlayControlsProps {
  scene: Scene | null;
  kind: OverlayKind;
  onKindChange: (kind: OverlayKind) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  /** กำลังสร้างภาพซ้อนที่ Earth Engine */
  loading?: boolean;
  error?: string | null;
  className?: string;
}

type Layer = "turbidity" | "chlorophyll" | "truecolor";
type Mode = "index" | "estimate";

const LAYERS: ReadonlyArray<SegmentOption<Layer>> = [
  { value: "turbidity", label: "ความขุ่น", icon: "water" },
  { value: "chlorophyll", label: "สาหร่าย", icon: "droplet" },
  { value: "truecolor", label: "สีจริง", icon: "photo" },
];
const MODES: ReadonlyArray<SegmentOption<Mode>> = [
  { value: "index", label: "ดัชนี" },
  { value: "estimate", label: "ค่าประมาณ" },
];

const layerOf = (k: OverlayKind): Layer =>
  k === "ndti" || k === "turb" ? "turbidity" : k === "ndci" || k === "chla" ? "chlorophyll" : "truecolor";
const modeOf = (k: OverlayKind): Mode => (k === "turb" || k === "chla" ? "estimate" : "index");
const kindOf = (layer: Layer, mode: Mode): OverlayKind =>
  layer === "truecolor" ? "truecolor"
    : layer === "turbidity" ? (mode === "estimate" ? "turb" : "ndti")
      : mode === "estimate" ? "chla" : "ndci";
const SHORT: Record<OverlayKind, string> = {
  ndti: "NDTI", turb: "ขุ่น FNU", ndci: "NDCI", chla: "Chl-a", truecolor: "สีจริง",
};

/** แผงอ่านค่าบนแผนที่: ชนิดภาพ แถบสี ความทึบ — บนมือถือย่อเป็นปุ่ม */
export default function OverlayControls({
  scene, kind, onKindChange, opacity, onOpacityChange, loading, error, className,
}: OverlayControlsProps) {
  const [open, setOpen] = useState(false);
  const layer = layerOf(kind);
  // จำโหมดไว้ตอนสลับไปดูสีจริงแล้วกลับมา
  const [mode, setMode] = useState<Mode>(modeOf(kind));
  const panelId = useId();

  return (
    <div className={cn("flex flex-col-reverse items-end gap-2", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 items-center gap-2 rounded-lg bg-white/95 px-3 text-sm font-medium text-ink shadow-[0_0_0_1px_var(--color-border)] sm:hidden"
      >
        <Icon name="layers" className="text-primary" />
        {open ? "ซ่อนชั้นข้อมูล" : SHORT[kind]}
        {loading && <span className="size-2 rounded-full bg-primary motion-safe:animate-pulse" aria-hidden="true" />}
      </button>

      <div
        id={panelId}
        className={cn(
          "max-h-[calc(60vh-6.5rem)] w-[min(19rem,calc(100vw-3rem))] flex-col gap-3 overflow-y-auto sm:max-h-none sm:overflow-visible rounded-xl bg-white/96 p-3.5 shadow-[0_0_0_1px_var(--color-border),0_6px_24px_-8px_color-mix(in_srgb,var(--color-ink)_35%,transparent)] backdrop-blur-sm",
          open ? "flex" : "hidden sm:flex",
        )}
      >
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-display text-[15px] font-medium text-ink">
            {scene ? `ภาพวันที่ ${fmtDate(scene.datetime)}` : "ยังไม่ได้เลือกภาพ"}
          </p>
          {scene && <span className="text-xs text-muted tabular-nums">{fmtTime(scene.datetime)} น.</span>}
        </div>
        {scene && (
          <p className="-mt-2 text-xs text-muted">
            tile {scene.tile}, เมฆทั้งแผ่น {Math.round(scene.cloud_pct)}%
          </p>
        )}

        <SegmentedControl
          label="ชั้นข้อมูล"
          size="sm"
          options={LAYERS}
          value={layer}
          onChange={(l) => onKindChange(kindOf(l, mode))}
          className="w-full"
        />
        {layer !== "truecolor" && (
          <SegmentedControl
            label="แสดงเป็น"
            size="sm"
            options={MODES}
            value={modeOf(kind)}
            onChange={(m) => {
              setMode(m);
              onKindChange(kindOf(layer, m));
            }}
            className="w-full"
          />
        )}

        {loading ? (
          <p role="status" className="flex items-center gap-2 text-[13px] text-body">
            <span aria-hidden="true" className="size-3.5 rounded-full border-2 border-primary border-r-transparent motion-safe:animate-spin" />
            กำลังสร้างภาพจาก Earth Engine…
          </p>
        ) : error ? (
          <p role="alert" className="text-[13px] text-bad">
            สร้างภาพซ้อนไม่สำเร็จ: {error}
          </p>
        ) : (
          <MapLegend kind={kind} scene={scene} />
        )}

        <Slider
          label="ความทึบภาพซ้อน"
          value={opacity}
          min={0.2}
          max={1}
          step={0.05}
          onChange={onOpacityChange}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </div>
    </div>
  );
}
