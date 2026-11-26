import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export interface LocationChipProps {
  name?: string;
  address?: string;
  /** กดแล้วให้แผนที่กลับไปเห็นทั้งแหล่งน้ำ */
  onClick: () => void;
  className?: string;
}

/** ป้ายชื่อพื้นที่บนแผนที่ — กดเพื่อกลับไปดูทั้งแหล่งน้ำ */
export default function LocationChip({
  name = "Walailak Botanic Park",
  address = "ต.หัวตะพาน อ.ท่าศาลา จ.นครศรีธรรมราช",
  onClick,
  className,
}: LocationChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="กลับไปดูทั้งแหล่งน้ำ"
      aria-label={`${name}, ${address} กดเพื่อกลับไปดูทั้งแหล่งน้ำ`}
      className={cn(
        "group flex max-w-full min-h-11 items-center gap-2 rounded-xl bg-white/95 py-1.5 pr-3 pl-2 text-left",
        "shadow-[0_0_0_1px_var(--color-border),0_4px_14px_-8px_color-mix(in_srgb,var(--color-ink)_40%,transparent)]",
        "motion-safe:transition-[translate,box-shadow,scale] motion-safe:duration-150",
        "hover:-translate-y-px hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-primary)_45%,transparent),0_8px_20px_-10px_color-mix(in_srgb,var(--color-ink)_45%,transparent)]",
        "active:translate-y-0 active:scale-[0.98]",
        className,
      )}
    >
      <Icon name="location" size={20} className="text-accent motion-safe:transition-transform group-hover:-translate-y-0.5" />
      <span className="min-w-0">
        <span className="block truncate font-display text-[14px] leading-tight font-medium text-ink">{name}</span>
        <span className="block truncate text-[11.5px] leading-tight text-muted">{address}</span>
      </span>
    </button>
  );
}
