import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ICONS, type IconName } from "@/lib/icons";
import { cn } from "@/lib/cn";

export interface IconProps {
  name: IconName;
  /** ขนาดเป็น px (ค่าเริ่มต้น = ขนาดตัวอักษรรอบข้าง) */
  size?: number;
  spin?: boolean;
  className?: string;
  /** ใส่เมื่อไอคอนสื่อความหมายเอง (ไม่มีข้อความประกอบ) */
  label?: string;
}

/** ไอคอน Font Awesome — ทุกไอคอนในแอปต้องผ่านคอมโพเนนต์นี้ */
export default function Icon({ name, size, spin, className, label }: IconProps) {
  return (
    <FontAwesomeIcon
      icon={ICONS[name]}
      spin={spin}
      className={cn("shrink-0", className)}
      style={size ? { width: size, height: size, fontSize: size } : undefined}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}
