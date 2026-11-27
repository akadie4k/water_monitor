"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import Icon from "./Icon";
import type { IconName } from "@/lib/icons";
import { cn } from "@/lib/cn";

export type ToastTone = "info" | "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
  icon?: IconName;
}

interface ToastApi {
  toast: (message: string, opts?: { tone?: ToastTone; icon?: IconName }) => void;
}

const Ctx = createContext<ToastApi | null>(null);

const TONE: Record<ToastTone, { icon: IconName; cls: string }> = {
  info: { icon: "info", cls: "text-lake-light" },
  success: { icon: "success", cls: "text-lake-light" },
  error: { icon: "error", cls: "text-[#ff8a80]" },
};

/** แจ้งเตือนสั้นๆ กลางล่าง หายเองใน 3.5 วินาที */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const toast = useCallback<ToastApi["toast"]>((message, opts) => {
    const id = ++seq.current;
    setItems((xs) => [...xs.slice(-2), { id, message, tone: opts?.tone ?? "info", icon: opts?.icon }]);
    window.setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3500);
  }, []);

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-50 flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className="toast-in pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-night py-2.5 pr-5 pl-4 text-sm text-white shadow-float"
          >
            <Icon name={t.icon ?? TONE[t.tone].icon} size={16} className={cn(TONE[t.tone].cls)} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastApi {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast ต้องอยู่ภายใน ToastProvider");
  return c;
}
