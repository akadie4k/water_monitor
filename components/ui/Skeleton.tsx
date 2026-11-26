import { cn } from "@/lib/cn";

export interface SkeletonProps {
  className?: string;
}

/** กล่องรอโหลด: แสงเลื่อนผ่านเป็นคลื่น (หยุดนิ่งเมื่อตั้งค่าลดการเคลื่อนไหว) */
export default function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden="true" className={cn("skeleton-wave rounded-md", className)} />;
}
