import React from 'react';
import { Volume2, VolumeX, Sparkles, Sliders, Calendar, Type, Palette } from 'lucide-react';
import type { FilterId, FrameStyle, PhotoboxSettings } from '../types/photobox.ts';
import { FRAME_COLORS, PHOTO_FILTERS } from '../utils/filterMath.ts';

interface ControlsPanelProps {
  settings: PhotoboxSettings;
  onChangeSettings: (newSettings: Partial<PhotoboxSettings>) => void;
  isShooting: boolean;
  onStartSession: () => void;
  onTakeSingleShot: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  settings,
  onChangeSettings,
  isShooting,
  onStartSession,
  onTakeSingleShot,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          disabled={isShooting}
          onClick={onStartSession}
          className="w-full sm:flex-1 py-4 px-6 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold text-base rounded-2xl shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-rose-100" />
          <span>{isShooting ? 'Capturing Session...' : `Start ${settings.photoCount}-Shot Photo Booth`}</span>
        </button>

        <button
          type="button"
          disabled={isShooting}
          onClick={onTakeSingleShot}
          className="w-full sm:w-auto py-4 px-5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-200 font-medium text-sm rounded-2xl border border-zinc-800 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.99] cursor-pointer"
        >
          <span>Single Snap ({settings.countdownSeconds}s)</span>
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 space-y-6">
        {/* Section 1: Photo Count & Countdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-5 border-b border-zinc-800/80">
          {/* Photo Count Selection (1, 2, 3, 4) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Number of Photos
              </label>
              <span className="text-xs text-zinc-500">
                {settings.photoCount === 1
                  ? 'Single Portrait'
                  : settings.photoCount === 4
                  ? 'Korean 4-Cut Classic'
                  : `${settings.photoCount} Photos Strip`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {([1, 2, 3, 4] as const).map((count) => {
                const isActive = settings.photoCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    disabled={isShooting}
                    onClick={() => onChangeSettings({ photoCount: count })}
                    className={`py-2.5 rounded-xl font-mono-num text-sm font-semibold transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                        : 'bg-zinc-800/60 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800'
                    }`}
                  >
                    {count} {count === 1 ? 'Shot' : 'Shots'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Countdown Selection */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Countdown Timer
              </label>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <button
                  type="button"
                  onClick={() => onChangeSettings({ isSoundEnabled: !settings.isSoundEnabled })}
                  className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  title="Toggle sound"
                >
                  {settings.isSoundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Audio On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Muted</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([3, 5, 10] as const).map((secs) => {
                const isActive = settings.countdownSeconds === secs;
                return (
                  <button
                    key={secs}
                    type="button"
                    disabled={isShooting}
                    onClick={() => onChangeSettings({ countdownSeconds: secs })}
                    className={`py-2.5 rounded-xl font-mono-num text-sm font-semibold transition-all border cursor-pointer ${
                      isActive
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-100 shadow-sm'
                        : 'bg-zinc-800/60 text-zinc-300 border-zinc-700/60 hover:bg-zinc-800'
                    }`}
                  >
                    {secs}s Timer
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2: Real-time Filters */}
        <div className="space-y-3 pb-5 border-b border-zinc-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-rose-400" />
              Filter Preset
            </label>
            <span className="text-xs text-rose-400 font-medium">
              {PHOTO_FILTERS.find((f) => f.id === settings.filterId)?.name}
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
            {PHOTO_FILTERS.map((f) => {
              const isActive = settings.filterId === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChangeSettings({ filterId: f.id as FilterId })}
                  className={`group flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all text-center cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 border-rose-500 shadow-sm'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-full border border-white/20 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: f.previewHue }}
                  />
                  <span
                    className={`text-[11px] truncate w-full font-medium ${
                      isActive ? 'text-rose-400' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    {f.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Frame Color & Layout Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-400" />
              Frame Color & Layout
            </label>
          </div>

          {/* Frame Style Layout */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onChangeSettings({ frameStyle: 'classic_strip' as FrameStyle })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                settings.frameStyle === 'classic_strip'
                  ? 'bg-zinc-800 border-rose-500 text-white'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Classic Photostrip (Vertical)
            </button>
            <button
              type="button"
              disabled={settings.photoCount < 4}
              onClick={() => onChangeSettings({ frameStyle: 'grid_2x2' as FrameStyle })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                settings.frameStyle === 'grid_2x2'
                  ? 'bg-zinc-800 border-rose-500 text-white'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30'
              }`}
            >
              2x2 Quad Grid {settings.photoCount < 4 && '(Needs 4 Shots)'}
            </button>
          </div>

          {/* Frame Colors Palette */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {FRAME_COLORS.map((color) => {
              const isActive = settings.frameColorId === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onChangeSettings({ frameColorId: color.id })}
                  title={color.name}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all text-center cursor-pointer ${
                    isActive
                      ? 'bg-zinc-800 border-rose-500 ring-2 ring-rose-500/30'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span
                    className="w-6 h-6 rounded-lg border border-black/20 shadow-inner"
                    style={{ backgroundColor: color.hexBg }}
                  />
                  <span
                    className={`text-[10px] truncate w-full ${
                      isActive ? 'text-white font-medium' : 'text-zinc-400'
                    }`}
                  >
                    {color.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Header / Subtitle / Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[11px] text-zinc-400 font-medium flex items-center gap-1 mb-1">
                <Type className="w-3 h-3 text-zinc-500" />
                Frame Title
              </label>
              <input
                type="text"
                value={settings.customTitle}
                onChange={(e) => onChangeSettings({ customTitle: e.target.value })}
                placeholder="PHOTOBOX STUDIO"
                maxLength={28}
                className="w-full px-3 py-1.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 font-medium flex items-center gap-1 mb-1">
                <Type className="w-3 h-3 text-zinc-500" />
                Subtitle
              </label>
              <input
                type="text"
                value={settings.customSubtitle}
                onChange={(e) => onChangeSettings({ customSubtitle: e.target.value })}
                placeholder="MEMORIES · SEOUL"
                maxLength={32}
                className="w-full px-3 py-1.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex items-end">
              <label className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-zinc-300 cursor-pointer hover:bg-zinc-800">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  Date Stamp
                </span>
                <input
                  type="checkbox"
                  checked={settings.dateStamp}
                  onChange={(e) => onChangeSettings({ dateStamp: e.target.checked })}
                  className="rounded text-rose-500 focus:ring-0 bg-zinc-900 border-zinc-700"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
