"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, LegendComponent, MarkLineComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import { cn } from "@/lib/cn";

echarts.use([LineChart, GridComponent, LegendComponent, MarkLineComponent, TooltipComponent, CanvasRenderer]);

export interface EChartProps {
  option: EChartsOption;
  className?: string;
  /** คำอธิบายกราฟสำหรับ screen reader */
  ariaLabel: string;
}

/** ห่อ ECharts: ใช้ใน browser เท่านั้น และปรับขนาดตามกล่องเมื่อหมุนจอ/ย่อหน้าต่าง */
export default function EChart({ option, className, ariaLabel }: EChartProps) {
  const box = useRef<HTMLDivElement>(null);
  const chart = useRef<echarts.ECharts | null>(null);
  const latest = useRef(option);
  latest.current = option;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const c = echarts.init(el, undefined, { renderer: "canvas" });
    chart.current = c;
    c.setOption(latest.current, true);
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
