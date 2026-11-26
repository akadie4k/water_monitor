"use client";

import { useEffect, useState } from "react";
import type { IconName } from "@/lib/icons";
import { greeting, greetingIcon } from "@/lib/user";

/**
 * คำทักทายตามเวลาของเครื่องผู้ใช้ — คำนวณหลัง mount เท่านั้น
 * (ตอน render ฝั่ง server ไม่รู้เวลาเครื่องผู้ใช้ จึงใช้ "สวัสดี" ไปก่อนเพื่อไม่ให้ hydration ไม่ตรงกัน)
 */
export function useGreeting(): { text: string; icon: IconName } {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 10 * 60 * 1000);
    return () => window.clearInterval(t);
  }, []);
  if (!now) return { text: "สวัสดี", icon: "hello" };
  return { text: greeting(now), icon: greetingIcon(now) };
}
