import type { BadgeTone } from "@/components/ui/Badge";

import type { OverlayKind, Scene } from "./types";

export type RampKind = Exclude<OverlayKind, "truecolor">;

export interface IndexRamp {
  /** ชื่อสั้นที่แสดง */
  short: string;
  name: string;
  unit: string;
  digits: number;
  min: number;
  max: number;
  palette: readonly string[];
  lowLabel: string;
  highLabel: string;
  note: string;
  /** ค่าประมาณจากสูตร (ยังไม่สอบเทียบ) */
  estimate: boolean;
  read: (s: Scene) => number | null | undefined;
}

const TURB_PALETTE = ["#2c7bb6", "#abd9e9", "#ffffbf", "#fdae61", "#a6611a"] as const;
const CHL_PALETTE = ["#2c7bb6", "#abd9e9", "#d9f0a3", "#78c679", "#238443", "#004529"] as const;

/** สเกลสีของภาพซ้อน — ต้องตรงกับ VIS ใน backend/app/gee_client.py */
export const RAMPS: Record<RampKind, IndexRamp> = {
  ndti: {
    short: "NDTI", name: "NDTI ความขุ่น", unit: "", digits: 3, min: -0.2, max: 0.3, palette: TURB_PALETTE,
    lowLabel: "ใส", highLabel: "ขุ่น", estimate: false,
    note: "(B4−B3)/(B4+B3) ดัชนีไม่มีหน่วย ยิ่งสูงยิ่งมีตะกอนมาก",
    read: (s) => s.buoy?.NDTI,
  },
  turb: {
    short: "ความขุ่น", name: "ความขุ่นโดยประมาณ", unit: "FNU", digits: 1, min: 0, max: 50, palette: TURB_PALETTE,
    lowLabel: "ใส", highLabel: "ขุ่น", estimate: true,
    note: "",
    read: (s) => s.est?.turbidity_fnu,
  },
  ndci: {
    short: "NDCI", name: "NDCI คลอโรฟิลล์", unit: "", digits: 3, min: -0.1, max: 0.3, palette: CHL_PALETTE,
    lowLabel: "สาหร่ายน้อย", highLabel: "สาหร่ายมาก", estimate: false,
    note: "(B5−B4)/(B5+B4) ดัชนีไม่มีหน่วย ยิ่งสูงยิ่งมีคลอโรฟิลล์-a มาก",
    read: (s) => s.buoy?.NDCI,
  },
  chla: {
    short: "คลอโรฟิลล์-a", name: "คลอโรฟิลล์-a โดยประมาณ", unit: "µg/L", digits: 1, min: 0, max: 60, palette: CHL_PALETTE,
    lowLabel: "น้อย", highLabel: "มาก", estimate: true,
    note: "",
    read: (s) => s.est?.chla_ugl,
  },
};

/** คงไว้ให้โค้ดเดิมที่อ้าง NDTI_RAMP */
export const NDTI_RAMP = RAMPS.ndti;

/** เกณฑ์ภาพโปร่งขั้นต่ำที่ใช้กรองรายการ */
export const MIN_CLEAR_FRAC = 0.3;

export function clearPct(clearFrac: number): number {
  return Math.round(clearFrac * 100);
}

/** สีป้าย % โปร่ง: น้ำเงิน ≥70, เหลืองอำพัน 30–69, แดง <30 */
export function clearTone(pct: number): BadgeTone {
  if (pct >= 70) return "good";
  if (pct >= 30) return "warn";
  return "bad";
}

export function fmtIndex(v: number | null | undefined, digits = 3): string {
  return v == null || Number.isNaN(v) ? "–" : v.toFixed(digits);
}
