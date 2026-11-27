import type { ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/lib/icons";
import { toDate } from "@/lib/format";
import { RAMPS, clearPct, clearTone, fmtIndex, type RampKind } from "@/lib/indices";
import type { OverlayKind, Scene } from "@/lib/types";
import { cn } from "@/lib/cn";

const BIG_DATE = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "long", year: "numeric" });
const TIME = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit" });

const READOUTS: ReadonlyArray<{ kind: RampKind; label: string }> = [
  { kind: "ndti", label: "NDTI" },
  { kind: "turb", label: "ความขุ่น" },
  { kind: "ndci", label: "NDCI" },
  { kind: "chla", label: "คลอโรฟิลล์-a" },
];

const SKY: Record<ReturnType<typeof clearTone>, { icon: IconName; bar: string; text: string }> = {
  good: { icon: "sun", bar: "bg-lake-light", text: "ฟ้าโปร่ง" },
  warn: { icon: "cloudSun", bar: "bg-buoy", text: "มีเมฆบางส่วน" },
  bad: { icon: "cloud", bar: "bg-[#ff8a80]", text: "เมฆมาก" },
};

export interface SceneCardProps {
  scene: Scene | null;
  kind: OverlayKind;
  loading: boolean;
  /** ปุ่มดึงภาพใหม่ + เวลาที่ดึงล่าสุด */
  footer?: ReactNode;
  className?: string;
}

/** การ์ดสีกลางคืน: วันที่ของภาพที่เลือก ฟ้าโปร่งแค่ไหน และค่าที่จุดทุ่น */
export default function SceneCard({ scene, kind, loading, footer, className }: SceneCardProps) {
  const pct = scene ? clearPct(scene.clear_frac) : 0;
  const sky = SKY[clearTone(pct)];

  return (
    <section aria-label="ภาพที่เลือก" className={cn("panel-night p-5", className)}>
      {loading ? (
        <div className="space-y-3" aria-hidden="true">
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-9 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-24 animate-pulse rounded-xl bg-white/10" />
        </div>
      ) : !scene ? (
        <div>
          <p className="text-lg font-semibold text-white">ยังไม่มีภาพ</p>
          <p className="mt-1 text-sm text-[#a9b6cf]">กดดึงภาพใหม่ ระบบจะเรียกภาพ Sentinel-2 ย้อนหลังของสระนี้มาให้</p>
        </div>
      ) : (
        <>
          <p className="text-[13px] text-[#a9b6cf]">ภาพดาวเทียมวันที่</p>
          <h2 className="mt-0.5 text-[28px] leading-tight font-semibold text-white">{BIG_DATE.format(toDate(scene.datetime))}</h2>
          <p className="mt-1 text-[13px] text-[#a9b6cf] tabular-nums">
            ผ่านเมื่อ {TIME.format(toDate(scene.datetime))} น. ไทล์ {scene.tile}
          </p>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="flex items-center gap-2 text-white">
                <Icon name={sky.icon} size={14} />
                {sky.text}เหนือสระ
              </span>
              <span className="font-semibold text-white tabular-nums">{pct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/12" aria-hidden="true">
              <div className={cn("h-full rounded-full", sky.bar)} style={{ width: `${pct}%` }} />
            </div>
          </div>

          {scene.buoy_has_data ? (
            <dl className="mt-5 grid grid-cols-2 gap-2">
              {READOUTS.map((r) => {
                const ramp = RAMPS[r.kind];
                const v = ramp.read(scene);
                const on = kind === r.kind;
                return (
                  <div
                    key={r.kind}
                    className={cn(
                      "rounded-2xl px-3 py-2.5 transition-colors",
                      on ? "bg-white text-ink" : "bg-night-2 text-white",
                    )}
                  >
                    <dt className={cn("text-xs", on ? "text-muted" : "text-[#a9b6cf]")}>{r.label}</dt>
                    <dd className="mt-0.5 flex items-baseline gap-1 tabular-nums">
                      <span className="text-[22px] leading-none font-semibold">
                        {ramp.estimate && v != null ? "≈" : ""}
                        {fmtIndex(v, ramp.digits)}
                      </span>
                      {ramp.unit && <span className={cn("text-xs", on ? "text-muted" : "text-[#a9b6cf]")}>{ramp.unit}</span>}
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : (
            <p className="mt-5 rounded-2xl bg-night-2 px-4 py-3 text-sm text-[#d6def0]">
              เมฆบังตรงจุดวางทุ่นในภาพนี้ เลยยังอ่านค่าไม่ได้ ลองเลือกวันที่ฟ้าโปร่งกว่านี้จากแถบด้านล่าง
            </p>
          )}
          <p className="mt-2 text-xs text-[#a9b6cf]">ค่าเฉลี่ยในรัศมี 15 ม. รอบจุดวางทุ่น ตัวเลขที่มี ≈ เป็นค่าประมาณ</p>
        </>
      )}

      {footer && <div className="mt-5 border-t border-white/10 pt-4">{footer}</div>}
    </section>
  );
}
