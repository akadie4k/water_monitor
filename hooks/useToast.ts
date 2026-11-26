"use client";

import { useContext } from "react";
import { ToastContext, type ToastApi } from "@/components/ui/Toast";

/** เรียก `toast("ข้อความ", { tone })` จากคอมโพเนนต์ใดก็ได้ใต้ <ToastProvider> */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast ต้องใช้ภายใน <ToastProvider>");
  return ctx;
}
