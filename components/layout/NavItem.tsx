"use client";

import Link from "next/link";
import { useId } from "react";
import Icon from "@/components/ui/Icon";
import { SOON_HINT, SOON_ICON, type NavItemConfig } from "./navItems";
import { cn } from "@/lib/cn";

export interface NavItemProps {
  item: NavItemConfig;
  current: boolean;
  /** bar = แถบแนวนอนใน header, list = แถวในเมนู "เพิ่มเติม" หรือ drawer */
  variant: "bar" | "list";
  /** เรียกหลังกดลิงก์ (ใช้ปิดเมนู) */
  onNavigate?: () => void;
  className?: string;
}

/** สีของเมนูที่ยังไม่เปิด: จางลงเล็กน้อย แต่ยังอ่านออก */
const SOON = "cursor-default text-muted/80 hover:text-muted focus-visible:text-muted";

export default function NavItem({ item, current, variant, onNavigate, className }: NavItemProps) {
  const tipId = useId();
  const soon = item.status === "soon";

  if (variant === "bar") {
    const base = cn(
      "group relative flex h-12 items-center gap-1.5 rounded-md px-2.5 text-sm whitespace-nowrap",
      "after:absolute after:inset-x-2.5 after:-bottom-px after:h-[3px] after:rounded-full",
      className,
    );
    if (soon) {
      return (
        <button
          type="button"
          aria-disabled="true"
          aria-describedby={tipId}
          onClick={(e) => e.preventDefault()}
          className={cn(base, SOON)}
        >
          <Icon name={item.icon} />
          {item.label}
          <span
            id={tipId}
            role="tooltip"
            className={cn(
              "pointer-events-none absolute top-full left-1/2 z-40 mt-1 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs text-white shadow-lg",
              "before:absolute before:-top-1 before:left-1/2 before:size-2 before:-translate-x-1/2 before:rotate-45 before:bg-ink",
              "invisible translate-y-1 opacity-0 motion-safe:transition-[opacity,translate] motion-safe:duration-150",
              "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
              "group-focus-visible:visible group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
            )}
          >
            <Icon name={SOON_ICON} size={14} className="mr-1.5" />
            {SOON_HINT}
          </span>
        </button>
      );
    }
    return (
      <Link
        href={item.href}
        aria-current={current ? "page" : undefined}
        onClick={onNavigate}
        className={cn(
          base,
          current
            ? "font-medium text-primary after:bg-accent"
            : "text-body hover:bg-primary-soft hover:text-primary",
        )}
      >
        <Icon name={item.icon} />
        {item.label}
      </Link>
    );
  }

  // list — คำใบ้แสดงท้ายแถวเมื่อชี้หรือโฟกัส (อยู่ในแถวเสมอ จึงไม่ถูกกล่องเลื่อนตัดและไม่ดันเลย์เอาต์)
  const row = cn("flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[15px]", className);
  if (soon) {
    return (
      <button
        type="button"
        aria-disabled="true"
        aria-describedby={tipId}
        onClick={(e) => e.preventDefault()}
        className={cn(row, "group", SOON)}
      >
        <Icon name={item.icon} />
        <span className="flex-1">{item.label}</span>
        <span
          id={tipId}
          className="flex items-center gap-1.5 text-xs whitespace-nowrap opacity-0 motion-safe:transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <Icon name={SOON_ICON} size={14} />
          {SOON_HINT}
        </span>
      </button>
    );
  }
  return (
    <Link
      href={item.href}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        row,
        current
          ? "bg-primary-soft font-medium text-primary shadow-[inset_3px_0_0_var(--color-accent)]"
          : "text-body hover:bg-primary-soft hover:text-primary",
      )}
    >
      <Icon name={item.icon} />
      <span className="flex-1">{item.label}</span>
    </Link>
  );
}
