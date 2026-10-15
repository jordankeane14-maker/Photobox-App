import React, { useState } from 'react';
import {
  RotateCcw,
  Printer,
  QrCode,
  Sparkles,
  Palette,
  Sliders,
  Trash2,
  Check,
  ChevronLeft,
} from 'lucide-react';
import type { CapturedPhoto, FilterId, PhotoboxSettings, StickerItem } from '../types/photobox.ts';
import {
  FRAME_COLORS,
  PHOTO_FILTERS,
  formatCurrentDate,
  getFilterById,
  getFrameColorById,
} from '../utils/filterMath.ts';

interface PhotoReviewProps {
  photos: CapturedPhoto[];
  settings: PhotoboxSettings;
  onChangeSettings: (newSettings: Partial<PhotoboxSettings>) => void;
  onRetakeSingle: (index: number) => void;
  onRetakeAll: () => void;
  onOpenPrintPreview: () => void;
  onOpenQRCode: () => void;
  onBackToCamera: () => void;
}

const STICKER_PALETTE = ['❤️', '✨', '⭐', '🎀', '🍒', '🧸', '✌️', '🌸', '🕶️', '🔥', '🦋', '💌'];

export const PhotoReview: React.FC<PhotoReviewProps> = ({
  photos,
  settings,
  onChangeSettings,
  onRetakeSingle,
  onRetakeAll,
  onOpenPrintPreview,
  onOpenQRCode,
  onBackToCamera,
}) => {
  const [selectedSticker, setSelectedSticker] = useState<string>('✨');
  const activeColor = getFrameColorById(settings.frameColorId);
  const activeFilter = getFilterById(settings.filterId);

  // Add sticker at random offset near center
  const handleAddSticker = (emoji: string) => {
    setSelectedSticker(emoji);
    const newSticker: StickerItem = {
      id: 'sticker_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      emoji,
      xPercent: 20 + Math.random() * 60,
      yPercent: 15 + Math.random() * 70,
      scale: 1,
      rotation: Math.floor(Math.random() * 30) - 15,
    };
    onChangeSettings({
      stickers: [...settings.stickers, newSticker],
    });
  };

  const handleRemoveSticker = (id: string) => {
    onChangeSettings({
      stickers: settings.stickers.filter((s) => s.id !== id),
    });
  };

  const handleClearStickers = () => {
    onChangeSettings({ stickers: [] });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top navigation actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToCamera}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium rounded-xl border border-zinc-800 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Live Booth
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRetakeAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-red-300 text-xs font-medium rounded-xl border border-zinc-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            Retake All Shots
          </button>
          <button
            type="button"
            onClick={onOpenQRCode}
            aria-label="Generate QR Code for mobile digital sharing"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-xl border border-zinc-700 transition-colors cursor-pointer shadow-sm"
          >
            <QrCode className="w-4 h-4 text-rose-400" />
            <span>QR Code Share</span>
          </button>
          <button
            type="button"
            onClick={onOpenPrintPreview}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Preview & Print
          </button>
        </div>
      </div>

      {/* Main Review Split Layout: Left is Photostrip, Right is Edit & Retake Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Photostrip Container */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-xs text-zinc-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>Interactive Photostrip Preview (Click stickers to remove)</span>
          </div>

          <div
            id="photostrip-preview-container"
            className={`relative rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden ${
              activeColor.bgClass
            } ${activeColor.borderClass || 'border border-zinc-700'} ${
              settings.frameStyle === 'grid_2x2' ? 'w-full max-w-[420px]' : 'w-full max-w-[320px]'
            }`}
            style={{
              backgroundColor: activeColor.hexBg,
              color: activeColor.hexText,
            }}
          >
            {/* Header Branding */}
            <div className="pt-4 pb-2 text-center">
              <h2 className="font-serif-title font-bold text-sm tracking-wide">
                {settings.customTitle || 'PHOTOBOX STUDIO'}
              </h2>
              <div
                className="w-10 h-0.5 mx-auto mt-1 rounded-full opacity-60"
                style={{ backgroundColor: activeColor.hexAccent }}
              />
            </div>

            {/* Photos Layout */}
            <div
              className={`p-3.5 gap-2.5 ${
                settings.frameStyle === 'grid_2x2' ? 'grid grid-cols-2' : 'flex flex-col'
              }`}
            >
              {photos.slice(0, settings.photoCount).map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  className="relative group rounded-lg overflow-hidden bg-black aspect-[4/3] shadow-md border border-white/10"
                >
                  <img
                    src={photo.dataUrl}
                    alt={`Photobox shot ${idx + 1}`}
                    style={{ filter: activeFilter.cssFilter }}
                    className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                  />
                  {/* Hover action to retake this exact shot */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <button
                      type="button"
                      onClick={() => onRetakeSingle(idx)}
                      className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-semibold rounded-lg shadow transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Retake #{idx + 1}
                    </button>
                  </div>
                  {/* Small shot badge */}
                  <span className="absolute bottom-1 right-1.5 text-[9px] font-mono-num text-white/70 bg-black/50 px-1 rounded backdrop-blur-xs">
                    0{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer Branding & Date */}
            <div className="pb-4 pt-1 px-4 text-center space-y-1">
              <p className="text-[11px] font-semibold tracking-wider">
                {settings.customSubtitle || 'MEMORIES · LIFE IN FRAMES'}
              </p>
              {settings.dateStamp && (
                <p
                  className="text-[9px] font-mono-num opacity-75"
                  style={{ color: activeColor.hexAccent }}
                >
                  {formatCurrentDate()} · PHOTOBOX NO. 4082
                </p>
              )}
              {/* Mini barcode graphic */}
              <div className="flex justify-center items-center gap-0.5 pt-1 opacity-70">
                {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 3, 2, 1, 4, 1].map((w, i) => (
                  <span
                    key={i}
                    className="inline-block h-3"
                    style={{
                      width: `${w * 1.5}px`,
                      backgroundColor: activeColor.hexText,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Render Stickers on top */}
            {settings.stickers.map((stk) => (
              <button
                key={stk.id}
                type="button"
                onClick={() => handleRemoveSticker(stk.id)}
                title="Click sticker to remove"
                style={{
                  left: `${stk.xPercent}%`,
                  top: `${stk.yPercent}%`,
                  transform: `translate(-50%, -50%) rotate(${stk.rotation}deg) scale(${stk.scale})`,
                }}
                className="absolute text-3xl select-none cursor-pointer hover:scale-125 transition-transform drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] z-20 group"
              >
                <span>{stk.emoji}</span>
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-3.5 h-3.5 text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  ×
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Retake Shot Grid & Customization Panel */}
        <div className="lg:col-span-7 space-y-5">
          {/* Individual Shot Retake Strip */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                Manage & Retake Individual Photos
              </h3>
              <span className="text-xs text-zinc-500">
                {photos.length} of {settings.photoCount} captured
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photos.slice(0, settings.photoCount).map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-2.5 flex flex-col items-center gap-2"
                >
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-black">
                    <img
                      src={photo.dataUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ filter: activeFilter.cssFilter }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-mono-num px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRetakeSingle(idx)}
                    className="w-full py-1.5 px-2 bg-zinc-700/80 hover:bg-rose-500 hover:text-white text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Retake #{idx + 1}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Filter Switcher in Review */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-rose-400" />
                Switch Filter Tone
              </h3>
              <span className="text-xs text-zinc-400 font-medium">{activeFilter.name}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
              {PHOTO_FILTERS.map((f) => {
                const isActive = settings.filterId === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onChangeSettings({ filterId: f.id as FilterId })}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-zinc-800 border-rose-500 text-rose-400'
                        : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-white/20"
                      style={{ backgroundColor: f.previewHue }}
                    />
                    <span className="text-[10px] truncate w-full text-center">
                      {f.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Frame Color Switcher */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-rose-400" />
                Change Frame Border Color
              </h3>
              <span className="text-xs text-zinc-400 font-medium">{activeColor.name}</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {FRAME_COLORS.map((c) => {
                const isActive = settings.frameColorId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onChangeSettings({ frameColorId: c.id })}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-zinc-800 border-rose-500 ring-2 ring-rose-500/20'
                        : 'bg-zinc-800/40 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-md border border-black/20"
                      style={{ backgroundColor: c.hexBg }}
                    />
                    <span
                      className={`text-[10px] truncate w-full text-center ${
                        isActive ? 'text-white' : 'text-zinc-400'
                      }`}
                    >
                      {c.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stickers & Doodles Decorator */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                Stickers & Stamps
              </h3>
              {settings.stickers.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearStickers}
                  className="text-[11px] text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All ({settings.stickers.length})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {STICKER_PALETTE.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleAddSticker(emoji)}
                  className="w-10 h-10 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 flex items-center justify-center text-xl transition-transform active:scale-90 cursor-pointer"
                  title={`Add ${emoji} sticker`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500">
              Tap any sticker above to stamp it onto your photostrip. Tap a placed sticker on the strip to remove it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
