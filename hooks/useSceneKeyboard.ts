"use client";

import { useEffect, useRef } from "react";
import type { Scene } from "@/lib/types";

export interface UseSceneKeyboardOptions {
  /** รายการที่แสดงอยู่ (เรียงใหม่→เก่า ตามที่ backend ส่งมา) */
  scenes: Scene[];
  selectedId: string | null;
  onSelect: (scene: Scene) => void;
  enabled?: boolean;
}

/** ไม่แย่งปุ่มลูกศรจากช่องกรอก แถบเลื่อน เมนู dialog หรือแผนที่ (MapLibre ใช้ลูกศรเลื่อนแผนที่) */
function ownsArrows(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  if (t.isContentEditable) return true;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return true;
  return Boolean(t.closest('[role="slider"], [role="menu"], [role="dialog"], [role="listbox"], .maplibregl-map'));
}

/**
 * ← / → = ภาพก่อนหน้า / ถัดไปตามเวลา (เก่ากว่า / ใหม่กว่า — ทิศเดียวกับไทม์ไลน์)
 * J / K = รายการถัดลงไป / ขึ้นไปในรายการภาพ
 */
export function useSceneKeyboard({ scenes, selectedId, onSelect, enabled = true }: UseSceneKeyboardOptions) {
  const state = useRef({ scenes, selectedId, onSelect });
  state.current = { scenes, selectedId, onSelect };

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || ownsArrows(e.target)) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      // รายการเรียงใหม่→เก่า: index +1 = เก่ากว่า / ลงไปในรายการ
      const step = key === "ArrowLeft" || key === "j" ? 1 : key === "ArrowRight" || key === "k" ? -1 : 0;
      if (!step) return;
      const { scenes: list, selectedId: cur, onSelect: select } = state.current;
      if (list.length === 0) return;
      const i = list.findIndex((s) => s.image_id === cur);
      const next = i === -1 ? list[0] : list[i + step];
      if (!next) return;
      e.preventDefault();
      select(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
