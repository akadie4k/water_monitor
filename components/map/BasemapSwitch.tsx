import SegmentedControl, { type SegmentOption } from "@/components/ui/SegmentedControl";
import type { Basemap } from "./SatelliteMap";

export interface BasemapSwitchProps {
  value: Basemap;
  onChange: (value: Basemap) => void;
  className?: string;
}

const OPTIONS: ReadonlyArray<SegmentOption<Basemap>> = [
  { value: "osm", label: "แผนที่" },
  { value: "sat", label: "ภาพถ่าย" },
];

export default function BasemapSwitch({ value, onChange, className }: BasemapSwitchProps) {
  return (
    <SegmentedControl
      label="แผนที่ฐาน"
      size="sm"
      options={OPTIONS}
      value={value}
      onChange={onChange}
      className={className ?? "bg-white/95 shadow-[0_0_0_1px_var(--color-border)]"}
    />
  );
}
