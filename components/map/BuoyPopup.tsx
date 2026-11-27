import { fmtDate } from "@/lib/format";
import { fmtIndex } from "@/lib/indices";
import type { Scene } from "@/lib/types";

const ROWS = [
  { key: "NDTI", label: "NDTI ความขุ่น" },
  { key: "NDCI", label: "NDCI คลอโรฟิลล์" },
  { key: "NDWI", label: "NDWI ความเป็นน้ำ" },
  { key: "B8A_B3", label: "B8A/B3" },
] as const;

/** เนื้อหาเมื่อกดหมุดทุ่น: ทุ่นแนะนำตัว + ค่าดัชนีของภาพที่เลือก */
export default function BuoyPopup({ buoyId, scene }: { buoyId: string; scene: Scene | null }) {
  return (
    <div className="w-60 pr-6 font-sans">
      <p className="text-[15px] leading-snug font-semibold text-ink">ทุ่น {buoyId}</p>
      <p className="text-[13px] text-muted">ยังไม่ได้ลงน้ำจริง ตอนนี้อ่านค่าจากดาวเทียมแทน</p>
      {!scene ? (
        <p className="mt-2 text-[13px] text-muted">เลือกวันที่จากแถบด้านล่างเพื่อดูค่าตรงจุดนี้</p>
      ) : !scene.buoy_has_data ? (
        <p className="mt-2 text-[13px] text-body">ภาพวันที่ {fmtDate(scene.datetime)} มีเมฆบังจุดนี้ เลยยังไม่มีค่า</p>
      ) : (
        <>
          <p className="mt-3 text-xs text-muted">ค่าจากภาพวันที่ {fmtDate(scene.datetime)}</p>
          <dl className="mt-1 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-[13px] tabular-nums">
            {ROWS.map((r) => (
              <div key={r.key} className="contents">
                <dt className="text-body">{r.label}</dt>
                <dd className="text-right font-semibold text-ink">{fmtIndex(scene.buoy?.[r.key])}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  );
}
