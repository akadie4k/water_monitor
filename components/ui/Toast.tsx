"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { IconName } from "@/lib/icons";

export type ToastTone = "info" | "success" | "error";

export interface ToastOptions {
  tone?: ToastTone;
  /** ms ก่อนหายเอง (ค่าเริ่มต้น 3000) */
  duration?: number;
  /** ไอคอนหน้าข้อความ (ค่าเริ่มต้นตาม tone) */
  icon?: IconName;
}

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  duration: number;
  icon: IconName;
}

export interface ToastApi {
  toast: (message: string, opts?: ToastOptions) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

const MAX = 3;

const TONE_ICON: Record<ToastTone, IconName> = {
  info: "info",
  success: "success",
  error: "error",
};

const TONE: Record<ToastTone, string> = {
  info: "bg-ink text-white",
  success: "bg-primary text-white",
  error: "bg-bad text-white",
};

/** ครอบแอปไว้ที่ layout — แสดงข้อความแจ้งสั้นๆ ซ้อนกันได้สูงสุด 3 อัน */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);

  const toast = useCallback((message: string, opts?: ToastOptions) => {
    const item: ToastItem = {
      id: nextId.current++,
      message,
      tone: opts?.tone ?? "info",
      duration: opts?.duration ?? 3000,
      icon: opts?.icon ?? TONE_ICON[opts?.tone ?? "info"],
    };
    setItems((xs) => [...xs, item].slice(-MAX));
  }, []);

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4",
          "pb-[max(1rem,env(safe-area-inset-bottom))] md:inset-x-auto md:right-0 md:items-end md:px-6 md:pb-6",
        )}
      >
        {items.map((t) => (
          <Toast key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => onDismiss(item.id), item.duration);
    return () => window.clearTimeout(t);
  }, [paused, item.id, item.duration, onDismiss]);

  return (
    <div
      role={item.tone === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        "toast-in pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-xl py-2 pr-1.5 pl-3.5 text-sm",
        "shadow-[0_12px_32px_-12px_color-mix(in_srgb,var(--color-ink)_55%,transparent)]",
        TONE[item.tone],
      )}
    >
      <Icon name={item.icon} />
      <p className="min-w-0 flex-1 py-1">{item.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="ปิดข้อความ"
        className="grid size-9 shrink-0 place-items-center rounded-lg text-white/75 hover:bg-white/15 hover:text-white focus-visible:outline-white"
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}
