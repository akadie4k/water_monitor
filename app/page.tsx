"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import BuoyPopup from "@/components/map/BuoyPopup";
import type { Basemap, LakeMapHandle, Padding } from "@/components/map/LakeMap";
import LayerPanel from "@/components/panels/LayerPanel";
import SceneCard from "@/components/panels/SceneCard";
import RefreshButton from "@/components/scenes/RefreshButton";
import TimelineDock from "@/components/scenes/TimelineDock";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useFinePointer, useMediaQuery } from "@/hooks/useMediaQuery";
import { useOverlay } from "@/hooks/useOverlay";
import { useSceneKeyboard } from "@/hooks/useSceneKeyboard";
import { useScenes } from "@/hooks/useScenes";
import { fmtDateTime } from "@/lib/format";
import { RAMPS } from "@/lib/indices";
import type { OverlayKind, Scene } from "@/lib/types";
import { cn } from "@/lib/cn";

const LakeMap = dynamic(() => import("@/components/map/LakeMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-[#dfe6f1]" />,
});

const DEFAULT_CENTER: [number, number] = [99.88226, 8.638917];
const BUOY_ID = "WBP-01";
const HINT_KEY = "swb:hint:scene-keys";
const PLAY_MS = 1500;

export default function Home() {
  const s = useScenes();
  const { toast } = useToast();
  const finePointer = useFinePointer();
  const desktop = useMediaQuery("(min-width: 1280px)");
  const [kind, setKind] = useState<OverlayKind>("ndti");
  const [opacity, setOpacity] = useState(0.85);
  const [basemap, setBasemap] = useState<Basemap>("sat");
  const [chartOpen, setChartOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ov = useOverlay(s.selected, kind, s.store?.aoi_bbox);
  const mapCtl = useRef<LakeMapHandle | null>(null);

  const buoy = s.store?.buoy ?? null;
  const allScenes = s.store?.scenes ?? [];
  const enabledIds = useMemo(() => new Set(s.scenes.map((x) => x.image_id)), [s.scenes]);

  // เลือกเอง = หยุดเล่นไล่ภาพ
  const { select } = s;
  const pick = useCallback(
    (scene: Scene) => {
      setPlaying(false);
      select(scene);
    },
    [select],
  );

  /** dir = +1 ใหม่กว่า, -1 เก่ากว่า (s.scenes เรียงใหม่→เก่า) */
  const step = useCallback(
    (dir: -1 | 1, list: Scene[], cur: string | null): Scene | null => {
      if (list.length === 0) return null;
      const i = list.findIndex((x) => x.image_id === cur);
      if (i === -1) return list[0];
      return list[i - dir] ?? null;
    },
    [],
  );

  useSceneKeyboard({ scenes: s.scenes, selectedId: s.selected?.image_id ?? null, onSelect: pick });

  // เล่นไล่ภาพจากเก่าไปใหม่
  const playState = useRef({ list: s.scenes, cur: s.selected?.image_id ?? null });
  playState.current = { list: s.scenes, cur: s.selected?.image_id ?? null };
  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => {
      const { list, cur } = playState.current;
      const next = step(1, list, cur);
      if (!next) {
        setPlaying(false);
        return;
      }
      select(next);
    }, PLAY_MS);
    return () => window.clearInterval(t);
  }, [playing, select, step]);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    const { list, cur } = playState.current;
    // อยู่ภาพใหม่สุดแล้ว: เริ่มจากภาพเก่าสุด
    if (list.length && (list[0].image_id === cur || !cur)) select(list[list.length - 1]);
    setPlaying(true);
  };

  // บอกครั้งเดียวว่ากดลูกศรเปลี่ยนภาพได้ (เฉพาะเครื่องที่มีคีย์บอร์ด)
  const hasMany = !s.loading && s.scenes.length > 1;
  useEffect(() => {
    if (!hasMany || !finePointer) return;
    try {
      if (window.localStorage.getItem(HINT_KEY)) return;
    } catch {
      return;
    }
    const t = window.setTimeout(() => {
      toast("กด ← → เพื่อเปลี่ยนวันที่ได้เลย", { icon: "keyboard" });
      try {
        window.localStorage.setItem(HINT_KEY, "1");
      } catch {
        /* storage ถูกบล็อก รอบหน้าแสดงอีกก็ไม่เป็นไร */
      }
    }, 1500);
    return () => window.clearTimeout(t);
  }, [hasMany, finePointer, toast]);

  // เว้นขอบให้พ้นปุ่มซูม (ขวาบน) และสเกลสีย่อ (ซ้ายล่างบนมือถือ)
  const padding: Padding = desktop
    ? { top: 40, left: 40, right: 72, bottom: 40 }
    : { top: 24, left: 24, right: 64, bottom: 56 };

  const ramp = kind === "truecolor" ? null : RAMPS[kind];

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <RefreshButton refreshing={s.refreshing} onRefresh={s.refresh} />
      <p className="text-xs text-[#a9b6cf]">
        {s.store?.updated_at ? <>ดึงล่าสุด {fmtDateTime(s.store.updated_at)} น.</> : "ยังไม่เคยดึงข้อมูล"}
      </p>
    </div>
  );

  return (
    <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 p-3 sm:gap-4 sm:p-5">
      <TopBar onPlaceClick={() => mapCtl.current?.resetView()} />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)_340px] xl:items-start">
        {/* กรอบแผนที่ (มือถืออยู่บนสุด, เดสก์ท็อปอยู่กลาง) */}
        <div className="relative h-[60svh] min-h-[380px] overflow-hidden rounded-panel bg-[#dfe6f1] shadow-float md:col-span-2 md:h-[min(62svh,640px)] xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:h-[clamp(520px,calc(100dvh-280px),860px)]">
          <LakeMap
            center={buoy ? [buoy.lon, buoy.lat] : DEFAULT_CENTER}
            aoi={s.aoi?.geometry}
            fitBBox={s.store?.aoi_bbox}
            fitPadding={padding}
            overlay={ov.overlay}
            overlayOpacity={opacity}
            basemap={basemap}
            buoy={buoy}
            buoyName={`ทุ่น ${BUOY_ID}`}
            buoyPopup={<BuoyPopup buoyId={BUOY_ID} scene={s.selected} />}
            controlRef={mapCtl}
          />

          {s.status && (
            <div
              role={s.status.tone === "error" ? "alert" : "status"}
              className={cn(
                "absolute top-3 left-1/2 z-20 flex w-[min(520px,calc(100%-96px))] -translate-x-1/2 items-start gap-3 rounded-2xl px-4 py-3 text-sm shadow-float",
                s.status.tone === "error" ? "bg-bad-soft text-bad" : "bg-night text-white",
              )}
            >
              <Icon name={s.status.tone === "error" ? "error" : "refresh"} spin={s.status.tone !== "error"} size={14} className="mt-0.5" />
              <p className="min-w-0 flex-1">{s.status.message}</p>
              {!s.refreshing && (
                <button type="button" onClick={s.dismissStatus} aria-label="ปิดข้อความ" className="-m-1 grid size-8 place-items-center rounded-lg hover:bg-black/5">
                  <Icon name="close" size={13} />
                </button>
              )}
            </div>
          )}

          <MapControls ctl={mapCtl} className="absolute top-3 right-3 z-10 flex flex-col" />

          {/* สเกลสีย่อบนแผนที่ (จอเล็ก — จอกว้างดูในแผงชั้นข้อมูลข้างๆ) */}
          {ramp && (
            <div className="absolute bottom-3 left-3 z-10 w-44 rounded-xl bg-white/90 px-2.5 py-2 text-[11px] shadow-float backdrop-blur xl:hidden">
              <span className="block h-1.5 rounded-full" style={{ background: `linear-gradient(90deg, ${ramp.palette.join(",")})` }} />
              <span className="mt-1 flex justify-between text-muted">
                <span>{ramp.lowLabel}</span>
                <span>{ramp.highLabel}</span>
              </span>
            </div>
          )}
        </div>

        <SceneCard
          scene={s.selected}
          kind={kind}
          loading={s.loading}
          footer={footer}
          className="order-2 md:self-start xl:order-none xl:col-start-1 xl:row-start-1"
        />

        <LayerPanel
          kind={kind}
          onKind={setKind}
          opacity={opacity}
          onOpacity={setOpacity}
          basemap={basemap}
          onBasemap={setBasemap}
          loading={ov.loading}
          error={ov.error}
          className="order-3 md:self-start xl:order-none xl:col-start-3 xl:row-start-1"
        />

        <TimelineDock
          className="order-1 md:col-span-2 xl:order-none xl:col-span-3 xl:row-start-2"
          allScenes={allScenes}
          enabledIds={enabledIds}
          selected={s.selected}
          onSelect={pick}
          onStep={(d) => {
            const next = step(d, s.scenes, s.selected?.image_id ?? null);
            if (next) pick(next);
          }}
          playing={playing}
          onTogglePlay={togglePlay}
          onlyClear={s.onlyClear}
          onOnlyClear={s.setOnlyClear}
          chartOpen={chartOpen}
          onChartOpen={setChartOpen}
          loading={s.loading}
          empty={
            <p className="rounded-xl bg-haze px-4 py-6 text-center text-sm text-muted">
              {s.loadError ? (
                <>
                  ต่อ backend ไม่ได้: {s.loadError}{" "}
                  <button type="button" onClick={s.reload} className="font-semibold text-lake underline underline-offset-2">
                    ลองอีกครั้ง
                  </button>
                </>
              ) : (
                "ยังไม่มีภาพ กดดึงภาพใหม่ในการ์ดวันที่"
              )}
            </p>
          }
        />
      </div>
    </main>
  );
}

function MapControls({ ctl, className }: { ctl: React.RefObject<LakeMapHandle | null>; className?: string }) {
  const btn = "grid size-11 place-items-center text-ink transition-colors hover:bg-lake-soft hover:text-lake";
  return (
    <div className={cn("overflow-hidden rounded-2xl bg-white/95 shadow-float backdrop-blur", className)}>
      <button type="button" aria-label="ซูมเข้า" title="ซูมเข้า" onClick={() => ctl.current?.zoomIn()} className={btn}>
        <Icon name="zoomIn" size={14} />
      </button>
      <button type="button" aria-label="ซูมออก" title="ซูมออก" onClick={() => ctl.current?.zoomOut()} className={btn}>
        <Icon name="zoomOut" size={14} />
      </button>
      <button type="button" aria-label="กลับไปดูทั้งสระ" title="กลับไปดูทั้งสระ" onClick={() => ctl.current?.resetView()} className={btn}>
        <Icon name="resetView" size={14} />
      </button>
    </div>
  );
}
