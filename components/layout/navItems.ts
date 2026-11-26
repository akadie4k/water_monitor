import type { IconName } from "@/lib/icons";

export type NavStatus = "active" | "soon";

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: IconName;
  /** "active" = เปิดใช้แล้ว, "soon" = ยังไม่มีหน้า (แสดงแต่กดไม่ได้) */
  status: NavStatus;
  /** แสดงในแถบเมนูที่จอขนาดกลาง (768–1279px); ที่เหลืออยู่ใต้ "เพิ่มเติม" */
  primary: boolean;
}

/**
 * เมนูหลักของระบบ เรียงตามลำดับที่แสดง
 * เปิดหน้าใหม่: สร้าง app/<path>/page.tsx แล้วเปลี่ยน status ของรายการนั้นเป็น "active"
 */
export const NAV_ITEMS: readonly NavItemConfig[] = [
  { id: "overview", label: "ภาพรวม", href: "/overview", icon: "overview", status: "soon", primary: true },
  { id: "satellite", label: "ภาพดาวเทียม", href: "/", icon: "satellite", status: "active", primary: true },
  { id: "live", label: "ข้อมูลทุ่นเรียลไทม์", href: "/live", icon: "buoy", status: "soon", primary: true },
  { id: "forecast", label: "พยากรณ์", href: "/forecast", icon: "forecast", status: "soon", primary: false },
  { id: "alerts", label: "แจ้งเตือน", href: "/alerts", icon: "alert", status: "soon", primary: true },
  { id: "devices", label: "อุปกรณ์", href: "/devices", icon: "device", status: "soon", primary: false },
  { id: "reports", label: "รายงาน / ส่งออก", href: "/reports", icon: "report", status: "soon", primary: false },
  { id: "developers", label: "API สำหรับนักวิจัย", href: "/developers", icon: "api", status: "soon", primary: false },
];

export const SOON_HINT = "กำลังสร้างอยู่นะ";
/** ไอคอนที่แสดงคู่กับ SOON_HINT */
export const SOON_ICON = "construction" as const;

export function isCurrent(item: NavItemConfig, pathname: string): boolean {
  if (item.status !== "active") return false;
  return item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/");
}
