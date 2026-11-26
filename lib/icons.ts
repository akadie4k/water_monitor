/**
 * ชุดไอคอนกลางของทั้งแอป (ชื่อ → IconDefinition)
 * คอมโพเนนต์ใช้ผ่าน <Icon name="..." /> เท่านั้น — เปลี่ยนชุดไอคอนทั้งแอปได้ที่ไฟล์นี้ไฟล์เดียว
 *
 * กฎ: solid สำหรับเมนูและการกระทำ, regular เฉพาะสถานะรอง/สถานะว่าง
 * import ทีละไอคอนเสมอ (tree-shaking) ห้าม import ทั้งชุด
 */
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBars,
  faBell,
  faChartLine,
  faChevronDown,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCloud,
  faCloudSun,
  faCode,
  faDroplet,
  faEllipsis,
  faFileExport,
  faGear,
  faHand,
  faImage,
  faKeyboard,
  faLayerGroup,
  faLifeRing,
  faLocationDot,
  faMicrochip,
  faMoon,
  faPause,
  faPlay,
  faRightFromBracket,
  faRotate,
  faSatellite,
  faSatelliteDish,
  faScrewdriverWrench,
  faSun,
  faTableCellsLarge,
  faUser,
  faWater,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faImage as faImageRegular, faSun as faSunRegular } from "@fortawesome/free-regular-svg-icons";

export const ICONS = {
  // เมนูหลัก
  overview: faTableCellsLarge,
  satellite: faSatellite,
  buoy: faLifeRing,
  forecast: faChartLine,
  alert: faBell,
  device: faMicrochip,
  report: faFileExport,
  api: faCode,

  // โครงหน้า / ควบคุม
  menu: faBars,
  close: faXmark,
  chevronDown: faChevronDown,
  more: faEllipsis,
  user: faUser,
  settings: faGear,
  signOut: faRightFromBracket,
  construction: faScrewdriverWrench,
  keyboard: faKeyboard,
  play: faPlay,
  pause: faPause,

  // แผนที่และข้อมูล
  location: faLocationDot,
  layers: faLayerGroup,
  refresh: faRotate,
  satelliteDish: faSatelliteDish,
  water: faWater,
  // คลอโรฟิลล์: ใช้หยดน้ำแทนใบไม้ (ใบไม้สื่อสีเขียว ซึ่งไม่อยู่ในชุดสี UI)
  droplet: faDroplet,
  photo: faImage,
  overlayReady: faImageRegular,

  // ความโปร่งของภาพ (ท้องฟ้า)
  skyClear: faSunRegular,
  skyPartly: faCloudSun,
  skyCloudy: faCloud,

  // คำทักทายตามช่วงเวลา
  hello: faHand,
  morning: faSun,
  afternoon: faCloudSun,
  evening: faMoon,

  // สถานะ
  success: faCircleCheck,
  error: faCircleExclamation,
  info: faCircleInfo,
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICONS;

/** ไอคอนท้องฟ้าจาก % โปร่ง: ≥70 แดด, 30–69 มีเมฆบ้าง, <30 เมฆครึ้ม */
export function skyIcon(clearPct: number): IconName {
  if (clearPct >= 70) return "skyClear";
  if (clearPct >= 30) return "skyPartly";
  return "skyCloudy";
}
