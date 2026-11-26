"use client";

import { useCallback, useSyncExternalStore } from "react";

/** ติดตาม media query ฝั่ง browser (ฝั่ง server คืน `serverValue`) */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** ผู้ใช้ตั้งค่าลดการเคลื่อนไหว — ฝั่ง server ถือว่า "ลด" ไว้ก่อน เพื่อไม่เริ่มแอนิเมชันก่อนรู้ค่า */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)", true);
}

/** อุปกรณ์มีเมาส์และคีย์บอร์ด (เดสก์ท็อป) */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
