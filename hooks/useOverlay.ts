"use client";

import { useEffect, useRef, useState } from "react";
import { abs, api } from "@/lib/api";
import type { BBox, OverlayKind, Scene } from "@/lib/types";

export interface MapOverlay {
  url: string;
  bbox: BBox;
}

export interface UseOverlay {
  overlay: MapOverlay | null;
  /** กำลังสร้างภาพที่ Earth Engine (ภาพที่ยังไม่เคยสร้าง) */
  loading: boolean;
  error: string | null;
}

/**
 * หา URL ภาพซ้อนแผนที่ของภาพที่เลือก
 * ใช้ของที่ backend สร้างไว้แล้วก่อน ถ้ายังไม่มีจึงขอให้สร้างใหม่ (จำผลไว้ในหน่วยความจำ)
 */
export function useOverlay(scene: Scene | null, kind: OverlayKind, bbox: BBox | undefined): UseOverlay {
  const cache = useRef(new Map<string, string>());
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (!scene) {
      setUrl(null);
      setLoading(false);
      return;
    }
    const key = `${scene.image_id}:${kind}`;
    const known = scene.overlays?.[kind] ?? cache.current.get(key);
    if (known) {
      setUrl(abs(known));
      setLoading(false);
      return;
    }
    let cancelled = false;
    setUrl(null);
    setLoading(true);
    api
      .overlay(scene.image_id, kind)
      .then((o) => {
        cache.current.set(key, o.url);
        if (!cancelled) setUrl(abs(o.url));
      })
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [scene, kind]);

  return { overlay: url && bbox ? { url, bbox } : null, loading, error };
}
