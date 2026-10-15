import type { FilterDefinition, FilterId, FrameColorOption, FrameStyle } from '../types/photobox.ts';

export const PHOTO_FILTERS: FilterDefinition[] = [
  {
    id: 'normal',
    name: 'Natural Studio',
    category: 'Clean',
    cssFilter: 'none',
    canvasFilter: 'none',
    previewHue: '#cbd5e1',
    description: 'Crisp, natural skin tones with neutral studio lighting',
  },
  {
    id: 'bw',
    name: 'Classic Mono',
    category: 'Vintage',
    cssFilter: 'grayscale(100%) contrast(125%) brightness(95%)',
    canvasFilter: 'grayscale(100%) contrast(125%) brightness(95%)',
    previewHue: '#71717a',
    description: 'Deep blacks, bright whites, timeless monochrome tone',
  },
  {
    id: 'vintage',
    name: '90s Film',
    category: 'Vintage',
    cssFilter: 'sepia(30%) contrast(110%) brightness(105%) saturate(120%)',
    canvasFilter: 'sepia(30%) contrast(110%) brightness(105%) saturate(120%)',
    previewHue: '#f59e0b',
    description: 'Warm nostalgic tones, subtle golden grain and memory warmth',
  },
  {
    id: 'warm',
    name: 'Sunset Peach',
    category: 'Clean',
    cssFilter: 'saturate(135%) brightness(106%) sepia(15%) hue-rotate(-5deg)',
    canvasFilter: 'saturate(135%) brightness(106%) sepia(15%) hue-rotate(-5deg)',
    previewHue: '#fb923c',
    description: 'Golden hour warmth and glowing radiant cheeks',
  },
  {
    id: 'cool',
    name: 'Nordic Chill',
    category: 'Clean',
    cssFilter: 'hue-rotate(185deg) saturate(90%) contrast(115%) brightness(105%)',
    canvasFilter: 'hue-rotate(185deg) saturate(90%) contrast(115%) brightness(105%)',
    previewHue: '#38bdf8',
    description: 'Cool blue undertone, modern crisp Scandinavian editorial look',
  },
  {
    id: 'glow',
    name: 'Soft Bloom',
    category: 'Clean',
    cssFilter: 'brightness(112%) contrast(92%) saturate(110%)',
    canvasFilter: 'brightness(112%) contrast(92%) saturate(110%)',
    previewHue: '#f472b6',
    description: 'Korean photobooth beauty filter with softened skin glow',
  },
  {
    id: 'sepia',
    name: 'Heritage Sepia',
    category: 'Vintage',
    cssFilter: 'sepia(85%) contrast(95%) brightness(90%)',
    canvasFilter: 'sepia(85%) contrast(95%) brightness(90%)',
    previewHue: '#b45309',
    description: 'Authentic 1920s antique photocard feeling',
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    category: 'Creative',
    cssFilter: 'contrast(140%) saturate(180%) hue-rotate(290deg)',
    canvasFilter: 'contrast(140%) saturate(180%) hue-rotate(290deg)',
    previewHue: '#c084fc',
    description: 'Electric magenta, ultraviolet nighttime photobooth vibe',
  },
  {
    id: 'contrast',
    name: 'High Contrast',
    category: 'Creative',
    cssFilter: 'contrast(160%) brightness(102%) saturate(110%)',
    canvasFilter: 'contrast(160%) brightness(102%) saturate(110%)',
    previewHue: '#ef4444',
    description: 'Punchy vivid highlights and deep silhouettes',
  },
];

export const FRAME_COLORS: FrameColorOption[] = [
  {
    id: 'charcoal',
    name: 'Matte Obsidian',
    bgClass: 'bg-zinc-900 border-zinc-800',
    textClass: 'text-zinc-100',
    subtextClass: 'text-zinc-400',
    hexBg: '#18181b',
    hexText: '#fafafa',
    hexAccent: '#a1a1aa',
    borderClass: 'border border-zinc-800/80',
  },
  {
    id: 'clean_white',
    name: 'Studio White',
    bgClass: 'bg-white border-zinc-200',
    textClass: 'text-zinc-900',
    subtextClass: 'text-zinc-500',
    hexBg: '#ffffff',
    hexText: '#18181b',
    hexAccent: '#71717a',
    borderClass: 'border border-zinc-200 shadow-sm',
  },
  {
    id: 'pastel_pink',
    name: 'Sakura Blush',
    bgClass: 'bg-rose-100 border-rose-200',
    textClass: 'text-rose-950',
    subtextClass: 'text-rose-700',
    hexBg: '#ffe4e6',
    hexText: '#4c0519',
    hexAccent: '#e11d48',
    borderClass: 'border border-rose-200',
  },
  {
    id: 'butter_yellow',
    name: 'Retro Butter',
    bgClass: 'bg-amber-100 border-amber-200',
    textClass: 'text-amber-950',
    subtextClass: 'text-amber-700',
    hexBg: '#fef3c7',
    hexText: '#451a03',
    hexAccent: '#d97706',
    borderClass: 'border border-amber-200',
  },
  {
    id: 'lavender',
    name: 'Lilac Dream',
    bgClass: 'bg-purple-100 border-purple-200',
    textClass: 'text-purple-950',
    subtextClass: 'text-purple-700',
    hexBg: '#f3e8ff',
    hexText: '#3b0764',
    hexAccent: '#9333ea',
    borderClass: 'border border-purple-200',
  },
  {
    id: 'matcha',
    name: 'Matcha Cream',
    bgClass: 'bg-emerald-100 border-emerald-200',
    textClass: 'text-emerald-950',
    subtextClass: 'text-emerald-700',
    hexBg: '#dcfce7',
    hexText: '#064e3b',
    hexAccent: '#059669',
    borderClass: 'border border-emerald-200',
  },
  {
    id: 'retro_navy',
    name: 'Midnight Film',
    bgClass: 'bg-slate-900 border-slate-800',
    textClass: 'text-slate-100',
    subtextClass: 'text-slate-400',
    hexBg: '#0f172a',
    hexText: '#f8fafc',
    hexAccent: '#38bdf8',
    borderClass: 'border border-slate-800',
  },
  {
    id: 'cherry',
    name: 'Vintage Crimson',
    bgClass: 'bg-red-950 border-red-900',
    textClass: 'text-red-100',
    subtextClass: 'text-red-300',
    hexBg: '#450a0a',
    hexText: '#fef2f2',
    hexAccent: '#f87171',
    borderClass: 'border border-red-900',
  },
];

export interface StripDimensions {
  width: number;
  height: number;
  photoWidth: number;
  photoHeight: number;
  padding: number;
  gap: number;
  headerHeight: number;
  footerHeight: number;
  columns: number;
  rows: number;
}

/**
 * Calculates standard high-res canvas dimensions based on style and photo count.
 * High-res base width is 800px (or 1200px for 2x2 grid).
 */
export function calculateStripDimensions(
  style: FrameStyle,
  photoCount: number
): StripDimensions {
  const count = Math.min(Math.max(photoCount, 1), 4);

  if (style === 'grid_2x2' || (count === 4 && style === 'film_roll')) {
    // 2x2 grid layout
    const width = 1000;
    const padding = 40;
    const gap = 24;
    const headerHeight = 60;
    const footerHeight = 110;
    const columns = 2;
    const rows = 2;

    const photoWidth = (width - padding * 2 - gap) / 2; // ~448
    const photoHeight = Math.round(photoWidth * (3 / 4)); // 3:4 aspect
    const height = padding * 2 + headerHeight + footerHeight + rows * photoHeight + (rows - 1) * gap;

    return {
      width,
      height,
      photoWidth,
      photoHeight,
      padding,
      gap,
      headerHeight,
      footerHeight,
      columns,
      rows,
    };
  }

  // Classic vertical strip layout (1, 2, 3, or 4 photos vertically stacked)
  // Standard photo booth ratio: 4:3 or 3:2 landscape photos stacked
  const width = 600;
  const padding = 36;
  const gap = 20;
  const headerHeight = 44;
  const footerHeight = 110;
  const columns = 1;
  const rows = count;

  const photoWidth = width - padding * 2; // 528
  // 4:3 photo aspect ratio gives genuine photobooth strip dimensions
  const photoHeight = Math.round(photoWidth * (3 / 4)); // ~396
  const height = padding * 2 + headerHeight + footerHeight + rows * photoHeight + (rows - 1) * gap;

  return {
    width,
    height,
    photoWidth,
    photoHeight,
    padding,
    gap,
    headerHeight,
    footerHeight,
    columns,
    rows,
  };
}

export function getFilterById(id: FilterId): FilterDefinition {
  return PHOTO_FILTERS.find((f) => f.id === id) || PHOTO_FILTERS[0];
}

export function getFrameColorById(id: string): FrameColorOption {
  return FRAME_COLORS.find((c) => c.id === id) || FRAME_COLORS[0];
}

export function formatCurrentDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}
