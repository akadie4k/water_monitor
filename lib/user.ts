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
