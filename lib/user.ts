import type { IconName } from "@/lib/icons";

/**
 * ผู้ใช้ชั่วคราว — ยังไม่มีระบบเข้าสู่ระบบ
 * เมื่อมีระบบ auth แล้ว ให้แทนค่านี้ด้วยข้อมูลผู้ใช้จริง (ส่วนอื่นอ่านจากที่นี่ที่เดียว)
 */
export interface AppUser {
  name: string;
  role: string;
  avatarUrl?: string;
}

export const CURRENT_USER: AppUser = {
  name: "ผู้ใช้ทดสอบ",
  role: "เจ้าหน้าที่",
};

/** ตัวอักษรแรกของชื่อ ข้ามสระหน้า (เ แ โ ใ ไ) เพื่อให้ได้พยัญชนะ */
export function userInitial(name: string): string {
  const chars = Array.from(name.trim());
  const first = chars.find((c) => !/[เแโใไ]/.test(c)) ?? chars[0] ?? "?";
  return first.toUpperCase();
}

/** คำทักทายตามช่วงเวลาของเครื่องผู้ใช้ */
export function greeting(date: Date): string {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "สวัสดีตอนเช้า";
  if (h >= 12 && h < 17) return "สวัสดีตอนบ่าย";
  return "สวัสดีตอนเย็น";
}

/** ไอคอนคู่คำทักทาย: เช้า = แดด, บ่าย = แดดมีเมฆ, เย็น = พระจันทร์ */
export function greetingIcon(date: Date): IconName {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  return "evening";
}
