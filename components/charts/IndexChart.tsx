"use client";

import { useMemo } from "react";
import type { EChartsOption, LineSeriesOption } from "echarts";
import EChart from "./EChart";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { toDate } from "@/lib/format";
import type { Scene } from "@/lib/types";
import { themeColor, type ThemeColor } from "@/lib/theme";

export const CHART_SERIES: ReadonlyArray<{ key: string; name: string; color: ThemeColor; lower?: boolean }> = [
  { key: "NDTI", name: "NDTI ความขุ่น", color: "lake" },
  { key: "NDCI", name: "NDCI คลอโรฟิลล์", color: "buoy-deep" },
  { key: "B8A_B3", name: "B8A/B3", color: "muted", lower: true },
];

const DAY = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "short" });

export interface IndexChartProps {
  scenes: Scene[];
  selected: Scene | null;
  onPick?: (scene: Scene) => void;
  className?: string;
}

/** ค่าดัชนีที่จุดทุ่นตามเวลา (เฉพาะภาพที่จุดทุ่นไม่ถูกเมฆบัง) — กดจุดเพื่อเลือกภาพ */
export default function IndexChart({ scenes, selected, onPick, className }: IndexChartProps) {
  const narrow = useMediaQuery("(max-width: 639px)");
  const rows = useMemo(() => scenes.filter((s) => s.buoy_has_data).sort((a, b) => a.time_ms - b.time_ms), [scenes]);

  const option = useMemo<EChartsOption>(() => {
    const font = getComputedStyle(document.body).fontFamily || "sans-serif";
    const AXIS = { color: themeColor("muted"), fontFamily: font, fontSize: 11 };
    const markAt = selected?.buoy_has_data ? toDate(selected.datetime).getTime() : null;
    const mark: LineSeriesOption["markLine"] =
      markAt == null
        ? undefined
        : { silent: true, symbol: "none", label: { show: false }, lineStyle: { color: themeColor("night"), type: "solid", width: 1.5 }, data: [{ xAxis: markAt }] };

    // B8A/B3 คนละสเกลกับ NDTI/NDCI จึงแยกเป็นแผงล่าง ใช้แกนเวลาเดียวกัน
    const series: LineSeriesOption[] = CHART_SERIES.map((s) => ({
      name: s.name,
      type: "line",
      xAxisIndex: s.lower ? 1 : 0,
      yAxisIndex: s.lower ? 1 : 0,
      data: rows.map((r) => [toDate(r.datetime).getTime(), r.buoy[s.key] ?? null]),
      color: themeColor(s.color),
      symbol: "circle",
      symbolSize: narrow ? 6 : 8,
      smooth: 0.25,
      connectNulls: true,
      lineStyle: { width: s.lower ? 1.5 : 2.5, type: s.lower ? "dashed" : "solid" },
      emphasis: { scale: 1.5 },
      cursor: "pointer",
      markLine: s.key === "NDTI" || s.lower ? mark : undefined,
    }));

    const xBase = {
      type: "time" as const,
      axisPointer: { label: { formatter: (p: { value: unknown }) => DAY.format(Number(p.value)) } },
      axisLine: { lineStyle: { color: themeColor("line") } },
      axisTick: { show: false },
      splitNumber: narrow ? 3 : 7,
    };

    return {
      animation: false,
      textStyle: { fontFamily: font },
      axisPointer: { link: [{ xAxisIndex: "all" }] },
      tooltip: {
        trigger: "axis",
        borderWidth: 0,
        borderRadius: 12,
        padding: [8, 12],
        extraCssText: "box-shadow: 0 10px 30px -12px rgba(12,26,51,.4);",
        textStyle: { fontFamily: font, fontSize: 12, color: themeColor("ink") },
        valueFormatter: (v) => (typeof v === "number" ? v.toFixed(3) : "–"),
      },
      grid: [
        { left: 4, right: 12, top: 16, height: "58%", containLabel: true },
        { left: 4, right: 12, bottom: 4, height: "18%", containLabel: true },
      ],
      xAxis: [
        { ...xBase, gridIndex: 0, axisLabel: { show: false } },
        { ...xBase, gridIndex: 1, axisLabel: { ...AXIS, hideOverlap: true, formatter: (v: number) => DAY.format(v) } },
      ],
      yAxis: [
        { type: "value", gridIndex: 0, axisLabel: AXIS, splitLine: { lineStyle: { color: themeColor("line"), type: "dashed" } } },
        { type: "value", gridIndex: 1, splitNumber: 2, axisLabel: AXIS, splitLine: { lineStyle: { color: themeColor("line"), type: "dashed" } } },
      ],
      series,
    };
  }, [rows, selected, narrow]);

  return (
    <EChart
      option={option}
      className={className}
      ariaLabel="กราฟค่า NDTI และ NDCI (แผงบน) กับ B8A/B3 (แผงล่าง) ที่จุดวางทุ่นตามวันที่ของภาพดาวเทียม"
      onPointClick={
        onPick
          ? (x) => {
              const hit = rows.find((r) => toDate(r.datetime).getTime() === x);
              if (hit) onPick(hit);
            }
          : undefined
      }
    />
  );
}
