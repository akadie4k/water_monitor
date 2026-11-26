"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { fmtDate } from "@/lib/format";
import { clearPct } from "@/lib/indices";
import type { Scene } from "@/lib/types";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import Icon from "@/components/ui/Icon";
import { skyIcon } from "@/lib/icons";

export interface SceneTimelineProps {
  /** ทุกภาพ */
  scenes: Scene[];
  /** ภาพที่ผ่านตัวกรอง — ใช้ตอนเล่นไล่ภาพ (ข้ามภาพเมฆหนาที่ซ่อนอยู่) */
  playable: Scene[];
  selectedId: string | null;
  onSelect: (scene: Scene) => void;
  className?: string;
}

const STEP_MS = 1500;
const monthFmt = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", month: "short" });
const yearFmt = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", year: "2-digit" });

/** ขนาดจุดตาม % โปร่ง: 6px (เมฆเต็ม) ถึง 18px (โปร่งทั้งหมด) */
const dotSize = (clearFrac: number) => Math.round(6 + Math.max(0, Math.min(1, clearFrac)) * 12);

/** ไทม์ไลน์วันที่ของภาพทั้งหมด + ปุ่มเล่นไล่ภาพแบบ time-lapse */
export default function SceneTimeline({ scenes, playable, selectedId, onSelect, className }: SceneTimelineProps) {
  const reduce = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const playBtn = useRef<HTMLButtonElement>(null);

  const sorted = useMemo(() => [...scenes].sort((a, b) => a.time_ms - b.time_ms), [scenes]);
  const playOrder = useMemo(() => [...playable].sort((a, b) => a.time_ms - b.time_ms), [playable]);
  const visible = useMemo(() => new Set(playable.map((s) => s.image_id)), [playable]);

  const t0 = sorted[0]?.time_ms ?? 0;
  const t1 = sorted[sorted.length - 1]?.time_ms ?? 1;
  const span = Math.max(1, t1 - t0);
  const at = (t: number) => (sorted.length < 2 ? 50 : ((t - t0) / span) * 100);

  const ticks = useMemo(() => {
    if (sorted.length < 2) return [];
    const out: { t: number; label: string }[] = [];
    const d = new Date(t0);
    let cur = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
    while (cur <= t1) {
      const date = new Date(cur);
      const label = date.getMonth() === 0 ? `${monthFmt.format(date)} ${yearFmt.format(date)}` : monthFmt.format(date);
      out.push({ t: cur, label });
      cur = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
    }
    return out;
  }, [sorted.length, t0, t1]);

  // ref ล่าสุดสำหรับ interval
  const live = useRef({ playOrder, selectedId, onSelect });
  live.current = { playOrder, selectedId, onSelect };

  // เล่นไล่ภาพ
  useEffect(() => {
    if (!playing) return;
    const tick = () => {
      const { playOrder: list, selectedId: cur, onSelect: select } = live.current;
      const i = list.findIndex((s) => s.image_id === cur);
      const next = list[i + 1];
      if (!next) {
        setPlaying(false);
        return;
      }
      select(next);
    };
    const t = window.setInterval(tick, STEP_MS);
    return () => window.clearInterval(t);
  }, [playing]);

  // หยุดเล่นเมื่อผู้ใช้แตะส่วนอื่นของหน้า
  useEffect(() => {
    if (!playing) return;
    const stop = (e: Event) => {
      if (playBtn.current?.contains(e.target as Node)) return;
      setPlaying(false);
    };
    const opts = { capture: true, passive: true } as const;
    window.addEventListener("pointerdown", stop, opts);
    window.addEventListener("keydown", stop, opts);
    window.addEventListener("wheel", stop, opts);
    return () => {
      window.removeEventListener("pointerdown", stop, opts);
      window.removeEventListener("keydown", stop, opts);
      window.removeEventListener("wheel", stop, opts);
    };
  }, [playing]);

  useEffect(() => {
    if (reduce) setPlaying(false);
  }, [reduce]);

  // เลื่อนจุดที่เลือกให้อยู่ในกรอบ (เลื่อนแนวนอนเท่านั้น ไม่ขยับหน้า)
  useEffect(() => {
    const box = scroller.current;
    if (!box || !selectedId) return;
    const dot = box.querySelector<HTMLElement>(`[data-dot="${CSS.escape(selectedId)}"]`);
    if (!dot) return;
    const r = dot.getBoundingClientRect();
    const x = r.left + r.width / 2 - box.getBoundingClientRect().left + box.scrollLeft;
    if (x < box.scrollLeft + 24 || x > box.scrollLeft + box.clientWidth - 24) {
      box.scrollTo({ left: x - box.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
    }
  }, [selectedId, reduce]);

  const togglePlay = () => {
    if (reduce) return;
    if (playing) {
      setPlaying(false);
      return;
    }
    if (playOrder.length < 2) return;
    const i = playOrder.findIndex((s) => s.image_id === selectedId);
    // อยู่ภาพสุดท้ายหรือภาพที่ถูกกรองออก → เริ่มจากภาพแรก
    if (i === -1 || i === playOrder.length - 1) onSelect(playOrder[0]);
    setPlaying(true);
  };

  const focusScene = sorted.find((s) => s.image_id === (hoverId ?? selectedId)) ?? null;
  const canPlay = playOrder.length >= 2;

  return (
    <section aria-label="ไทม์ไลน์ภาพดาวเทียม" className={cn("rounded-xl border border-border bg-surface px-3 py-2 sm:px-4", className)}>
      <div className="flex items-center gap-3">
        <button
          ref={playBtn}
          type="button"
          onClick={togglePlay}
          aria-pressed={playing}
          aria-disabled={reduce || !canPlay || undefined}
          title={reduce ? "ปิดการเล่นอัตโนมัติไว้ เพราะเครื่องตั้งค่าลดการเคลื่อนไหว" : !canPlay ? "ต้องมีอย่างน้อย 2 ภาพ" : undefined}
          className={cn(
            "flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium sm:min-h-9",
            "motion-safe:transition-[background-color,scale] motion-safe:duration-150",
            reduce || !canPlay
              ? "cursor-not-allowed bg-border-soft text-muted"
              : playing
                ? "bg-accent-soft text-accent-strong ring-1 ring-inset ring-accent/30 active:scale-95"
                : "bg-primary-soft text-primary hover:bg-primary/12 active:scale-95",
          )}
        >
          <Icon name={playing ? "pause" : "play"} size={14} />
          {playing ? "หยุด" : "เล่นไล่ภาพ"}
        </button>

        <p className="min-w-0 flex-1 truncate text-[13px] text-muted tabular-nums" aria-live="off">
          {focusScene ? (
            <>
              <span className="text-ink">{fmtDate(focusScene.datetime)}</span>{" "}
              <Icon name={skyIcon(clearPct(focusScene.clear_frac))} size={14} className="align-[-0.15em]" /> โปร่ง {clearPct(focusScene.clear_frac)}%
              {!focusScene.buoy_has_data && ", เมฆบังจุดทุ่น"}
            </>
          ) : (
            "ยังไม่มีภาพ"
          )}
        </p>
        <p className="hidden shrink-0 text-xs text-muted lg:block">จุดใหญ่ = โปร่งมาก, จุดกลวง = เมฆบังจุดทุ่น</p>
      </div>

      <div ref={scroller} className="-mx-1 overflow-x-auto overscroll-x-contain px-1">
        <div className="relative mx-3 h-14" style={{ minWidth: Math.max(sorted.length * 12, 280) }}>
          {/* เส้นแกน */}
          <div aria-hidden="true" className="absolute inset-x-0 top-[18px] h-px bg-border" />
          {ticks.map((t) => (
            <span
              key={t.t}
              aria-hidden="true"
              className="absolute top-[30px] -translate-x-1/2 text-[11px] whitespace-nowrap text-muted before:absolute before:-top-[9px] before:left-1/2 before:h-1.5 before:w-px before:bg-border"
              style={{ left: `${at(t.t)}%` }}
            >
              {t.label}
            </span>
          ))}
          <div role="group" aria-label="ภาพตามวันที่ (กด ← → เพื่อเปลี่ยนภาพ)">
            {sorted.map((s) => {
              const on = s.image_id === selectedId;
              const size = dotSize(s.clear_frac);
              const pct = clearPct(s.clear_frac);
              return (
                <button
                  key={s.image_id}
                  type="button"
                  data-dot={s.image_id}
                  tabIndex={on ? 0 : -1}
                  aria-pressed={on}
                  aria-label={`${fmtDate(s.datetime)} โปร่ง ${pct}%${s.buoy_has_data ? "" : " เมฆบังจุดทุ่น"}`}
                  onClick={() => onSelect(s)}
                  onPointerEnter={() => setHoverId(s.image_id)}
                  onPointerLeave={() => setHoverId((h) => (h === s.image_id ? null : h))}
                  className={cn(
                    "group absolute top-[18px] grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full",
                    on ? "z-10" : "hover:z-10",
                  )}
                  style={{ left: `${at(s.time_ms)}%` }}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block rounded-full motion-safe:transition-[transform,box-shadow] motion-safe:duration-150 group-hover:scale-125",
                      s.buoy_has_data ? "bg-primary" : "border-[1.5px] border-primary bg-white",
                      !visible.has(s.image_id) && !on && "opacity-35",
                      on && "scale-110 shadow-[0_0_0_2px_#fff,0_0_0_4px_var(--color-accent)]",
                    )}
                    style={{ width: size, height: size }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
