import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { skyIcon } from "@/lib/icons";
import { cn } from "@/lib/cn";
import { fmtDate, fmtTime } from "@/lib/format";
import { clearPct, clearTone, fmtIndex } from "@/lib/indices";
import type { Scene } from "@/lib/types";

export interface SceneListItemProps {
  scene: Scene;
  selected: boolean;
  onSelect: (scene: Scene) => void;
}

export default function SceneListItem({ scene, selected, onSelect }: SceneListItemProps) {
  const pct = clearPct(scene.clear_frac);
  const ndti = scene.buoy?.NDTI;
  const ndci = scene.buoy?.NDCI;
  const hasImage = Boolean(scene.overlays?.ndti || scene.overlays?.truecolor);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(scene)}
      data-scene-id={scene.image_id}
      className={cn(
        "group relative flex h-full w-full flex-col gap-2 overflow-hidden rounded-lg border px-3 py-2.5 text-left",
        "motion-safe:transition-[translate,scale,box-shadow,border-color,background-color] motion-safe:duration-150 motion-safe:ease-out",
        "motion-safe:hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-10px_color-mix(in_srgb,var(--color-ink)_45%,transparent)]",
        "motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] motion-safe:active:duration-75",
        selected
          ? "border-primary bg-primary/[0.06]"
          : "border-border bg-white hover:border-primary/50",
      )}
    >
      {selected && (
        <span aria-hidden="true" className="accent-bar absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-accent" />
      )}
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block font-display text-[17px] leading-tight font-medium text-ink">{fmtDate(scene.datetime)}</span>
          <span className="text-xs text-muted tabular-nums">{fmtTime(scene.datetime)} น.</span>
        </span>
        {hasImage ? (
          <span title="มีภาพซ้อนแผนที่แล้ว" className="mt-0.5 text-primary">
            <Icon name="overlayReady" />
            <span className="sr-only">มีภาพซ้อนแผนที่แล้ว</span>
          </span>
        ) : (
          <span className="sr-only">ยังไม่มีภาพซ้อน จะสร้างเมื่อเลือก</span>
        )}
      </span>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Badge tone={clearTone(pct)} title="สัดส่วนพื้นที่แหล่งน้ำที่ไม่มีเมฆบัง">
          <Icon name={skyIcon(pct)} size={14} className="-ml-0.5" />
          โปร่ง {pct}%
        </Badge>
        <span className="text-xs text-body tabular-nums">
          NDTI <span className="font-medium text-ink">{scene.buoy_has_data ? fmtIndex(ndti) : "–"}</span>
        </span>
        <span className="text-xs text-body tabular-nums">
          NDCI <span className="font-medium text-ink">{scene.buoy_has_data ? fmtIndex(ndci) : "–"}</span>
        </span>
        {scene.buoy_has_data && scene.est && (
          <span className="w-full text-xs text-muted tabular-nums" title="ค่าประมาณจากสูตรงานวิจัย ยังไม่สอบเทียบกับสระนี้">
            ≈ {fmtIndex(scene.est.turbidity_fnu, 1)} FNU · คลอโรฟิลล์ ≈ {fmtIndex(scene.est.chla_ugl, 1)} µg/L
          </span>
        )}
      </span>
    </button>
  );
}
