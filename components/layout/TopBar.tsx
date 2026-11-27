"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { CURRENT_USER, userInitial } from "@/lib/user";

export interface TopBarProps {
  /** กดชื่อสถานที่ = บินกลับไปดูทั้งสระ */
  onPlaceClick: () => void;
}

/** แถบบนของหน้า: ช่องโลโก้, ชื่อสถานที่, ผู้ใช้ */
export default function TopBar({ onPlaceClick }: TopBarProps) {
  return (
    <header className="relative z-30 flex items-center gap-3">
      {/* TODO: แทนกล่องนี้ด้วย <img src="/brand/..." /> เมื่อมีโลโก้ */}
      <div
        aria-label="โลโก้"
        className="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] border-2 border-dashed border-night/25 bg-white text-[10px] font-semibold text-muted"
      >
        LOGO
      </div>

      <button
        type="button"
        onClick={onPlaceClick}
        title="กลับไปดูทั้งสระ"
        className="flex min-h-12 min-w-0 items-center gap-3 rounded-[14px] py-1.5 pr-4 pl-1 text-left transition-[background-color,transform] hover:bg-white active:scale-[0.98]"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lake-soft text-lake">
          <Icon name="location" size={14} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-base leading-tight font-semibold text-ink sm:text-lg">Walailak Botanic Park</span>
          <span className="block truncate text-xs text-muted">สระน้ำ ต.หัวตะพาน อ.ท่าศาลา จ.นครศรีธรรมราช</span>
        </span>
      </button>

      <UserChip />
    </header>
  );
}

function UserChip() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const u = CURRENT_USER;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative ml-auto shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-12 items-center gap-2.5 rounded-full bg-white p-1.5 shadow-float sm:pr-4"
      >
        {u.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={u.avatarUrl} alt="" className="size-9 rounded-full object-cover" />
        ) : (
          <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-night text-sm font-semibold text-white">
            {userInitial(u.name)}
          </span>
        )}
        <span className="hidden text-left sm:block">
          <span className="block text-sm leading-tight font-semibold text-ink">{u.name}</span>
          <span className="block text-xs leading-tight text-muted">{u.role}</span>
        </span>
        <span className="sr-only sm:hidden">{u.name}</span>
      </button>

      {open && (
        <div role="menu" className="drawer-in absolute top-full right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-float">
          <p className="px-3 pt-1.5 pb-2 text-sm">
            <span className="block font-semibold text-ink">{u.name}</span>
            <span className="text-muted">{u.role}</span>
          </p>
          {["ตั้งค่าบัญชี", "ออกจากระบบ"].map((t) => (
            <button
              key={t}
              type="button"
              role="menuitem"
              aria-disabled="true"
              title="ยังไม่มีระบบเข้าสู่ระบบ"
              className="flex min-h-10 w-full cursor-not-allowed items-center rounded-xl px-3 text-sm text-muted"
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
