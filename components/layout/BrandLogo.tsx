import Link from "next/link";
import { cn } from "@/lib/cn";

export interface BrandLogoProps {
  /** compact = เฉพาะช่องไอคอน 40×40 (ไม่มีพื้นที่ wordmark) */
  compact?: boolean;
  className?: string;
}

/**
 * ช่องโลโก้ของระบบ
 *
 * TODO(logo): ยังไม่มีโลโก้จริง — ตอนนี้เป็นกรอบเส้นประจองพื้นที่ไว้
 *   เมื่อได้ไฟล์ SVG แล้ว ให้แทนเนื้อหาใน <Link> ด้วย
 *     - ไอคอน 40×40 (แสดงทุกขนาดจอ)
 *     - wordmark กว้างไม่เกิน 120px สูง 40px (ซ่อนเมื่อ compact)
 *   แก้เฉพาะไฟล์นี้ ส่วนอื่นของ header ไม่ต้องแก้
 */
export default function BrandLogo({ compact = false, className }: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label="Smart Water Buoy หน้าแรก"
      className={cn("inline-flex h-11 shrink-0 items-center gap-2 rounded-md", className)}
    >
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-md border border-dashed border-muted/60 text-[10px] font-medium tracking-wider text-muted"
      >
        LOGO
      </span>
      {!compact && (
        <span
          aria-hidden="true"
          className="hidden h-10 w-[120px] items-center rounded-md border border-dashed border-border px-2 text-[11px] text-muted lg:flex"
        >
          Smart Water Buoy
        </span>
      )}
    </Link>
  );
}
