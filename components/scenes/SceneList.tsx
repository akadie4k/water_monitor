"use client";

import { useEffect, useRef, type ReactNode } from "react";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import BuoyIllustration from "@/components/ui/BuoyIllustration";
import SceneListItem from "./SceneListItem";
import type { Scene } from "@/lib/types";

export interface SceneListProps {
  scenes: Scene[];
  selectedId: string | null;
  onSelect: (scene: Scene) => void;
  loading: boolean;
  error: string | null;
  /** ภาพทั้งหมดก่อนกรอง ใช้แยกข้อความ "ยังไม่มีภาพ" กับ "กรองแล้วไม่เหลือ" */
  totalCount: number;
  /** ปุ่มดึงข้อมูล/ลองใหม่ ที่แสดงในสถานะว่างหรือ error */
  emptyAction?: ReactNode;
  errorAction?: ReactNode;
  /** เลื่อนการ์ดที่เลือกให้อยู่ในจอ (ใช้เมื่อเปลี่ยนภาพด้วยคีย์บอร์ดหรือไทม์ไลน์) */
  scrollKey?: number;
}

/**
 * รายการภาพ: มือถือเป็นแถบเลื่อนแนวนอน, แท็บเล็ต grid 2 คอลัมน์, เดสก์ท็อปเป็นคอลัมน์เดียวเลื่อนในตัว
 */
const LIST =
  "flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain px-4 pt-1 pb-3 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-5 lg:grid-cols-1 lg:px-3";
const ITEM = "w-40 shrink-0 snap-start sm:w-auto";

export default function SceneList({
  scenes, selectedId, onSelect, loading, error, totalCount, emptyAction, errorAction, scrollKey = 0,
}: SceneListProps) {
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!scrollKey || !selectedId || !list.current) return;
    const el = list.current.querySelector<HTMLElement>(`[data-scene-id="${CSS.escape(selectedId)}"]`);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
    // เลื่อนเฉพาะเมื่อ scrollKey เปลี่ยน (ไม่ใช่ทุกครั้งที่คลิกการ์ด)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollKey]);

  if (loading) {
    return (
      <ul className={LIST} aria-label="กำลังโหลดรายการภาพ" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className={ITEM}>
            <Skeleton className="h-[78px] w-full rounded-lg" />
          </li>
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="โหลดรายการภาพไม่สำเร็จ"
        description={error}
        action={errorAction}
      />
    );
  }

  if (scenes.length === 0) {
    return totalCount === 0 ? (
      <EmptyState
        illustration={<BuoyIllustration />}
        title="ยังไม่มีภาพเลย"
        description="กดดึงข้อมูลเพื่อเรียกดาวเทียมมาหน่อย ครั้งแรกใช้เวลา 2–4 นาที"
        action={emptyAction}
      />
    ) : (
      <EmptyState
        title="ไม่มีภาพที่โปร่งถึง 30%"
        description={`มี ${totalCount} ภาพแต่เมฆบังแหล่งน้ำเกือบทั้งหมด ปิดตัวกรองเพื่อดูทุกภาพ`}
      />
    );
  }

  return (
    <ul ref={list} className={LIST} aria-label="ภาพ Sentinel-2 (กด ← → เพื่อเปลี่ยนภาพ)">
      {scenes.map((s) => (
        <li key={s.image_id} className={ITEM}>
          <SceneListItem scene={s} selected={s.image_id === selectedId} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
