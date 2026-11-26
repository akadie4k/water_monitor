import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Kanit } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config as faConfig } from "@fortawesome/fontawesome-svg-core";
import "./globals.css";
import AppHeader from "@/components/layout/AppHeader";
import { ToastProvider } from "@/components/ui/Toast";

// โหลด CSS ของ Font Awesome เองด้านบนแล้ว ไม่ให้ไลบรารีแทรก <style> ตอนรันไทม์ (กันไอคอนใหญ่ผิดขนาดตอนโหลด)
faConfig.autoAddCss = false;

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["500", "600"],
  variable: "--font-kanit",
  display: "swap",
});

const plexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Water Buoy · WBP",
  description: "ระบบติดตามคุณภาพแหล่งน้ำด้วยทุ่น IoT ร่วมกับภาพถ่ายดาวเทียม Sentinel-2",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${kanit.variable} ${plexThai.variable}`}>
      <body className="min-h-dvh text-[15px]">
        <ToastProvider>
          <AppHeader />
          <main className="mx-auto w-full max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-8">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
