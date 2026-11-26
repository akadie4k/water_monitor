"use client";

import { useEffect, useId, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import NavItem from "./NavItem";
import { isCurrent, type NavItemConfig } from "./navItems";
import { cn } from "@/lib/cn";

export interface NavMoreMenuProps {
  items: readonly NavItemConfig[];
  pathname: string;
  className?: string;
}

/** ปุ่ม "เพิ่มเติม" สำหรับจอขนาดกลาง เปิดรายการเมนูรอง ปิดด้วย Esc หรือคลิกนอกเมนู */
export default function NavMoreMenu({ items, pathname, className }: NavMoreMenuProps) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const hasCurrent = items.some((i) => isCurrent(i, pathname));

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrap}
      className={cn("relative", className)}
      onBlur={(e) => {
        if (!wrap.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={btn}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex h-12 items-center gap-1.5 rounded-md px-2.5 text-sm whitespace-nowrap",
          "after:absolute after:inset-x-2.5 after:-bottom-px after:h-[3px] after:rounded-full",
          hasCurrent ? "font-medium text-primary after:bg-accent" : "text-body hover:bg-primary-soft hover:text-primary",
          open && "bg-primary-soft text-primary",
        )}
      >
        <Icon name="more" />
        เพิ่มเติม
        <Icon name="chevronDown" size={14} className={cn("motion-safe:transition-transform", open && "rotate-180")} />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute top-full right-0 z-40 mt-1 w-72 rounded-xl border border-border bg-surface p-1.5 shadow-[0_12px_32px_-12px_color-mix(in_srgb,var(--color-ink)_40%,transparent)]"
      >
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => (
            <li key={item.id}>
              <NavItem item={item} variant="list" current={isCurrent(item, pathname)} onNavigate={() => setOpen(false)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
