import Icon from "@/components/ui/Icon";
import { fmtDate } from "@/lib/format";
import { fmtIndex } from "@/lib/indices";
import type { Scene } from "@/lib/types";

export interface BuoyBubbleProps {
  buoyId: string;
  scene: Scene | null;
}

const ROWS = [
  { key: "NDTI", label: "NDTI ความขุ่น" },
  { key: "NDCI", label: "NDCI คลอโรฟิลล์" },
  { key: "NDWI", label: "NDWI ความเป็นน้ำ" },
  { key: "B8A_B3", label: "B8A/B3" },
] as const;

/** เนื้อหาในกรอบคำพูดของทุ่น: แนะนำตัว + ค่าดัชนีของภาพที่เลือกที่จุดทุ่น */
export default function BuoyBubble({ buoyId, scene }: BuoyBubbleProps) {
  return (
    <div className="w-56 pr-5">
      <p className="font-display text-[15px] leading-snug font-medium text-ink">
        ฉันคือทุ่น {buoyId} <Icon name="buoy" className="align-[-0.15em] text-accent" />
        <br />
        ยังไม่ได้ลงน้ำนะ!
      </p>
      {!scene ? (
        <p className="mt-2 text-[13px] text-muted">เลือกภาพจากรายการเพื่อดูค่าตรงจุดนี้</p>
      ) : !scene.buoy_has_data ? (
        <p className="mt-2 text-[13px] text-muted">ภาพวันที่ {fmtDate(scene.datetime)} มีเมฆบังตรงที่ฉันอยู่ เลยยังไม่มีค่า</p>
      ) : (
        <>
          <p className="mt-2 text-xs text-muted">ค่าจากภาพวันที่ {fmtDate(scene.datetime)}</p>
          <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 text-[13px] tabular-nums">
            {ROWS.map((r) => (
              <div key={r.key} className="contents">
                <dt className="text-body">{r.label}</dt>
                <dd className="text-right font-medium text-ink">{fmtIndex(scene.buoy?.[r.key])}</dd>
              </div>
            ))}
          </dl>
          {scene.est && (
            <p className="mt-1.5 text-xs text-muted tabular-nums">
              ≈ {fmtIndex(scene.est.turbidity_fnu, 1)} FNU, คลอโรฟิลล์ ≈ {fmtIndex(scene.est.chla_ugl, 1)} µg/L
            </p>
          )}
        </>
      )}
    </div>
  );
}
