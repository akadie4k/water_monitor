import Toggle from "@/components/ui/Toggle";

export interface SceneFilterProps {
  onlyClear: boolean;
  onChange: (onlyClear: boolean) => void;
  shown: number;
  total: number;
}

export default function SceneFilter({ onlyClear, onChange, shown, total }: SceneFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3">
      <Toggle checked={onlyClear} onChange={onChange} label="เฉพาะโปร่ง ≥30%" />
      <span className="text-[13px] text-muted tabular-nums" aria-live="polite">
        แสดง {shown} จาก {total} ภาพ
      </span>
    </div>
  );
}
