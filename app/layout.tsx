import type { Metadata, Viewport } from "next";
import { Anuphan } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config as faConfig } from "@fortawesome/fontawesome-svg-core";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

// โหลด CSS ของ Font Awesome เองด้านบนแล้ว ไม่ให้ไลบรารีแทรก <style> ตอนรันไทม์
faConfig.autoAddCss = false;

/** Anuphan: ตัวไม่มีหัวทรงเรขาคณิต อ่านง่ายทั้งไทยและอังกฤษ ใช้ทั้งหัวข้อ เนื้อความ และตัวเลข */
const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-anuphan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Water Buoy · Walailak Botanic Park",
  description: "ติดตามความขุ่นและคลอโรฟิลล์ของสระในสวนพฤกษศาสตร์วลัยลักษณ์ ด้วยภาพดาวเทียม Sentinel-2",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0C1A33",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={anuphan.variable}>
      <body className="min-h-dvh">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
