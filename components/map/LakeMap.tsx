"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import type { Map as MlMap, Marker, StyleSpecification } from "maplibre-gl";
import type { BBox } from "@/lib/types";
import type { MapOverlay } from "@/hooks/useOverlay";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { themeColor } from "@/lib/theme";

export type Basemap = "osm" | "sat";

export interface LakeMapHandle {
  /** บินกลับไปให้เห็นทั้งสระ */
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LakeMapProps {
  center: [number, number];
  aoi?: { type: string; coordinates: unknown } | null;
  fitBBox?: BBox | null;
  /** เว้นขอบให้พ้นแผงที่ลอยทับแผนที่ */
  fitPadding: Padding;
  overlay?: MapOverlay | null;
  overlayOpacity?: number;
  basemap: Basemap;
  buoy?: { lon: number; lat: number } | null;
  buoyName: string;
  /** เนื้อหาในกรอบเมื่อกดหมุดทุ่น */
  buoyPopup?: ReactNode;
  /** ใช้ prop ชื่ออื่นแทน `ref` เพราะคอมโพเนนต์นี้โหลดผ่าน next/dynamic */
  controlRef?: RefObject<LakeMapHandle | null>;
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
    { id: "osm", type: "raster", source: "osm", paint: { "raster-saturation": -0.55, "raster-brightness-max": 0.97 } },
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

/** แผนที่เต็มกรอบ: ภาพดาวเทียมซ้อน + ขอบเขตสระ + หมุดทุ่น */
export default function LakeMap({
  center, aoi, fitBBox, fitPadding, overlay, overlayOpacity = 0.85, basemap, buoy, buoyName, buoyPopup, controlRef,
}: LakeMapProps) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const libRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const markerEl = useRef<HTMLButtonElement | null>(null);
  const lastOverlayUrl = useRef<string | null>(null);
  const fitRef = useRef<BBox | null | undefined>(fitBBox);
  fitRef.current = fitBBox;
  const padRef = useRef(fitPadding);
  padRef.current = fitPadding;
  const reduce = usePrefersReducedMotion();
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;
  const buoyRef = useRef(buoy);
  buoyRef.current = buoy;

  const [ready, setReady] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [bubbleEl] = useState(() => (typeof document === "undefined" ? null : document.createElement("div")));

  /** ป้ายชื่อทุ่นสลับไปซ้ายเมื่อหมุดชิดขอบขวา */
  const placeLabel = (map: MlMap) => {
    const el = markerEl.current;
    const b = buoyRef.current;
    if (!el || !b) return;
    el.classList.toggle("buoy-pin--flip", map.project([b.lon, b.lat]).x > map.getContainer().clientWidth - 140);
  };

  const fit = useCallback((animate: boolean) => {
    const map = mapRef.current;
    const b = fitRef.current;
    if (!map || !b) return;
    const el = map.getContainer();
    const p = padRef.current;
    // กันขอบรวมกันเกินขนาดแผนที่ (จอเตี้ย) — MapLibre จะเตือนและไม่ซูม
    const sx = Math.min(1, (el.clientWidth - 80) / Math.max(1, p.left + p.right));
    const sy = Math.min(1, (el.clientHeight - 80) / Math.max(1, p.top + p.bottom));
    map.fitBounds([[b[0], b[1]], [b[2], b[3]]], {
      padding: { top: p.top * sy, bottom: p.bottom * sy, left: p.left * sx, right: p.right * sx },
      maxZoom: 17,
      duration: animate && !reduceRef.current ? 600 : 0,
    });
  }, []);

  useImperativeHandle(
    controlRef,
    () => ({
      resetView: () => fit(true),
      zoomIn: () => mapRef.current?.zoomIn({ duration: reduceRef.current ? 0 : 250 }),
      zoomOut: () => mapRef.current?.zoomOut({ duration: reduceRef.current ? 0 : 250 }),
    }),
    [fit],
  );

  // สร้างแผนที่ครั้งเดียว
  useEffect(() => {
    let cancelled = false;
    let ro: ResizeObserver | undefined;
    (async () => {
      const mod = await import("maplibre-gl");
      const lib = ((mod as unknown as { default?: typeof mod }).default ?? mod) as typeof mod;
      if (cancelled || !box.current) return;
      libRef.current = lib;
      const map = new lib.Map({
        container: box.current,
        style: STYLE,
        center,
        zoom: 15.5,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        fadeDuration: reduceRef.current ? 0 : 250,
      });
      map.touchZoomRotate.disableRotation();
      map.addControl(new lib.ScaleControl({ unit: "metric", maxWidth: 110 }), "bottom-right");
      map.on("load", () => !cancelled && setReady(true));
      map.on("move", () => placeLabel(map));
      map.on("error", (e) => {
        const err = (e as { error?: { name?: string } }).error;
        if (err?.name === "AbortError") return; // ยกเลิกภาพเก่าตอนเปลี่ยนภาพ เป็นเรื่องปกติ
        console.error(err ?? e);
      });
      mapRef.current = map;
      const syncSize = () => {
        if (map.getPixelRatio() !== window.devicePixelRatio) map.setPixelRatio(window.devicePixelRatio);
        map.resize();
      };
      ro = new ResizeObserver(syncSize);
      ro.observe(box.current);
    })();
    return () => {
      cancelled = true;
      ro?.disconnect();
      markerRef.current?.remove();
      markerRef.current = null;
      markerEl.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      lastOverlayUrl.current = null;
      setReady(false);
    };
    // ค่า center ใช้ตอนสร้างเท่านั้น
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // แผนที่ฐาน + สีเส้นขอบสระให้อ่านออกบนพื้นแต่ละแบบ
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    map.setLayoutProperty("osm", "visibility", basemap === "osm" ? "visible" : "none");
    map.setLayoutProperty("sat", "visibility", basemap === "sat" ? "visible" : "none");
    if (map.getLayer("aoi-line")) map.setPaintProperty("aoi-line", "line-color", basemap === "osm" ? themeColor("night") : "#ffffff");
  }, [ready, basemap]);

  // ขอบเขตสระ
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
    map.addLayer({
      id: "aoi-line",
      type: "line",
      source: "aoi",
      paint: { "line-color": basemap === "osm" ? themeColor("night") : "#ffffff", "line-width": 1.6, "line-dasharray": [3, 2] },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, aoi]);

  // ซูมให้เห็นทั้งสระ (ครั้งแรก และเมื่อขนาดแผงเปลี่ยน เช่น หมุนจอ)
  const padKey = `${fitPadding.top},${fitPadding.right},${fitPadding.bottom},${fitPadding.left}`;
  useEffect(() => {
    if (ready && fitBBox) fit(false);
  }, [ready, fitBBox, padKey, fit]);

  // ภาพดาวเทียมซ้อน (อยู่ใต้เส้นขอบ)
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
      if (lastOverlayUrl.current !== overlay.url) existing.updateImage({ url: overlay.url, coordinates });
      map.setLayoutProperty("ov", "visibility", "visible");
    } else {
      map.addSource("ov", { type: "image", url: overlay.url, coordinates });
      map.addLayer(
        { id: "ov", type: "raster", source: "ov", paint: { "raster-opacity": overlayOpacity, "raster-fade-duration": 0 } },
        map.getLayer("aoi-line") ? "aoi-line" : undefined,
      );
    }
    lastOverlayUrl.current = overlay.url;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, overlay]);

  useEffect(() => {
    const map = mapRef.current;
    if (ready && map?.getLayer("ov")) map.setPaintProperty("ov", "raster-opacity", overlayOpacity);
  }, [ready, overlayOpacity]);

  // หมุดทุ่น
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
        '<span class="buoy-pin__ring" aria-hidden="true"></span><span class="buoy-pin__ring buoy-pin__ring--late" aria-hidden="true"></span>' +
        '<span class="buoy-pin__dot" aria-hidden="true"></span>' +
        `<span class="buoy-pin__label" aria-hidden="true">${buoyName}</span>`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setBubbleOpen((v) => !v);
      });
      markerEl.current = el;
      markerRef.current = new lib.Marker({ element: el, anchor: "center" }).setLngLat([buoy.lon, buoy.lat]).addTo(map);
      placeLabel(map);
    } else {
      markerRef.current.setLngLat([buoy.lon, buoy.lat]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, buoy]);

  // กรอบข้อมูลของทุ่น
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    markerEl.current?.setAttribute("aria-expanded", String(bubbleOpen));
    if (!ready || !map || !lib || !buoy || !bubbleOpen || !bubbleEl) return;
    const popup = new lib.Popup({ anchor: "bottom", offset: 20, closeButton: true, closeOnClick: true, maxWidth: "300px", focusAfterOpen: false })
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
    <>
      <div
        ref={box}
        // ใช้ inline style: maplibre-gl.css ตั้ง .maplibregl-map { position: relative } นอก @layer ของ Tailwind v4 จึงชนะ utility class
        style={{ position: "absolute", inset: 0 }}
        role="region"
        aria-label="แผนที่สระพร้อมภาพดาวเทียมซ้อน"
      />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted" aria-hidden="true">
          กำลังโหลดแผนที่…
        </div>
      )}
      {bubbleEl && buoyPopup ? createPortal(buoyPopup, bubbleEl) : null}
    </>
  );
}
