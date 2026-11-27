/**
 * ชุดไอคอนกลางของทั้งแอป (ชื่อ → IconDefinition) — Font Awesome Free
 * ใช้ผ่าน <Icon name="..." /> เท่านั้น และ import ทีละไอคอนเสมอ (tree-shaking)
 */
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faChartLine,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCloud,
  faCloudSun,
  faDroplet,
  faExpand,
  faKeyboard,
  faLayerGroup,
  faLocationDot,
  faMinus,
  faPause,
  faPlay,
  faPlus,
  faRotate,
  faSatellite,
  faSatelliteDish,
  faSun,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export const ICONS = {
  zoomIn: faPlus,
  zoomOut: faMinus,
  resetView: faExpand,
  refresh: faRotate,
  satellite: faSatellite,
  satelliteDish: faSatelliteDish,
  droplet: faDroplet,
  play: faPlay,
  pause: faPause,
  prev: faChevronLeft,
  next: faChevronRight,
  chart: faChartLine,
  layers: faLayerGroup,
  location: faLocationDot,
  keyboard: faKeyboard,
  close: faXmark,
  sun: faSun,
  cloudSun: faCloudSun,
  cloud: faCloud,

  success: faCircleCheck,
  error: faCircleExclamation,
  info: faCircleInfo,
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICONS;
