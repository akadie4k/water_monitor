"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./useMediaQuery";

/**
 * นับค่าจากค่าก่อนหน้าไปยังค่าใหม่ใน `ms` มิลลิวินาที (ease-out)
 * ค่า null แสดงทันที และถ้าผู้ใช้ตั้งลดการเคลื่อนไหวก็เปลี่ยนทันที
 */
export function useCountUp(value: number | null, ms = 400): number | null {
  const reduce = usePrefersReducedMotion();
  const [shown, setShown] = useState<number | null>(value);
  const from = useRef<number | null>(value);

  useEffect(() => {
    const start = from.current;
    if (value == null || start == null || reduce || start === value) {
      from.current = value;
      setShown(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = start + (value - start) * eased;
      from.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms, reduce]);

  return shown;
}
