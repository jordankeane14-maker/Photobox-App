import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, FlipHorizontal, Sparkles, Upload, AlertCircle } from 'lucide-react';
import type { FilterDefinition } from '../types/photobox.ts';
import { generateSamplePhoto } from '../utils/samplePoses.ts';

interface CameraViewfinderProps {
  filter: FilterDefinition;
  isMirrored: boolean;
  onToggleMirror: () => void;
  countdown: number | null; // e.g. 3, 2, 1, 0 (0 = "SMILE!")
  isFlashing: boolean;
  currentShotIndex: number;
  totalShots: number;
  isCapturing: boolean;
  onCaptureFrame: (dataUrl: string) => void;
  onDemoPhotoFallback?: () => void;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({
  filter,
  isMirrored,
  onToggleMirror,
  countdown,
  isFlashing,
  currentShotIndex,
  totalShots,
  isCapturing,
  onCaptureFrame,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'demo'>('requesting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera
  const startCamera = useCallback(async (deviceId?: string) => {
    setCameraState('requesting');
    setErrorMessage('');

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API is not supported in this environment');
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 960 } }
          : { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState('active');

      // Enumerate available video inputs
      try {
        const devList = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = devList.filter((d) => d.kind === 'videoinput');
        setDevices(videoDevs);
      } catch {
        // Enumerate error ignored
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera access was denied or unavailable.';
      setErrorMessage(msg);
      setCameraState('denied');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  // Switch camera device
  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const devId = e.target.value;
    setSelectedDeviceId(devId);
    startCamera(devId);
  };

  // Switch to demo mode
  const activateDemoMode = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraState('demo');
  };

  // Capture current frame from video or fallback
  const captureCurrentFrame = useCallback(() => {
    if (cameraState === 'active' && videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 960;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (isMirrored) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onCaptureFrame(dataUrl);
        return;
      }
    }

    // Fallback: generate high-quality sample photobooth shot
    const sample = generateSamplePhoto(currentShotIndex);
    onCaptureFrame(sample);
  }, [cameraState, isMirrored, currentShotIndex, onCaptureFrame]);

  // Trigger capture if signaled externally
  useEffect(() => {
    if (isCapturing) {
      captureCurrentFrame();
    }
  }, [isCapturing, captureCurrentFrame]);

  // Handle manual file upload as a shot
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCaptureFrame(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl aspect-[4/3] flex items-center justify-center select-none group">
      {/* Live Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          filter: filter.cssFilter,
          transform: isMirrored ? 'scaleX(-1)' : 'none',
        }}
        className={`w-full h-full object-cover transition-all duration-300 ${
          cameraState === 'active' ? 'opacity-100' : 'hidden'
        }`}
      />

      {/* Demo / Fallback Mode Viewfinder */}
      {cameraState === 'demo' && (
        <div
          style={{ filter: filter.cssFilter }}
          className="w-full h-full relative overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-900 to-black flex flex-col items-center justify-center p-6 text-center"
        >
          {/* Animated booth viewfinder backdrop */}
          <div className="w-56 h-56 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 relative animate-pulse">
            <span className="text-6xl">📸</span>
          </div>
          <p className="text-zinc-200 font-medium text-base mb-1">Photobox Studio Demo Feed</p>
          <p className="text-zinc-400 text-xs max-w-sm mb-4">
            Simulated high-res photobooth camera ready. Starts automated multi-shot sequence with timer & poses.
          </p>
          <button
            type="button"
            onClick={() => startCamera()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors border border-zinc-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Real Webcam
          </button>
        </div>
      )}

      {/* Permission Denied / Error State */}
      {cameraState === 'denied' && (
        <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center p-4 sm:p-8 text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-2 sm:mb-3">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-zinc-100 font-semibold text-base sm:text-lg mb-1">Camera Not Connected</h3>
          <p className="text-zinc-400 text-[11px] sm:text-xs max-w-sm mb-3 sm:mb-4 leading-relaxed">
            {errorMessage || 'Camera access is required for live photo booth shots.'} You can use our photobox simulator mode or upload existing photos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={activateDemoMode}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-rose-500/20"
            >
              Use Studio Demo Poses
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl transition-colors border border-zinc-700 flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => startCamera()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Requesting Camera Spinner */}
      {cameraState === 'requesting' && (
        <div className="flex flex-col items-center justify-center gap-3 text-zinc-400 text-sm">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span>Starting camera feed...</span>
        </div>
      )}

      {/* Hidden file input for uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Viewfinder Target Framing Overlay - only show when camera or demo is active */}
      {(cameraState === 'active' || cameraState === 'demo') && (
        <div className="absolute inset-4 pointer-events-none border border-white/10 rounded-2xl flex flex-col justify-between p-3">
          {/* Top Viewfinder Bar */}
          <div className="flex items-center justify-between text-xs text-white/70 font-mono-num drop-shadow">
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              SHOT {currentShotIndex + 1} / {totalShots}
            </span>
            <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {filter.name}
            </span>
          </div>

          {/* Framing Crosshair Guides */}
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-t border-l border-white/30 absolute top-4 left-4" />
            <div className="w-8 h-8 border-t border-r border-white/30 absolute top-4 right-4" />
            <div className="w-8 h-8 border-b border-l border-white/30 absolute bottom-4 left-4" />
            <div className="w-8 h-8 border-b border-r border-white/30 absolute bottom-4 right-4" />
          </div>

          {/* Viewfinder bottom indicator */}
          <div className="text-center font-mono-num text-[11px] text-white/50 tracking-wider">
            PHOTOBOX LIVE STREAM · 4:3
          </div>
        </div>
      )}

      {/* Viewfinder Quick Controls (Mirror, Device Switch, Demo mode) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {cameraState === 'active' && devices.length > 1 && (
          <select
            value={selectedDeviceId}
            onChange={handleDeviceChange}
            aria-label="Select camera device"
            className="bg-black/60 backdrop-blur-md text-white text-xs border border-white/10 rounded-lg px-2 py-1 outline-none focus:border-rose-500"
          >
            {devices.map((d, i) => (
              <option key={d.deviceId || i} value={d.deviceId} className="bg-zinc-900 text-white">
                {d.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={onToggleMirror}
          title={isMirrored ? 'Unmirror camera' : 'Mirror camera'}
          aria-label="Toggle camera mirror mode"
          className="p-2 bg-black/60 hover:bg-black/80 text-white/90 backdrop-blur-md rounded-xl border border-white/10 transition-colors"
        >
          <FlipHorizontal className="w-4 h-4" />
        </button>

        {cameraState !== 'demo' && (
          <button
            type="button"
            onClick={activateDemoMode}
            title="Switch to Demo Poses"
            aria-label="Switch to demo poses"
            className="p-2 bg-black/60 hover:bg-black/80 text-white/90 backdrop-blur-md rounded-xl border border-white/10 transition-colors flex items-center gap-1 text-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Demo</span>
          </button>
        )}
      </div>

      {/* Countdown Visual Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/25 backdrop-blur-[2px] transition-all">
          <div className="text-center">
            {countdown > 0 ? (
              <div
                key={countdown}
                className="text-8xl md:text-9xl font-bold font-mono-num text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)] scale-110 animate-bounce"
              >
                {countdown}
              </div>
            ) : (
              <div className="text-5xl md:text-6xl font-serif-title font-bold text-amber-300 drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)] animate-pulse">
                SMILE! ✨
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shutter Flash Animation Overlay */}
      {isFlashing && (
        <div className="absolute inset-0 z-40 bg-white animate-camera-flash pointer-events-none" />
      )}
    </div>
  );
};
