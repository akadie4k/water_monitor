"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { MIN_CLEAR_FRAC } from "@/lib/indices";
import type { Aoi, Scene, SceneStore } from "@/lib/types";
import type { StatusTone } from "@/components/ui/StatusBanner";

export interface Status {
  tone: StatusTone;
  message: string;
}

/** ผลการดึงข้อมูลรอบใหม่ — `added` = จำนวนภาพที่ยังไม่เคยมีในรายการ */
export type RefreshResult = { ok: true; added: number } | { ok: false; error: string };

export interface UseScenes {
  store: SceneStore | null;
  aoi: Aoi | null;
  /** รายการหลังกรอง (เรียงตามที่ backend ส่งมา) */
  scenes: Scene[];
  totalCount: number;
  loading: boolean;
  loadError: string | null;
  reload: () => void;
  onlyClear: boolean;
  setOnlyClear: (v: boolean) => void;
  selected: Scene | null;
  select: (scene: Scene) => void;
  refresh: () => Promise<RefreshResult>;
  refreshing: boolean;
  status: Status | null;
  dismissStatus: () => void;
}

const pickDefault = (s: SceneStore): Scene | null =>
  s.scenes.find((x) => x.overlays?.ndti) ?? s.scenes.find((x) => x.clear_frac >= MIN_CLEAR_FRAC) ?? s.scenes[0] ?? null;

/** โหลดรายการภาพ Sentinel-2 + ขอบเขตแหล่งน้ำ และสั่งดึงข้อมูลรอบใหม่ */
export function useScenes(): UseScenes {
  const [store, setStore] = useState<SceneStore | null>(null);
  const [aoi, setAoi] = useState<Aoi | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [onlyClear, setOnlyClear] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [attempt, setAttempt] = useState(0);
  const storeRef = useRef<SceneStore | null>(null);
  storeRef.current = store;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    api
      .scenes()
      .then((s) => {
        if (cancelled) return;
        setStore(s);
        setSelectedId((cur) => cur ?? pickDefault(s)?.image_id ?? null);
      })
      .catch((e: unknown) => !cancelled && setLoadError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false));
    api.aoi().then((a) => !cancelled && setAoi(a)).catch(() => {
      /* ไม่มีขอบเขตก็ยังใช้ bbox จาก scenes ได้ */
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const refresh = useCallback(async (): Promise<RefreshResult> => {
    setRefreshing(true);
    setStatus({ tone: "progress", message: "กำลังดึงข้อมูลจาก Earth Engine ครั้งแรกอาจใช้ 2–4 นาที" });
    const before = new Set((storeRef.current?.scenes ?? []).map((x) => x.image_id));
    try {
      await api.refresh();
      const s = await api.scenes();
      setStore(s);
      setLoadError(null);
      setSelectedId((cur) => (cur && s.scenes.some((x) => x.image_id === cur) ? cur : pickDefault(s)?.image_id ?? null));
      // ผลสำเร็จแจ้งด้วย toast ที่ปุ่ม ไม่ต้องค้างแถบสถานะไว้
      setStatus(null);
      return { ok: true, added: s.scenes.filter((x) => !before.has(x.image_id)).length };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      // ข้อความเต็มจาก backend ค้างไว้ให้อ่านได้ (toast หายใน 3 วินาที)
      setStatus({ tone: "error", message: error });
      return { ok: false, error };
    } finally {
      setRefreshing(false);
    }
  }, []);

  const scenes = useMemo(
    () => (store?.scenes ?? []).filter((s) => !onlyClear || s.clear_frac >= MIN_CLEAR_FRAC),
    [store, onlyClear],
  );

  const selected = useMemo(
    () => store?.scenes.find((s) => s.image_id === selectedId) ?? null,
    [store, selectedId],
  );

  return {
    store,
    aoi,
    scenes,
    totalCount: store?.scenes.length ?? 0,
    loading,
    loadError,
    reload: () => setAttempt((n) => n + 1),
    onlyClear,
    setOnlyClear,
    selected,
    select: (s) => setSelectedId(s.image_id),
    refresh,
    refreshing,
    status,
    dismissStatus: () => setStatus(null),
  };
}
