"use client";

import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import NavDrawer from "./NavDrawer";
import Icon from "@/components/ui/Icon";
import NavItem from "./NavItem";
import NavMoreMenu from "./NavMoreMenu";
import { NAV_ITEMS, isCurrent } from "./navItems";
import { cn } from "@/lib/cn";

export interface AppNavProps {
  /**
   * bar    = แถบเมนูแนวนอน (≥768px): ≥1280px แสดงครบ, 768–1279px แสดงรายการหลัก + "เพิ่มเติม"
   * mobile = ปุ่มแฮมเบอร์เกอร์ + drawer (<768px)
   */
  variant: "bar" | "mobile";
  className?: string;
}

export default function AppNav({ variant, className }: AppNavProps) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  if (variant === "mobile") {
    return (
      <div className={cn("md:hidden", className)}>
        <button
          ref={menuBtn}
          type="button"
          aria-label="เปิดเมนู"
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className="grid size-11 place-items-center rounded-lg text-ink hover:bg-primary-soft hover:text-primary"
        >
          <Icon name="menu" size={20} />
        </button>
        <NavDrawer
          open={open}
          onClose={close}
          items={NAV_ITEMS}
          pathname={pathname}
          returnFocusRef={menuBtn}
        />
      </div>
    );
  }

  const secondary = NAV_ITEMS.filter((i) => !i.primary);

  return (
    <nav aria-label="เมนูหลัก" className={cn("hidden md:block", className)}>
      <ul className="flex items-center gap-0.5">
        {NAV_ITEMS.map((item) => (
          <li key={item.id} className={cn(!item.primary && "hidden xl:block")}>
            <NavItem item={item} variant="bar" current={isCurrent(item, pathname)} />
          </li>
        ))}
        <li className="xl:hidden">
          <NavMoreMenu items={secondary} pathname={pathname} />
        </li>
      </ul>
    </nav>
  );
}
