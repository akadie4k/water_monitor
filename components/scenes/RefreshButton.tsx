"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { RefreshResult } from "@/hooks/useScenes";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { useToast } from "@/hooks/useToast";

export interface RefreshButtonProps {
  refreshing: boolean;
  onRefresh: () => Promise<RefreshResult>;
  className?: string;
}

const IDLE = "ดึงข้อมูลใหม่";
const BUSY = ["กำลังคุยกับดาวเทียม…", "รอเมฆหลบแป๊บนะ…", "เกือบเสร็จแล้ว!"] as const;
const LABELS = [IDLE, ...BUSY];

/** หยดน้ำ 10 หยด พุ่งออกเป็นพัดด้านบน — มุม/ระยะคงที่เพื่อให้ผลเหมือนกันทุกครั้ง */
const DROPS = Array.from({ length: 10 }, (_, i) => {
  const angle = -170 + (i * 160) / 9 + (i % 2 ? 6 : -6); // องศา: -170..-10 (ด้านบน)
  const dist = 30 + ((i * 7) % 4) * 8;
  const rad = (angle * Math.PI) / 180;
  return {
    dx: Math.cos(rad) * dist,
    dy: Math.sin(rad) * dist,
    rot: angle + 90,
    delay: (i % 3) * 30,
    light: i % 3 === 0,
  };
});

/**
 * ปุ่มดึงข้อมูลดาวเทียม
 * ระหว่างดึง: ไอคอนหมุน + ข้อความเปลี่ยนทุก 2 วินาที
 * สำเร็จ: หยดน้ำกระจาย + toast, ผิดพลาด: ปุ่มส่าย + toast
 */
export default function RefreshButton({ refreshing, onRefresh, className }: RefreshButtonProps) {
  const { toast } = useToast();
  const reduce = usePrefersReducedMotion();
  const [msg, setMsg] = useState(0);
  const [burst, setBurst] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!refreshing) return;
    setMsg(0);
    const t = window.setInterval(() => setMsg((m) => Math.min(m + 1, BUSY.length - 1)), 2000);
    return () => window.clearInterval(t);
  }, [refreshing]);

  useEffect(() => {
    if (!burst) return;
    const t = window.setTimeout(() => setBurst(0), 900);
    return () => window.clearTimeout(t);
  }, [burst]);

  const run = async () => {
    if (refreshing) return;
    setShake(false);
    const r = await onRefresh();
    if (r.ok) {
      if (r.added > 0) {
        if (!reduce) setBurst(Date.now());
        toast(`ได้ภาพใหม่ ${r.added} ภาพ`, { tone: "success" });
      } else {
        toast("ยังไม่มีภาพใหม่ ดาวเทียมจะผ่านอีกใน ~5 วัน", { icon: "satellite" });
      }
    } else {
      setShake(true);
      toast("ดึงข้อมูลไม่สำเร็จ ดูรายละเอียดด้านบนแล้วลองอีกครั้ง", { tone: "error" });
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
        "relative inline-flex min-h-11 items-center justify-center gap-2.5 rounded-lg bg-primary px-4 text-[15px] font-medium whitespace-nowrap text-white sm:min-h-10",
        "motion-safe:transition-[background-color,scale] motion-safe:duration-150 hover:bg-primary-hover",
        refreshing ? "cursor-progress" : "active:scale-[0.97]",
        shake && "shake",
        className,
      )}
    >
      <span aria-hidden="true" className="relative grid size-5 shrink-0 place-items-center">
        {refreshing ? <Icon name="refresh" spin /> : <Icon name="satelliteDish" />}
        {burst > 0 && (
          <span key={burst} className="pointer-events-none absolute inset-0">
            {DROPS.map((d, i) => (
              <span
                key={i}
                className={cn("droplet", d.light ? "text-series-2" : "text-primary")}
                style={
                  {
                    "--dx": `${d.dx}px`,
                    "--dy": `${d.dy}px`,
                    "--rot": `${d.rot}deg`,
                    "--delay": `${d.delay}ms`,
                  } as CSSProperties
                }
              >
                <Icon name="droplet" size={14} className="drop-shadow-[0_0_1px_#fff]" />
              </span>
            ))}
          </span>
        )}
      </span>

      {/* วางข้อความทุกแบบซ้อนในช่องเดียว ปุ่มจึงกว้างเท่าข้อความยาวสุดเสมอ ไม่ทำให้เลย์เอาต์ขยับ */}
      <span aria-hidden="true" className="grid">
        {LABELS.map((l) => (
          <span
            key={l}
            className={cn(
              "col-start-1 row-start-1 text-left motion-safe:transition-opacity motion-safe:duration-200",
              l === current ? "opacity-100" : "invisible opacity-0",
            )}
          >
            {l}
          </span>
        ))}
      </span>
      <span className="sr-only">{refreshing ? "กำลังดึงข้อมูลจากดาวเทียม" : IDLE}</span>
    </button>
  );
}
