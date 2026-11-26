import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/cn";
import { ICONS, type IconName } from "@/lib/icons";

export type IconSize = 14 | 16 | 20;

export interface IconProps {
  name: IconName;
  /** px — ใช้ได้เฉพาะ 14 / 16 / 20 */
  size?: IconSize;
  /** หมุนต่อเนื่อง (หยุดเองเมื่อผู้ใช้ตั้งค่าลดการเคลื่อนไหว) */
  spin?: boolean;
  /**
   * ใส่เมื่อไอคอนอยู่ลำพังและต้องสื่อความหมาย (ไม่มีข้อความข้างๆ)
   * ถ้าไม่ใส่ ไอคอนจะถูกซ่อนจาก screen reader (aria-hidden) เพราะถือว่ามีข้อความกำกับอยู่แล้ว
   */
  label?: string;
  /** กว้างเท่ากันทุกไอคอน (ค่าเริ่มต้น) — ใช้ในเมนู/รายการให้ข้อความตรงแนว */
  fixedWidth?: boolean;
  className?: string;
}

/** ไอคอนของแอป — สีตามข้อความ (currentColor) และจัดกึ่งกลางแนวตั้งกับข้อความ */
export default function Icon({ name, size = 16, spin = false, label, fixedWidth = true, className }: IconProps) {
  return (
    <FontAwesomeIcon
      icon={ICONS[name]}
      spin={spin}
      widthAuto={!fixedWidth}
      title={label}
      aria-hidden={label ? undefined : true}
      focusable={false}
      className={cn("shrink-0", className)}
      style={{ fontSize: size }}
    />
  );
}
