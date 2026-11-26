"use client";

import { useEffect, useId, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import type { IconName } from "@/lib/icons";
import UserAvatar from "./UserAvatar";
import { SOON_HINT, SOON_ICON } from "./navItems";
import { cn } from "@/lib/cn";
import { CURRENT_USER } from "@/lib/user";

export interface UserMenuProps {
  className?: string;
}

const ITEMS: ReadonlyArray<{ label: string; icon: IconName }> = [
  { label: "ตั้งค่า", icon: "settings" },
  { label: "ออกจากระบบ", icon: "signOut" },
];

/**
 * รูป + ชื่อผู้ใช้ที่มุมขวาบน กดแล้วเปิดเมนูเล็กๆ (ยังเป็นตัวจองที่ไว้ ทุกรายการกดไม่ได้)
 * <768px แสดงเฉพาะรูป
 */
export default function UserMenu({ className }: UserMenuProps) {
  const user = CURRENT_USER;
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const items = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    items.current[0]?.focus();
    const onPointer = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const onMenuKey = (e: React.KeyboardEvent) => {
    const list = items.current.filter((x): x is HTMLButtonElement => Boolean(x));
    const i = list.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      btn.current?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const d = e.key === "ArrowDown" ? 1 : -1;
      list[(i + d + list.length) % list.length]?.focus();
    } else if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      list[e.key === "Home" ? 0 : list.length - 1]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

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
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`บัญชีผู้ใช้: ${user.name}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "flex h-11 items-center gap-2 rounded-full p-1 text-sm text-ink md:pr-3",
          "motion-safe:transition-colors hover:bg-primary-soft",
          open && "bg-primary-soft",
        )}
      >
        <UserAvatar user={user} />
        <span className="hidden max-w-[12rem] truncate md:block">{user.name}</span>
        <Icon
          name="chevronDown"
          size={14}
          className={cn("hidden text-muted motion-safe:transition-transform md:block", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="เมนูผู้ใช้"
          onKeyDown={onMenuKey}
          className="pop-in absolute top-full right-0 z-40 mt-1.5 w-60 origin-top-right rounded-xl border border-border bg-surface p-1.5 shadow-[0_12px_32px_-12px_color-mix(in_srgb,var(--color-ink)_40%,transparent)]"
        >
          <div className="flex items-center gap-3 px-2.5 pt-1.5 pb-2.5">
            <UserAvatar user={user} className="size-10" />
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{user.name}</p>
              <p className="text-[13px] text-muted">{user.role}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-border-soft" role="separator" />
          {ITEMS.map(({ label, icon }, i) => (
            <button
              key={label}
              ref={(el) => {
                items.current[i] = el;
              }}
              type="button"
              role="menuitem"
              aria-disabled="true"
              tabIndex={-1}
              onClick={(e) => e.preventDefault()}
              className="group flex min-h-11 w-full cursor-default items-center justify-between gap-2 rounded-lg px-2.5 text-left text-sm text-muted hover:bg-border-soft/60 focus-visible:bg-border-soft/60 sm:min-h-9"
            >
              <span className="flex items-center gap-2.5">
                <Icon name={icon} />
                {label}
              </span>
              <span className="flex items-center gap-1.5 text-xs opacity-0 motion-safe:transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <Icon name={SOON_ICON} size={14} />
                {SOON_HINT}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
