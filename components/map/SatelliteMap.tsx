"use client";

import { useEffect, useImperativeHandle, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { Map as MlMap, Marker, Popup, StyleSpecification } from "maplibre-gl";
import type { BBox } from "@/lib/types";
import type { MapOverlay } from "@/hooks/useOverlay";
import { cn } from "@/lib/cn";
import { themeColor } from "@/lib/theme";
import { useFinePointer } from "@/hooks/useMediaQuery";

export type Basemap = "osm" | "sat";

/** คำสั่งที่หน้าเรียกใช้กับแผนที่ได้ (ส่งผ่าน `controlRef`) */
export interface SatelliteMapHandle {
  /** บินกลับไปให้เห็นขอบเขตแหล่งน้ำทั้งหมด */
  resetView: () => void;
}

export interface SatelliteMapProps {
  center: [number, number];
  zoom?: number;
  /** ขอบเขตแหล่งน้ำ (GeoJSON geometry) */
  aoi?: { type: string; coordinates: unknown } | null;
  fitBBox?: BBox | null;
  overlay?: MapOverlay | null;
  overlayOpacity?: number;
  basemap: Basemap;
  buoy?: { lon: number; lat: number } | null;
  /** ชื่อทุ่นสำหรับ screen reader */
  buoyName?: string;
  /** เนื้อหาในกรอบคำพูดเมื่อกดหมุดทุ่น */
  buoyPopup?: ReactNode;
  /** ใช้ prop ชื่ออื่นแทน `ref` เพราะคอมโพเนนต์นี้โหลดผ่าน next/dynamic */
  controlRef?: RefObject<SatelliteMapHandle | null>;
  className?: string;
  /** ส่วนควบคุมที่วางซ้อนบนแผนที่ */
  children?: ReactNode;
}

const STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "© OpenStreetMap contributors",
    },
    sat: {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      maxzoom: 19,
      attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [
    { id: "osm", type: "raster", source: "osm" },
    { id: "sat", type: "raster", source: "sat", layout: { visibility: "none" } },
  ],
};

type Corners = [[number, number], [number, number], [number, number], [number, number]];
const corners = (b: BBox): Corners => [[b[0], b[3]], [b[2], b[3]], [b[2], b[1]], [b[0], b[1]]];

interface ImageSourceLike {
  updateImage: (o: { url: string; coordinates: Corners }) => void;
}
interface GeoJsonSourceLike {
  setData: (d: GeoJSON.Feature) => void;
}

/** แผนที่ MapLibre: ขอบเขตแหล่งน้ำ + ภาพดาวเทียมซ้อน + หมุดจุดวางทุ่น */
export default function SatelliteMap({
  center, zoom = 15.5, aoi, fitBBox, overlay, overlayOpacity = 0.85, basemap, buoy, buoyName = "ทุ่น", buoyPopup,
  controlRef, className, children,
}: SatelliteMapProps) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const lastOverlayUrl = useRef<string | null>(null);
  const libRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const markerEl = useRef<HTMLButtonElement | null>(null);
  const fitRef = useRef<BBox | null | undefined>(fitBBox);
  const coordBox = useRef<HTMLDivElement>(null);
  const coordText = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  // กล่องที่ MapLibre วางไว้ในกรอบคำพูด — React เติมเนื้อหาด้วย portal
  const [bubbleEl] = useState(() => document.createElement("div"));
  const finePointer = useFinePointer();
  fitRef.current = fitBBox;

  useImperativeHandle(controlRef, () => ({
    resetView() {
      const map = mapRef.current;
      const b = fitRef.current;
      if (!map || !b) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 40, maxZoom: 17, duration: reduce ? 0 : 400 });
    },
  }), []);

  // สร้างแผนที่ครั้งเดียว + ปรับขนาดตามกล่อง
  useEffect(() => {
    let cancelled = false;
    let ro: ResizeObserver | undefined;
    (async () => {
      const mod = await import("maplibre-gl");
      // maplibre-gl เป็น UMD: บาง bundler ใส่ไว้ใน default
      const lib = ((mod as unknown as { default?: typeof mod }).default ?? mod) as typeof mod;
      if (cancelled || !box.current) return;
      libRef.current = lib;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const map = new lib.Map({
        container: box.current,
        style: STYLE,
        center,
        zoom,
        attributionControl: { compact: true },
        cooperativeGestures: false,
        fadeDuration: reduceMotion ? 0 : 300,
      });
      map.addControl(new lib.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new lib.ScaleControl({ unit: "metric" }), "bottom-left");
      map.on("load", () => !cancelled && setReady(true));
      // เปลี่ยนภาพซ้อนระหว่างที่ภาพเก่ายังโหลดไม่เสร็จ MapLibre จะยกเลิกคำขอเก่า (AbortError)
      // ซึ่งเป็นเรื่องปกติ ไม่ต้องแสดงเป็น error; error อื่นยังแสดงตามเดิม
      map.on("error", (e) => {
        const err = (e as { error?: { name?: string } }).error;
        if (err?.name === "AbortError") return;
        console.error(err ?? e);
      });
      // พิกัดใต้เคอร์เซอร์ (แก้ DOM ตรงๆ ไม่ re-render ทุกครั้งที่ขยับเมาส์)
      map.on("mousemove", (e) => {
        if (!coordText.current || !coordBox.current) return;
        coordText.current.textContent = `${e.lngLat.lat.toFixed(5)}, ${e.lngLat.lng.toFixed(5)}`;
        coordBox.current.style.opacity = "1";
      });
      map.getCanvas().addEventListener("mouseleave", () => {
        if (coordBox.current) coordBox.current.style.opacity = "0";
      });
      mapRef.current = map;
      ro = new ResizeObserver(() => map.resize());
      ro.observe(box.current);
    })();
    return () => {
      cancelled = true;
      ro?.disconnect();
      markerRef.current?.remove();
      markerRef.current = null;
      markerEl.current = null;
      mapRef.current?.remove();
      lastOverlayUrl.current = null;
      mapRef.current = null;
      setReady(false);
    };
    // สร้างครั้งเดียว ค่า center/zoom ใช้เป็นค่าเริ่มต้นเท่านั้น
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // แผนที่ฐาน
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setLayoutProperty("osm", "visibility", basemap === "osm" ? "visible" : "none");
    map.setLayoutProperty("sat", "visibility", basemap === "sat" ? "visible" : "none");
  }, [ready, basemap]);

  // ขอบเขตแหล่งน้ำ
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !aoi) return;
    const data: GeoJSON.Feature = { type: "Feature", properties: {}, geometry: aoi as GeoJSON.Geometry };
    const src = map.getSource("aoi") as unknown as GeoJsonSourceLike | undefined;
    if (src) {
      src.setData(data);
      return;
    }
    map.addSource("aoi", { type: "geojson", data });
    map.addLayer({ id: "aoi-fill", type: "fill", source: "aoi", paint: { "fill-color": themeColor("primary"), "fill-opacity": 0.05 } });
    map.addLayer({
      id: "aoi-line",
      type: "line",
      source: "aoi",
      paint: { "line-color": themeColor("ink"), "line-width": 1.6, "line-dasharray": [3, 2] },
    });
  }, [ready, aoi]);

  // ซูมให้พอดีขอบเขต
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map || !fitBBox) return;
    map.fitBounds([[fitBBox[0], fitBBox[1]], [fitBBox[2], fitBBox[3]]], { padding: 40, duration: 0, maxZoom: 17 });
  }, [ready, fitBBox]);

  // ภาพดาวเทียมซ้อน (วางใต้เส้นขอบเขต)
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    if (!overlay) {
      if (map.getLayer("ov")) map.setLayoutProperty("ov", "visibility", "none");
      return;
    }
    const coordinates = corners(overlay.bbox);
    const existing = map.getSource("ov") as unknown as ImageSourceLike | undefined;
    if (existing) {
      // ภาพเดิมอยู่แล้ว ไม่ต้องโหลดซ้ำ (กันการยกเลิกคำขอโดยไม่จำเป็น)
      if (lastOverlayUrl.current !== overlay.url) existing.updateImage({ url: overlay.url, coordinates });
      map.setLayoutProperty("ov", "visibility", "visible");
    } else {
      map.addSource("ov", { type: "image", url: overlay.url, coordinates });
      map.addLayer(
        { id: "ov", type: "raster", source: "ov", paint: { "raster-opacity": overlayOpacity, "raster-fade-duration": 0 } },
        map.getLayer("aoi-fill") ? "aoi-fill" : undefined,
      );
    }
    lastOverlayUrl.current = overlay.url;
    // ความทึบจัดการแยกด้านล่าง
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, overlay]);

  useEffect(() => {
    const map = mapRef.current;
    if (ready && map?.getLayer("ov")) map.setPaintProperty("ov", "raster-opacity", overlayOpacity);
  }, [ready, overlayOpacity]);

  // หมุดจุดวางทุ่น
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!ready || !map || !lib) return;
    if (!buoy) {
      markerRef.current?.remove();
      markerRef.current = null;
      markerEl.current = null;
      setBubbleOpen(false);
      return;
    }
    if (!markerRef.current) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "buoy-pin";
      el.setAttribute("aria-label", `${buoyName} กดเพื่อดูค่าที่จุดทุ่น`);
      el.setAttribute("aria-expanded", "false");
      el.innerHTML =
        '<span class="buoy-pin__float" aria-hidden="true">' +
        '<span class="buoy-pin__ripple"></span><span class="buoy-pin__ripple buoy-pin__ripple--late"></span>' +
        '<span class="buoy-pin__dot"></span></span>' +
        '<span class="buoy-pin__label" aria-hidden="true">จุดวางทุ่น</span>';
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setBubbleOpen((v) => !v);
      });
      el.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setBubbleOpen(false);
      });
      markerEl.current = el;
      markerRef.current = new lib.Marker({ element: el, anchor: "left", offset: [-8, 0] }).setLngLat([buoy.lon, buoy.lat]).addTo(map);
    } else {
      markerRef.current.setLngLat([buoy.lon, buoy.lat]);
    }
    // ชื่อทุ่นใช้ตอนสร้างหมุดเท่านั้น
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, buoy]);

  // กรอบคำพูดของทุ่น
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    markerEl.current?.setAttribute("aria-expanded", String(bubbleOpen));
    if (!ready || !map || !lib || !buoy || !bubbleOpen) return;
    const popup = new lib.Popup({
      anchor: "bottom",
      offset: 16,
      closeButton: true,
      closeOnClick: true,
      maxWidth: "280px",
      className: "buoy-bubble",
      focusAfterOpen: false,
    })
      .setLngLat([buoy.lon, buoy.lat])
      .setDOMContent(bubbleEl)
      .addTo(map);
    const onClose = () => setBubbleOpen(false);
    popup.on("close", onClose);
    const root = popup.getElement();
    root?.querySelector(".maplibregl-popup-close-button")?.setAttribute("aria-label", "ปิด");
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setBubbleOpen(false);
      markerEl.current?.focus();
    };
    root?.addEventListener("keydown", onKey);
    return () => {
      root?.removeEventListener("keydown", onKey);
      popup.off("close", onClose);
      popup.remove();
    };
  }, [ready, buoy, bubbleOpen, bubbleEl]);

  return (
    <div className={cn("relative isolate overflow-hidden bg-border-soft", className)}>
      <div
        ref={box}
        // ใช้ inline style แทน class "absolute inset-0": maplibre-gl.css ตั้ง .maplibregl-map { position: relative }
        // นอก @layer ของ Tailwind v4 จึงชนะ utility class ทำให้กล่องแผนที่สูง 0 และมองไม่เห็นแผนที่
        style={{ position: "absolute", inset: 0 }}
        role="region"
        aria-label="แผนที่แหล่งน้ำพร้อมภาพดาวเทียมซ้อน"
      />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center text-sm text-muted" aria-hidden="true">
          กำลังโหลดแผนที่…
        </div>
      )}
      {children}
      {finePointer && (
        <div
          ref={coordBox}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-9 left-2.5 z-10 hidden rounded-md bg-white/90 px-2 py-0.5 text-xs text-body tabular-nums shadow-[0_0_0_1px_var(--color-border)] motion-safe:transition-opacity md:block"
          style={{ opacity: 0 }}
        >
          <span ref={coordText} />
        </div>
      )}
      {createPortal(buoyPopup, bubbleEl)}
    </div>
  );
}
