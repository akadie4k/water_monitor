import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: ReactNode;
  /** บรรทัดข้อมูลประกอบ แต่ละรายการแสดงแยกกัน */
  meta?: ReactNode[];
  actions?: ReactNode;
}

export default function PageHeader({ title, meta = [], actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-end sm:justify-between sm:py-5">
      <div className="min-w-0">
        <h1 className="text-[22px] sm:text-[26px]">{title}</h1>
        {meta.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted">
            {meta.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        )}
      </div>
      {actions && <div className="flex shrink-0 gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">{actions}</div>}
    </div>
  );
}
