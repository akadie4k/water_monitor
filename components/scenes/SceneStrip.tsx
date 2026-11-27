"use client";

import { useEffect, useMemo, useRef } from "react";
import { toDate } from "@/lib/format";
import { RAMPS, clearPct, fmtIndex, rampColor } from "@/lib/indices";
import type { Scene } from "@/lib/types";
import { cn } from "@/lib/cn";

const DAY = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "short", year: "2-digit" });
const MONTH = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", month: "short" });
const MONTH_KEY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit" });

export interface SceneStripProps {
  /** ทุกภาพ (ลำดับใดก็ได้ — แถบเรียงเก่า→ใหม่เอง) */
  scenes: Scene[];
  /** ภาพที่ผ่านตัวกรอง (ภาพอื่นจางลงและกดไม่ได้) */
  enabledIds: Set<string>;
  selectedId: string | null;
  onSelect: (scene: Scene) => void;
}

/**
 * แถบวันที่: หนึ่งแท่งต่อหนึ่งภาพ เรียงตามเวลา
 * ความสูง = ฟ้าโปร่งเหนือสระ, สี = ค่า NDTI ที่จุดทุ่น (สเกลเดียวกับแผนที่), ลายทาง = เมฆบังจุดทุ่น
 */
export default function SceneStrip({ scenes, enabledIds, selectedId, onSelect }: SceneStripProps) {
  const rows = useMemo(() => [...scenes].sort((a, b) => a.time_ms - b.time_ms), [scenes]);
  const scroller = useRef<HTMLDivElement>(null);

  // เลื่อนให้เห็นแท่งที่เลือกเสมอ (ครั้งแรกกระโดดไปเลย ครั้งต่อไปค่อยๆ เลื่อน)
  const first = useRef(true);
  useEffect(() => {
    const box = scroller.current;
    const el = box?.querySelector<HTMLElement>(`[data-id="${selectedId}"]`);
    if (!box || !el) return;
    const left = box.scrollLeft + el.getBoundingClientRect().left - box.getBoundingClientRect().left - box.clientWidth / 2;
    box.scrollTo({ left, behavior: first.current ? "auto" : "smooth" });
    first.current = false;
  }, [selectedId, rows.length]);

  const ramp = RAMPS.ndti;

  return (
    <div ref={scroller} className="overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
      <ol aria-label="ภาพดาวเทียมเรียงตามวันที่" className="flex min-w-max items-end gap-[5px] pt-9 pr-14 pb-1 pl-2">
        {rows.map((s, i) => {
          const pct = clearPct(s.clear_frac);
          const v = s.buoy?.NDTI;
          const has = s.buoy_has_data && v != null;
          const on = s.image_id === selectedId;
          const enabled = enabledIds.has(s.image_id);
          const month = MONTH_KEY.format(toDate(s.datetime));
          const newMonth = i === 0 || MONTH_KEY.format(toDate(rows[i - 1].datetime)) !== month;
          const label = `${DAY.format(toDate(s.datetime))} ฟ้าโปร่ง ${pct}%${has ? ` NDTI ${fmtIndex(v)}` : " เมฆบังจุดทุ่น"}`;
          return (
            <li key={s.image_id} className="relative flex flex-col items-center">
              {newMonth && (
                <span aria-hidden="true" className="absolute -top-8 left-0 text-[11px] font-medium whitespace-nowrap text-muted">
                  {MONTH.format(toDate(s.datetime))}
                </span>
              )}
              <button
                type="button"
                data-id={s.image_id}
                aria-label={label}
                aria-current={on ? "true" : undefined}
                disabled={!enabled}
                onClick={() => onSelect(s)}
                title={label}
                className="group relative grid h-[60px] w-4 items-end justify-center disabled:cursor-default"
              >
                {on && (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-night px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white tabular-nums">
                    {DAY.format(toDate(s.datetime))}
                  </span>
                )}
                <span
                  className={cn(
                    "strip-bar block rounded-full",
                    on ? "w-4 ring-2 ring-night ring-offset-2 ring-offset-white" : "w-2.5",
                    !has && "strip-nodata",
                    !enabled && "opacity-30",
                  )}
                  style={{
                    height: `${14 + (pct / 100) * 46}px`,
                    background: has ? rampColor(ramp, v) : undefined,
                  }}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
