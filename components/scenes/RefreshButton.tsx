"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import type { RefreshResult } from "@/hooks/useScenes";
import { cn } from "@/lib/cn";

const IDLE = "ดึงภาพใหม่";
const BUSY = ["กำลังคุยกับดาวเทียม…", "รอเมฆหลบสักครู่…", "เกือบเสร็จแล้ว"] as const;
const LABELS = [IDLE, ...BUSY];

export interface RefreshButtonProps {
  refreshing: boolean;
  onRefresh: () => Promise<RefreshResult>;
  className?: string;
}

/** สั่งดึงภาพจาก Earth Engine: ระหว่างรอ ข้อความเปลี่ยนทุก 2 วินาที, ผิดพลาดปุ่มส่าย */
export default function RefreshButton({ refreshing, onRefresh, className }: RefreshButtonProps) {
  const { toast } = useToast();
  const [msg, setMsg] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!refreshing) return;
    setMsg(0);
    const t = window.setInterval(() => setMsg((m) => Math.min(m + 1, BUSY.length - 1)), 2000);
    return () => window.clearInterval(t);
  }, [refreshing]);

  const run = async () => {
    if (refreshing) return;
    setShake(false);
    const r = await onRefresh();
    if (r.ok) {
      toast(r.added > 0 ? `ได้ภาพใหม่ ${r.added} ภาพ` : "ยังไม่มีภาพใหม่ ดาวเทียมจะผ่านอีกในราว 5 วัน", {
        tone: r.added > 0 ? "success" : "info",
        icon: r.added > 0 ? undefined : "satellite",
      });
    } else {
      setShake(true);
      toast("ดึงภาพไม่สำเร็จ ดูรายละเอียดด้านบนแผนที่แล้วลองอีกครั้ง", { tone: "error" });
    }
  };

  const current = refreshing ? BUSY[msg] : IDLE;

  return (
    <button
      type="button"
      onClick={run}
      aria-disabled={refreshing || undefined}
      aria-busy={refreshing || undefined}
      onAnimationEnd={(e) => e.animationName === "shake" && setShake(false)}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2.5 rounded-full px-5 text-sm font-semibold whitespace-nowrap transition-[background-color,transform] duration-150",
        refreshing ? "cursor-progress bg-white/15 text-white" : "bg-buoy text-night hover:bg-[#f7b65c] active:scale-[0.97]",
        shake && "shake",
        className,
      )}
    >
      <Icon name={refreshing ? "refresh" : "satelliteDish"} spin={refreshing} size={15} />
      {/* ข้อความทุกแบบซ้อนในช่องเดียว ปุ่มจึงกว้างเท่าเดิมเสมอ */}
      <span aria-hidden="true" className="grid">
        {LABELS.map((l) => (
          <span key={l} className={cn("col-start-1 row-start-1 text-left", l === current ? "" : "invisible")}>
            {l}
          </span>
        ))}
      </span>
      <span className="sr-only">{refreshing ? "กำลังดึงภาพจาก Earth Engine" : "ดึงภาพใหม่จาก Earth Engine"}</span>
    </button>
  );
}
