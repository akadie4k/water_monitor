import type { Aoi, OverlayKind, SceneStore } from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

/** แปลง path ที่ backend ส่งมา (เช่น /overlays/x.png) เป็น URL เต็ม */
export const abs = (u: string) => (/^https?:/.test(u) ? u : API_URL + u);

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function j<T>(path: string, init?: RequestInit): Promise<T> {
  let r: Response;
  try {
    r = await fetch(API_URL + path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(`ต่อ backend ไม่ได้ (${API_URL}) — รัน uvicorn อยู่หรือเปล่า?`, 0);
  }
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new ApiError((body as { detail?: string }).detail || `HTTP ${r.status}`, r.status);
  return body as T;
}

export const api = {
  aoi: () => j<Aoi>("/api/aoi"),
  scenes: () => j<SceneStore>("/api/satellite/scenes"),
  refresh: () => j<{ fetched: number; new_overlays: number }>("/api/satellite/refresh", { method: "POST" }),
  overlay: (imageId: string, kind: OverlayKind) =>
    j<{ url: string; bbox: number[] }>(`/api/satellite/overlay/${imageId}?kind=${kind}`),
};
