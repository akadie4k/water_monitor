"use client";

import { useEffect, useRef, type RefObject } from "react";
import BrandLogo from "./BrandLogo";
import Icon from "@/components/ui/Icon";
import NavItem from "./NavItem";
import UserAvatar from "./UserAvatar";
import { isCurrent, type NavItemConfig } from "./navItems";
import { cn } from "@/lib/cn";
import { CURRENT_USER } from "@/lib/user";

export interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
  items: readonly NavItemConfig[];
  pathname: string;
  /** ปุ่มที่เปิด drawer — คืนโฟกัสให้เมื่อปิด */
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** เมนูเลื่อนเข้าจากขวาสำหรับจอ <768px: กักโฟกัสไว้ในเมนู ปิดด้วย Esc หรือแตะพื้นหลัง */
export default function NavDrawer({ open, onClose, items, pathname, returnFocusRef }: NavDrawerProps) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      closeBtn.current?.focus();
      return () => {
        document.body.style.overflow = prev;
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      returnFocusRef.current?.focus();
    }
  }, [open, returnFocusRef]);

  // ปิดเองเมื่อจอกว้างขึ้นจนไม่ใช้ drawer
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => mq.matches && onClose();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [open, onClose]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;
    const nodes = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className={cn("fixed inset-0 z-50 md:hidden", !open && "pointer-events-none")} inert={!open} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-ink/45 motion-safe:transition-opacity motion-safe:duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="เมนูหลัก"
        onKeyDown={onKeyDown}
        className={cn(
          "absolute inset-y-0 right-0 flex w-[min(20rem,86vw)] flex-col bg-surface shadow-2xl",
          "motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex h-16 items-center justify-between border-b border-border-soft px-4">
          <BrandLogo compact />
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="grid size-11 place-items-center rounded-lg text-body hover:bg-primary-soft hover:text-primary"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <nav aria-label="เมนูหลัก" className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
          <ul className="flex flex-col gap-0.5">
            {items.map((item) => (
              <li key={item.id}>
                <NavItem item={item} variant="list" current={isCurrent(item, pathname)} onNavigate={onClose} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3 border-t border-border-soft px-4 py-3">
          <UserAvatar />
          <div className="min-w-0 text-sm">
            <p className="truncate text-ink">{CURRENT_USER.name}</p>
            <p className="text-xs text-muted">{CURRENT_USER.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
