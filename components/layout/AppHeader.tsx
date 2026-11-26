import AppNav from "./AppNav";
import BrandLogo from "./BrandLogo";
import UserMenu from "./UserMenu";

/**
 * แถวบน: โลโก้ + ผู้ใช้ (มือถือมีปุ่มเมนู)
 * แถวล่าง (≥768px): แถบเมนู
 * ชื่อพื้นที่ย้ายไปอยู่บนแผนที่ (LocationChip)
 */
export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface md:static">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <BrandLogo />
        <div className="ml-auto flex items-center gap-1.5">
          <UserMenu />
          <AppNav variant="mobile" className="-mr-1.5" />
        </div>
      </div>
      <div className="hidden border-t border-border-soft md:block">
        <div className="mx-auto max-w-[1600px] px-2 sm:px-4 lg:px-6">
          <AppNav variant="bar" />
        </div>
      </div>
    </header>
  );
}
