"use client";

import { useEffect, useMemo, useState } from "react";
import type { EChartsOption, LineSeriesOption } from "echarts";
import EChart from "./EChart";
import { toDate } from "@/lib/format";
import type { Scene } from "@/lib/types";
import { themeColor, type ThemeColor } from "@/lib/theme";

export interface IndexTimeSeriesProps {
  scenes: Scene[];
  /** ภาพที่เลือกบนแผนที่ จะมีเส้นแนวตั้งกำกับ */
  selected: Scene | null;
  className?: string;
}


const SERIES: ReadonlyArray<{ key: string; name: string; color: ThemeColor; right?: boolean }> = [
  { key: "NDTI", name: "NDTI ความขุ่น", color: "series-1" },
  { key: "NDCI", name: "NDCI คลอโรฟิลล์", color: "series-2" },
  { key: "B8A_B3", name: "B8A/B3", color: "series-3", right: true },
];

const DAY = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "short" });

function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow;
}

/** ค่าดัชนีที่จุดทุ่นตามเวลา (เฉพาะภาพที่จุดทุ่นไม่ถูกเมฆบัง) */
export default function IndexTimeSeries({ scenes, selected, className }: IndexTimeSeriesProps) {
  const narrow = useNarrow();
  // next/font ตั้งชื่อฟอนต์ใหม่ จึงอ่านชื่อจริงจาก body (คอมโพเนนต์นี้โหลดฝั่ง browser เท่านั้น)
  const [font] = useState(() => getComputedStyle(document.body).fontFamily || "Tahoma, sans-serif");

  const option = useMemo<EChartsOption>(() => {
    const FONT = font;
    const AXIS = { color: themeColor("muted"), fontFamily: FONT, fontSize: 11 };
    const rows = scenes.filter((s) => s.buoy_has_data).slice().sort((a, b) => a.time_ms - b.time_ms);
    const markAt = selected?.buoy_has_data ? toDate(selected.datetime).getTime() : null;

    const series: LineSeriesOption[] = SERIES.map((s, i) => ({
      name: s.name,
      type: "line",
      yAxisIndex: s.right ? 1 : 0,
      data: rows.map((r) => [toDate(r.datetime).getTime(), r.buoy[s.key] ?? null]),
      color: themeColor(s.color),
      symbolSize: narrow ? 5 : 6,
      connectNulls: true,
      lineStyle: { width: 1.8, type: s.right ? "dashed" : "solid" },
      markLine:
        i === 0 && markAt != null
          ? {
              silent: true,
              symbol: "none",
              label: { show: false },
              lineStyle: { color: themeColor("ink"), type: "solid", width: 1, opacity: 0.5 },
              data: [{ xAxis: markAt }],
            }
          : undefined,
    }));

    return {
      animation: false,
      textStyle: { fontFamily: FONT },
      tooltip: {
        trigger: "axis",
        textStyle: { fontFamily: FONT, fontSize: 12 },
        valueFormatter: (v) => (typeof v === "number" ? v.toFixed(3) : "–"),
      },
      legend: {
        top: 0,
        left: 0,
        itemWidth: 16,
        itemHeight: 8,
        textStyle: AXIS,
      },
      grid: { left: 8, right: 8, top: 56, bottom: 4, containLabel: true },
      xAxis: {
        type: "time",
        axisLabel: { ...AXIS, hideOverlap: true, formatter: (v: number) => DAY.format(v) },
        axisPointer: { label: { formatter: (p) => DAY.format(Number(p.value)) } },
        axisLine: { lineStyle: { color: themeColor("border") } },
        splitNumber: narrow ? 3 : 6,
      },
      yAxis: [
        {
          type: "value",
          name: "NDTI / NDCI",
          nameTextStyle: { ...AXIS, align: "left" },
          axisLabel: AXIS,
          splitLine: { lineStyle: { color: themeColor("border-soft") } },
        },
        {
          type: "value",
          name: "B8A/B3",
          nameTextStyle: { ...AXIS, align: "right" },
          axisLabel: AXIS,
          splitLine: { show: false },
        },
      ],
      series,
    };
  }, [scenes, selected, narrow, font]);

  return (
    <EChart
      option={option}
      className={className}
      ariaLabel="กราฟค่า NDTI, NDCI และ B8A/B3 ที่จุดวางทุ่นตามวันที่ของภาพดาวเทียม"
    />
  );
}
