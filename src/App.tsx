import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Printer, QrCode, Sparkles, RefreshCw, Layers, ShieldCheck } from 'lucide-react';
import type { CapturedPhoto, FilterDefinition, PhotoboxSettings } from './types/photobox.ts';
import { getFilterById } from './utils/filterMath.ts';
import { CameraViewfinder } from './components/CameraViewfinder.tsx';
import { ControlsPanel } from './components/ControlsPanel.tsx';
import { PhotoReview } from './components/PhotoReview.tsx';
import { PrintPreviewModal } from './components/PrintPreviewModal.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import { sounds } from './utils/audio.ts';
import { generateSamplePhoto } from './utils/samplePoses.ts';

const DEFAULT_SETTINGS: PhotoboxSettings = {
  photoCount: 4,
  countdownSeconds: 3,
  filterId: 'vintage',
  frameStyle: 'classic_strip',
  frameColorId: 'charcoal',
  isMirrored: true,
  isSoundEnabled: true,
  dateStamp: true,
  customTitle: 'PHOTOBOX STUDIO',
  customSubtitle: 'MEMORIES · LIFE IN FRAMES',
  stickers: [],
};

export default function App() {
  const [settings, setSettings] = useState<PhotoboxSettings>(DEFAULT_SETTINGS);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [sessionMode, setSessionMode] = useState<'idle' | 'shooting' | 'retaking_single' | 'review'>('idle');
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);

  // Countdown & Flash state
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isCapturingSignal, setIsCapturingSignal] = useState<boolean>(false);

  // Modals
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Audio sync
  useEffect(() => {
    sounds.enabled = settings.isSoundEnabled;
  }, [settings.isSoundEnabled]);

  // Handle URL autostart if present (?autostart=1)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        // Auto-seed with demo photos and open review mode immediately
        const demoPhotos: CapturedPhoto[] = [0, 1, 2, 3].map((idx) => ({
          id: `shot_${idx}_${Date.now()}`,
          slotIndex: idx,
          dataUrl: generateSamplePhoto(idx),
          timestamp: Date.now(),
        }));
        setPhotos(demoPhotos);
        setSessionMode('review');
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<PhotoboxSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Automated sequence runner reference
  const sequenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  /**
   * Run countdown for a single photo shot
   */
  const runShotCountdown = useCallback(
    (shotIdx: number, onComplete: () => void) => {
      let currentCount = settings.countdownSeconds;
      setCountdown(currentCount);
      sounds.playCountdownBeep(false);

      const interval = setInterval(() => {
        currentCount -= 1;
        if (currentCount > 0) {
          setCountdown(currentCount);
          sounds.playCountdownBeep(false);
        } else if (currentCount === 0) {
          setCountdown(0); // "SMILE!"
          sounds.playCountdownBeep(true);
        } else {
          clearInterval(interval);
          setCountdown(null);
          // Trigger shutter snap & flash
          sounds.playShutterSound();
          setIsFlashing(true);
          setTimeout(() => setIsFlashing(false), 400);
          // Tell viewfinder to capture the frame
          setIsCapturingSignal(true);
          setTimeout(() => {
            setIsCapturingSignal(false);
            onComplete();
          }, 150);
        }
      }, 1000);
    },
    [settings.countdownSeconds]
  );

  /**
   * Start multi-shot session (e.g. 1, 2, 3, or 4 shots in succession)
   */
  const handleStartSession = () => {
    clearTimers();
    setPhotos([]);
    setCurrentShotIndex(0);
    setSessionMode('shooting');

    const takeNext = (idx: number) => {
      setCurrentShotIndex(idx);
      runShotCountdown(idx, () => {
        // Next shot or complete
        if (idx + 1 < settings.photoCount) {
          // Pause 1.8 seconds between shots for pose change
          sequenceTimerRef.current = setTimeout(() => {
            takeNext(idx + 1);
          }, 1800);
        } else {
          // Finished all photos in session!
          sounds.playChime();
          setTimeout(() => {
            setSessionMode('review');
          }, 600);
        }
      });
    };

    takeNext(0);
  };

  /**
   * Take a single snapshot
   */
  const handleTakeSingleShot = () => {
    clearTimers();
    const targetIndex = photos.length < settings.photoCount ? photos.length : 0;
    setCurrentShotIndex(targetIndex);

    runShotCountdown(targetIndex, () => {
      if (photos.length + 1 >= settings.photoCount) {
        sounds.playChime();
        setTimeout(() => setSessionMode('review'), 500);
      }
    });
  };

  /**
   * Retake a specific individual shot from review
   */
  const handleRetakeSingle = (index: number) => {
    setRetakeIndex(index);
    setCurrentShotIndex(index);
    setSessionMode('retaking_single');

    // Run countdown for this specific retake shot
    setTimeout(() => {
      runShotCountdown(index, () => {
        sounds.playChime();
        setRetakeIndex(null);
        setTimeout(() => {
          setSessionMode('review');
        }, 500);
      });
    }, 600);
  };

  /**
   * Retake all shots from scratch
   */
  const handleRetakeAll = () => {
    setPhotos([]);
    setSessionMode('idle');
    setTimeout(() => {
      handleStartSession();
    }, 200);
  };

  /**
   * Receive captured image dataUrl from CameraViewfinder
   */
  const handleCapturedFrame = (dataUrl: string) => {
    if (sessionMode === 'retaking_single' && retakeIndex !== null) {
      // Replace specific slot
      setPhotos((prev) => {
        const next = [...prev];
        next[retakeIndex] = {
          id: `shot_${retakeIndex}_${Date.now()}`,
          slotIndex: retakeIndex,
          dataUrl,
          timestamp: Date.now(),
        };
        return next;
      });
    } else {
      // Append or insert at currentShotIndex
      setPhotos((prev) => {
        const next = [...prev];
        next[currentShotIndex] = {
          id: `shot_${currentShotIndex}_${Date.now()}`,
          slotIndex: currentShotIndex,
          dataUrl,
          timestamp: Date.now(),
        };
        return next;
      });
    }
  };

  // Seed sample photos button for instant review testing
  const handleLoadSampleBooth = () => {
    const demoPhotos: CapturedPhoto[] = Array.from({ length: settings.photoCount }).map(
      (_, idx) => ({
        id: `shot_${idx}_${Date.now()}`,
        slotIndex: idx,
        dataUrl: generateSamplePhoto(idx),
        timestamp: Date.now(),
      })
    );
    setPhotos(demoPhotos);
    sounds.playChime();
    setSessionMode('review');
  };

  const activeFilter = getFilterById(settings.filterId);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* 
        Top Bar Contract:
        [Brand title, one line] — [4-5 nav links, 1-2 word labels, single-line] — [1 primary action]
      */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 no-print">
        {/* Zone 1: Brand wordmark */}
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center text-sm font-serif-title font-bold shadow-md shadow-rose-500/20">
            P
          </span>
          <span>Photobox Studio</span>
        </a>

        {/* Zone 2: 4 nav links, single-line */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <button
            type="button"
            onClick={() => setSessionMode('idle')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              sessionMode === 'idle' || sessionMode === 'shooting' ? 'text-white' : ''
            }`}
          >
            Live Booth
          </button>
          <button
            type="button"
            disabled={photos.length === 0}
            onClick={() => setSessionMode('review')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40 ${
              sessionMode === 'review' ? 'text-white' : ''
            }`}
          >
            Review & Frames
          </button>
          <button
            type="button"
            disabled={photos.length === 0}
            onClick={() => setShowPrintModal(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-40"
          >
            Print Preview
          </button>
          <button
            type="button"
            onClick={handleLoadSampleBooth}
            className="hover:text-rose-400 text-rose-400/90 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sample Poses
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {sessionMode === 'review' ? (
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all shadow-md shadow-rose-500/20 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Strip</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={sessionMode === 'shooting'}
              onClick={handleStartSession}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-rose-500/20 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Booth</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col justify-start">
        {sessionMode === 'review' ? (
          /* Review & Customization Screen */
          <PhotoReview
            photos={photos}
            settings={settings}
            onChangeSettings={updateSettings}
            onRetakeSingle={handleRetakeSingle}
            onRetakeAll={handleRetakeAll}
            onOpenPrintPreview={() => setShowPrintModal(true)}
            onOpenQRCode={() => setShowQRModal(true)}
            onBackToCamera={() => setSessionMode('idle')}
          />
        ) : (
          /* Live Camera Viewfinder & Controls Screen */
          <div className="space-y-6">
            {/* Viewfinder Header Banner */}
            <div className="text-center max-w-xl mx-auto space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif-title">
                {sessionMode === 'shooting'
                  ? `Taking Shot ${currentShotIndex + 1} of ${settings.photoCount}...`
                  : sessionMode === 'retaking_single'
                  ? `Retaking Shot #${(retakeIndex ?? 0) + 1}...`
                  : 'Classic Photobox Studio'}
              </h1>
              <p className="text-xs text-zinc-400">
                {sessionMode === 'shooting'
                  ? 'Pose and get ready for the countdown flash!'
                  : 'Select photo count, choose vintage or modern filters, and strike your best pose.'}
              </p>
            </div>

            {/* Viewfinder Display */}
            <CameraViewfinder
              filter={activeFilter}
              isMirrored={settings.isMirrored}
              onToggleMirror={() => updateSettings({ isMirrored: !settings.isMirrored })}
              countdown={countdown}
              isFlashing={isFlashing}
              currentShotIndex={currentShotIndex}
              totalShots={settings.photoCount}
              isCapturing={isCapturingSignal}
              onCaptureFrame={handleCapturedFrame}
            />

            {/* Controls Panel */}
            <ControlsPanel
              settings={settings}
              onChangeSettings={updateSettings}
              isShooting={sessionMode === 'shooting' || sessionMode === 'retaking_single'}
              onStartSession={handleStartSession}
              onTakeSingleShot={handleTakeSingleShot}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-5 px-6 text-center text-xs text-zinc-500 no-print flex flex-col sm:flex-row items-center justify-between gap-3 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-400">PHOTOBOX STUDIO</span>
          <span>·</span>
          <span>Instant Korean Photo Booth &amp; Digital Strip Generator</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <button
            type="button"
            onClick={handleLoadSampleBooth}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Load Demo Poses
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => setShowQRModal(true)}
            aria-label="Open mobile QR code generator from footer"
            className="hover:text-white transition-colors cursor-pointer"
          >
            Instant QR Generator
          </button>
        </div>
      </footer>

      {/* Print Preview & Print Out Modal */}
      {showPrintModal && (
        <PrintPreviewModal
          photos={photos.length > 0 ? photos : Array.from({ length: settings.photoCount }).map((_, i) => ({
            id: `seed_${i}`,
            slotIndex: i,
            dataUrl: generateSamplePhoto(i),
            timestamp: Date.now(),
          }))}
          settings={settings}
          onClose={() => setShowPrintModal(false)}
          onOpenQRCode={() => {
            setShowPrintModal(false);
            setShowQRModal(true);
          }}
        />
      )}

      {/* QR Code Digital Sharing Modal */}
      {showQRModal && (
        <QRCodeModal
          settings={settings}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
}
