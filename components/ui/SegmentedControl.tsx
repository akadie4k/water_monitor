import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { IconName } from "@/lib/icons";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  /** ไอคอนหน้าป้าย (ตกแต่ง — ป้ายข้อความยังอยู่เสมอ) */
  icon?: IconName;
}

export interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** ชื่อกลุ่มสำหรับ screen reader */
  label: string;
  className?: string;
  size?: "sm" | "md";
}

export default function SegmentedControl<T extends string>({
  options, value, onChange, label, className, size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex rounded-lg bg-border-soft p-0.5", className)}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 font-medium whitespace-nowrap motion-safe:transition-colors",
              size === "sm" ? "min-h-11 text-[13px] sm:min-h-8" : "min-h-11 text-sm sm:min-h-9",
              on ? "bg-white text-ink shadow-[0_0_0_1px_var(--color-border)]" : "text-muted hover:text-ink",
            )}
          >
            {o.icon && <Icon name={o.icon} size={14} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
