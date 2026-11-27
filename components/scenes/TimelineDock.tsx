"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import SceneStrip from "./SceneStrip";
import { CHART_SERIES } from "@/components/charts/IndexChart";
import { MIN_CLEAR_FRAC } from "@/lib/indices";
import type { Scene } from "@/lib/types";
import { cn } from "@/lib/cn";

const IndexChart = dynamic(() => import("@/components/charts/IndexChart"), {
  ssr: false,
  loading: () => <div className="h-full animate-pulse rounded-xl bg-haze" />,
});

const SWATCH: Record<string, string> = { lake: "bg-lake", "buoy-deep": "bg-buoy-deep", muted: "bg-muted" };

export interface TimelineDockProps {
  allScenes: Scene[];
  enabledIds: Set<string>;
  selected: Scene | null;
  onSelect: (s: Scene) => void;
  onStep: (dir: -1 | 1) => void;
  playing: boolean;
  onTogglePlay: () => void;
  onlyClear: boolean;
  onOnlyClear: (v: boolean) => void;
  chartOpen: boolean;
  onChartOpen: (v: boolean) => void;
  loading: boolean;
  /** แสดงแทนแถบเมื่อยังไม่มีภาพ */
  empty?: ReactNode;
  className?: string;
}

/** แท่นด้านล่าง: แถบวันที่ + เล่นไล่ภาพ + ตัวกรอง + กราฟ (กางขึ้นด้านบน) */
export default function TimelineDock({
  allScenes, enabledIds, selected, onSelect, onStep, playing, onTogglePlay, onlyClear, onOnlyClear,
  chartOpen, onChartOpen, loading, empty, className,
}: TimelineDockProps) {
  const withData = allScenes.filter((s) => s.buoy_has_data).length;
  const hasScenes = allScenes.length > 0;

  return (
    <section aria-label="เลือกวันที่ของภาพ" className={cn("panel p-3 sm:p-4", className)}>
      {chartOpen && hasScenes && (
        <div className="drawer-in mb-3 border-b border-line pb-3">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-1">
            <h2 className="text-[15px] font-semibold">ค่าดัชนีที่จุดวางทุ่น</h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-body" aria-label="คำอธิบายเส้นกราฟ">
              {CHART_SERIES.map((x) => (
                <li key={x.key} className="flex items-center gap-1.5">
                  <span aria-hidden="true" className={cn("h-[3px] w-4 rounded-full", SWATCH[x.color])} />
                  {x.name}
                  {x.lower && <span className="text-muted">(แผงล่าง)</span>}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 h-56 sm:h-64">
            {withData === 0 ? (
              <p className="grid h-full place-items-center rounded-xl bg-haze px-4 text-center text-sm text-muted">
                ทุกภาพที่มีอยู่ถูกเมฆบังจุดวางทุ่น ภาพฟ้าโปร่งมักได้ช่วง ก.พ.–ก.ย.
              </p>
            ) : (
              <IndexChart className="h-full" scenes={allScenes} selected={selected} onPick={onSelect} />
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={!hasScenes}
            aria-label={playing ? "หยุดเล่นไล่ภาพ" : "เล่นไล่ภาพตามวันที่"}
            title={playing ? "หยุด" : "เล่นไล่ภาพตามวันที่"}
            className="grid size-11 place-items-center rounded-full bg-lake text-white transition-[background-color,transform] hover:bg-lake-hover active:scale-95 disabled:opacity-40"
          >
            <Icon name={playing ? "pause" : "play"} size={14} className={playing ? "" : "translate-x-px"} />
          </button>
          <StepButton label="ภาพก่อนหน้า" icon="prev" onClick={() => onStep(-1)} disabled={!hasScenes} />
          <StepButton label="ภาพถัดไป" icon="next" onClick={() => onStep(1)} disabled={!hasScenes} />
        </div>

        <div className="order-last w-full min-w-0 lg:order-none lg:flex-1">
          {loading ? (
            <div className="h-[96px] animate-pulse rounded-xl bg-haze" />
          ) : hasScenes ? (
            <SceneStrip scenes={allScenes} enabledIds={enabledIds} selectedId={selected?.image_id ?? null} onSelect={onSelect} />
          ) : (
            empty
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-2 text-[13px] text-body select-none hover:bg-haze">
            <input type="checkbox" checked={onlyClear} onChange={(e) => onOnlyClear(e.target.checked)} className="peer sr-only" />
            <span
              aria-hidden="true"
              className="relative h-6 w-10 rounded-full bg-line transition-colors peer-checked:bg-lake peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lake after:absolute after:top-1 after:left-1 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
            />
            ฟ้าโปร่ง {Math.round(MIN_CLEAR_FRAC * 100)}% ขึ้นไป
          </label>
          <button
            type="button"
            aria-pressed={chartOpen}
            onClick={() => onChartOpen(!chartOpen)}
            disabled={!hasScenes}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-colors disabled:opacity-40",
              chartOpen ? "bg-night text-white" : "bg-haze text-ink hover:bg-lake-soft",
            )}
          >
            <Icon name="chart" size={13} />
            {chartOpen ? "ซ่อนกราฟ" : "กราฟ"}
          </button>
        </div>
      </div>
    </section>
  );
}

function StepButton({ label, icon, onClick, disabled }: { label: string; icon: "prev" | "next"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-haze disabled:opacity-40"
    >
      <Icon name={icon} size={13} />
    </button>
  );
}
