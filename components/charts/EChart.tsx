"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, MarkLineComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import { cn } from "@/lib/cn";

echarts.use([LineChart, GridComponent, MarkLineComponent, TooltipComponent, CanvasRenderer]);

export interface EChartProps {
  option: EChartsOption;
  className?: string;
  /** คำอธิบายกราฟสำหรับ screen reader */
  ariaLabel: string;
  /** กดจุดข้อมูล: ได้ค่าแกน x (ms) ของจุดนั้น */
  onPointClick?: (x: number) => void;
}

/** ห่อ ECharts: ใช้ใน browser เท่านั้น และปรับขนาดตามกล่อง */
export default function EChart({ option, className, ariaLabel, onPointClick }: EChartProps) {
  const box = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);
  const latest = useRef(option);
  latest.current = option;
  const clickRef = useRef(onPointClick);
  clickRef.current = onPointClick;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const c = echarts.init(el, undefined, { renderer: "canvas" });
    chart.current = c;
    c.setOption(latest.current, true);
    c.on("click", (p) => {
      const v = (p as { value?: unknown }).value;
      if (Array.isArray(v) && typeof v[0] === "number") clickRef.current?.(v[0]);
    });
    const ro = new ResizeObserver(() => c.resize());
    ro.observe(el);
    return () => {
      ro.disconnect();
      c.dispose();
      chart.current = null;
    };
  }, []);

  useEffect(() => {
    chart.current?.setOption(option, true);
  }, [option]);

  return <div ref={box} role="img" aria-label={ariaLabel} className={cn("w-full", className)} />;
}
