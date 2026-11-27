/**
 * อ่านสีจากโทเคนใน app/globals.css สำหรับไลบรารีที่ต้องการค่าสีเป็นสตริง (ECharts, MapLibre)
 * เรียกฝั่ง browser เท่านั้น
 */
export type ThemeColor =
  | "night" | "ink" | "body" | "muted" | "line" | "haze" | "paper"
  | "lake" | "lake-soft" | "lake-light" | "buoy" | "buoy-deep" | "good" | "warn" | "bad";

export function themeColor(name: ThemeColor): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
}
