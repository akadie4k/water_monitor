export type IndexKey = "NDWI" | "NDTI" | "NDCI" | "B8A_B3";

export interface Scene {
  image_id: string;
  datetime: string;
  time_ms: number;
  cloud_pct: number;
  tile: string;
  clear_frac: number;
  water_px: number;
  buoy: Partial<Record<IndexKey | string, number | null>>;
  buoy_has_data: boolean;
  /** ค่าประมาณจากสูตรงานวิจัย (backend/app/estimates.py) — ยังไม่สอบเทียบกับพื้นที่ */
  est?: { turbidity_fnu: number | null; chla_ugl: number | null };
  overlays?: Partial<Record<OverlayKind, string>>;
}

export type OverlayKind = "ndti" | "ndci" | "turb" | "chla" | "truecolor";

export type BBox = [number, number, number, number];

export interface SceneStore {
  updated_at?: string;
  aoi_bbox: BBox;
  aoi_name: string;
  buoy: { lon: number; lat: number };
  scenes: Scene[];
}

export interface Aoi {
  name: string;
  bbox: BBox;
  geometry: { type: string; coordinates: unknown };
}
