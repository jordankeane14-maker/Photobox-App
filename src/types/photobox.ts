export type FilterId =
  | 'normal'
  | 'bw'
  | 'vintage'
  | 'warm'
  | 'cool'
  | 'glow'
  | 'sepia'
  | 'cyber'
  | 'contrast';

export interface FilterDefinition {
  id: FilterId;
  name: string;
  category: 'Clean' | 'Vintage' | 'Creative';
  cssFilter: string;
  canvasFilter: string;
  previewHue: string;
  description: string;
}

export type FrameStyle = 'classic_strip' | 'grid_2x2' | 'film_roll' | 'polaroid_card';

export interface FrameColorOption {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  subtextClass: string;
  hexBg: string;
  hexText: string;
  hexAccent: string;
  borderClass?: string;
}

export interface CapturedPhoto {
  id: string;
  slotIndex: number;
  dataUrl: string;
  timestamp: number;
}

export interface StickerItem {
  id: string;
  emoji: string;
  xPercent: number; // 0 to 100 relative to photostrip
  yPercent: number; // 0 to 100 relative to photostrip
  scale: number;
  rotation: number;
}

export interface PhotoboxSettings {
  photoCount: 1 | 2 | 3 | 4;
  countdownSeconds: 3 | 5 | 10;
  filterId: FilterId;
  frameStyle: FrameStyle;
  frameColorId: string;
  isMirrored: boolean;
  isSoundEnabled: boolean;
  dateStamp: boolean;
  customTitle: string;
  customSubtitle: string;
  stickers: StickerItem[];
}
