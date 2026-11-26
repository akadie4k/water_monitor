"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import BasemapSwitch from "@/components/map/BasemapSwitch";
import BuoyBubble from "@/components/map/BuoyBubble";
import LocationChip from "@/components/map/LocationChip";
import OverlayControls from "@/components/map/OverlayControls";
import type { Basemap, SatelliteMapHandle } from "@/components/map/SatelliteMap";
import RefreshButton from "@/components/scenes/RefreshButton";
import SceneFilter from "@/components/scenes/SceneFilter";
import SceneList from "@/components/scenes/SceneList";
import SceneTimeline from "@/components/scenes/SceneTimeline";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Icon from "@/components/ui/Icon";
import Skeleton from "@/components/ui/Skeleton";
import StatusBanner from "@/components/ui/StatusBanner";
import { useGreeting } from "@/hooks/useGreeting";
import { useFinePointer } from "@/hooks/useMediaQuery";
import { useOverlay } from "@/hooks/useOverlay";
import { useSceneKeyboard } from "@/hooks/useSceneKeyboard";
import { useScenes } from "@/hooks/useScenes";
import { useToast } from "@/hooks/useToast";
import { fmtDateTime } from "@/lib/format";
import type { OverlayKind, Scene } from "@/lib/types";
import { CURRENT_USER } from "@/lib/user";

const SatelliteMap = dynamic(() => import("@/components/map/SatelliteMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});
const IndexTimeSeries = dynamic(() => import("@/components/charts/IndexTimeSeries"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const DEFAULT_CENTER: [number, number] = [99.88226, 8.638917];
const BUOY_ID = "WBP-01";
const HINT_KEY = "swb:hint:scene-keys";

export default function SatellitePage() {
  const s = useScenes();
  const { toast } = useToast();
  const hello = useGreeting();
  const finePointer = useFinePointer();
  const [kind, setKind] = useState<OverlayKind>("ndti");
  const [opacity, setOpacity] = useState(0.85);
  const [basemap, setBasemap] = useState<Basemap>("osm");
  const ov = useOverlay(s.selected, kind, s.store?.aoi_bbox);
  const mapCtl = useRef<SatelliteMapHandle | null>(null);
  // เพิ่มค่าเมื่อเปลี่ยนภาพจากคีย์บอร์ด/ไทม์ไลน์ เพื่อให้รายการเลื่อนการ์ดที่เลือกมาให้เห็น
  const [scrollKey, setScrollKey] = useState(0);

  const buoy = s.store?.buoy ?? null;
  const withData = s.store?.scenes.filter((x) => x.buoy_has_data).length ?? 0;
  const allScenes = s.store?.scenes ?? [];

  const { select } = s;
  const selectAndReveal = useCallback(
    (scene: Scene) => {
      select(scene);
      setScrollKey((k) => k + 1);
    },
    [select],
  );

  useSceneKeyboard({ scenes: s.scenes, selectedId: s.selected?.image_id ?? null, onSelect: selectAndReveal });

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
      toast("ลองกด ← → เพื่อเปลี่ยนภาพได้นะ", { icon: "keyboard" });
      try {
        window.localStorage.setItem(HINT_KEY, "1");
      } catch {
        /* โหมดส่วนตัว/บล็อก storage — แสดงอีกครั้งรอบหน้าก็ไม่เป็นไร */
      }
    }, 1200);
    return () => window.clearTimeout(t);
  }, [hasMany, finePointer, toast]);

  const refreshButton = <RefreshButton refreshing={s.refreshing} onRefresh={s.refresh} />;

  return (
    <>
      <PageHeader
        title={
          <>
            {hello.text}, {CURRENT_USER.name}{" "}
            <Icon name={hello.icon} size={20} className="align-[-0.1em] text-accent" />
          </>
        }
        meta={[
          `ภาพดาวเทียม Sentinel-2 · ${s.store?.updated_at ? `ดึงล่าสุด ${fmtDateTime(s.store.updated_at)}` : "ยังไม่เคยดึงข้อมูล"}`,
        ]}
        actions={refreshButton}
      />

      {s.status && (
        <StatusBanner
          tone={s.status.tone}
          message={s.status.message}
          onDismiss={s.refreshing ? undefined : s.dismissStatus}
          className="mb-4"
        />
      )}

      <div className="grid gap-4 lg:h-[max(640px,calc(100dvh-14rem))] lg:grid-cols-[minmax(300px,340px)_minmax(0,1fr)]">
        <div className="flex min-h-0 min-w-0 flex-col gap-3 lg:col-start-2 lg:row-start-1">
          <section
            aria-label="แผนที่"
            className="h-[60vh] min-h-[340px] overflow-hidden rounded-xl border border-border sm:h-[62vh] lg:h-auto lg:min-h-0 lg:flex-1"
          >
            <SatelliteMap
              className="h-full w-full"
              center={buoy ? [buoy.lon, buoy.lat] : DEFAULT_CENTER}
              aoi={s.aoi?.geometry}
              fitBBox={s.store?.aoi_bbox}
              overlay={ov.overlay}
              overlayOpacity={opacity}
              basemap={basemap}
              buoy={buoy}
              buoyName={`ทุ่น ${BUOY_ID}`}
              buoyPopup={<BuoyBubble buoyId={BUOY_ID} scene={s.selected} />}
              controlRef={mapCtl}
            >
              {/* มุมซ้ายบน: ป้ายพื้นที่ + สลับแผนที่ฐาน (ปุ่มซูมอยู่มุมขวาบน จึงเว้นขวาไว้ ~4.5rem) */}
              <div className="pointer-events-none absolute top-3 left-3 z-10 flex max-w-[calc(100%-5rem)] flex-col items-start gap-2 [&>*]:pointer-events-auto">
                <LocationChip onClick={() => mapCtl.current?.resetView()} />
                <BasemapSwitch value={basemap} onChange={setBasemap} className="bg-white/95 shadow-[0_0_0_1px_var(--color-border)]" />
              </div>
              <OverlayControls
                className="absolute right-3 bottom-10 z-10"
                scene={s.selected}
                kind={kind}
                onKindChange={setKind}
                opacity={opacity}
                onOpacityChange={setOpacity}
                loading={ov.loading}
                error={ov.error}
              />
            </SatelliteMap>
          </section>

          {s.loading ? (
            <Skeleton className="h-[98px] w-full rounded-xl" />
          ) : (
            allScenes.length > 0 && (
              <SceneTimeline
                className="shrink-0"
                scenes={allScenes}
                playable={s.scenes}
                selectedId={s.selected?.image_id ?? null}
                onSelect={selectAndReveal}
              />
            )
          )}
        </div>

        <Card
          as="aside"
          title="รายการภาพ"
          labelledBy="scene-list-title"
          className="lg:col-start-1 lg:row-start-1 lg:min-h-0"
          bodyClassName="flex flex-col"
        >
          <div className="px-4 py-1 sm:px-5 lg:px-3">
            <SceneFilter onlyClear={s.onlyClear} onChange={s.setOnlyClear} shown={s.scenes.length} total={s.totalCount} />
          </div>
          <div className="min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain">
            <SceneList
              scenes={s.scenes}
              selectedId={s.selected?.image_id ?? null}
              onSelect={s.select}
              loading={s.loading}
              error={s.loadError}
              totalCount={s.totalCount}
              emptyAction={refreshButton}
              errorAction={<Button variant="secondary" onClick={s.reload}>ลองโหลดใหม่</Button>}
              scrollKey={scrollKey}
            />
          </div>
        </Card>
      </div>

      <Card
        className="mt-4"
        title="ค่าดัชนีที่จุดวางทุ่น"
        labelledBy="index-chart-title"
        description={`${withData} ภาพที่จุดทุ่นไม่ถูกเมฆบัง ค่าเฉลี่ยในรัศมี 15 ม.`}
        bodyClassName="px-3 pt-3 pb-4 sm:px-5"
      >
        {s.loading ? (
          <Skeleton className="h-64 w-full sm:h-72" />
        ) : withData === 0 ? (
          <EmptyState
            className="px-1 sm:px-0"
            title="ยังไม่มีค่าที่จุดทุ่น"
            description={
              s.totalCount === 0
                ? "ดึงข้อมูลแล้วกราฟค่าดัชนีจะขึ้นตรงนี้"
                : "ทุกภาพที่มีอยู่ถูกเมฆบังจุดวางทุ่น ภาพที่โปร่งมักได้ช่วง ก.พ.–ก.ย."
            }
          />
        ) : (
          <div className="h-64 sm:h-72">
            <IndexTimeSeries className="h-full" scenes={allScenes} selected={s.selected} />
          </div>
        )}
        <p className="mt-4 max-w-[72ch] border-l-[3px] border-accent pl-3 text-[13px] text-body">
          ค่า FNU และ µg/L บนหน้านี้เป็น<b>ค่าประมาณจากสูตรงานวิจัย</b> (Dogliotti 2015, Mishra &amp; Mishra 2012) ยังไม่ได้สอบเทียบกับสระนี้
          ค่าความขุ่นที่ใช้ได้จริงต้องจับคู่กับค่าที่ทุ่นวัดได้ภายใน ±30 นาทีจากเวลาที่ดาวเทียมผ่าน (ราว 10:40 น.) แล้วเทรน Random Forest
          ส่วนคลอโรฟิลล์ต้องเทียบกับผลแล็บ เพราะทุ่นไม่มีเซนเซอร์นี้
        </p>
      </Card>
    </>
  );
}
