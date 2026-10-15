import React, { useEffect, useState } from 'react';
import { Printer, Download, QrCode, X, Sparkles, Check, ChevronLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CapturedPhoto, PhotoboxSettings } from '../types/photobox.ts';
import { renderPhotostripCanvas } from '../utils/canvasRender.ts';
import { getFrameColorById } from '../utils/filterMath.ts';

interface PrintPreviewModalProps {
  photos: CapturedPhoto[];
  settings: PhotoboxSettings;
  onClose: () => void;
  onOpenQRCode: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  photos,
  settings,
  onClose,
  onOpenQRCode,
}) => {
  const [renderedImageUrl, setRenderedImageUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const activeColor = getFrameColorById(settings.frameColorId);

  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    renderPhotostripCanvas(photos, settings)
      .then((url) => {
        if (isMounted) {
          setRenderedImageUrl(url);
          setIsGenerating(false);
          // Launch subtle celebratory burst
          try {
            if (typeof window !== 'undefined' && !navigator.userAgent.includes('Headless')) {
              confetti({
                particleCount: 35,
                spread: 50,
                origin: { y: 0.7 },
                disableForReducedMotion: true,
                zIndex: 40,
              });
            }
          } catch {
            // Ignore confetti error
          }
        }
      })
      .catch((err) => {
        console.error('Canvas render failed', err);
        setIsGenerating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [photos, settings]);

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      console.error('Print failed', e);
    }
  };

  const handleDownload = () => {
    if (!renderedImageUrl) return;
    const link = document.createElement('a');
    link.download = `photobox_${Date.now()}.png`;
    link.href = renderedImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = async () => {
    if (!renderedImageUrl) return;
    try {
      const res = await fetch(renderedImageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
      setIsCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-zinc-100">
              Print Preview & High-Res Export
            </h2>
            <span className="text-xs text-zinc-500 font-mono-num hidden sm:inline">
              · 300 DPI Photo Quality
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close print preview"
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split view of rendered photostrip vs print options */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-center">
          {/* Printable photostrip container */}
          <div className="md:col-span-7 flex flex-col items-center justify-center">
            {isGenerating ? (
              <div className="h-96 flex flex-col items-center justify-center gap-3 text-zinc-400">
                <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Rendering 300-DPI high-res photostrip...</span>
              </div>
            ) : (
              <div
                id="printable-photobox-area"
                className="relative bg-white/5 p-4 rounded-2xl border border-white/10 shadow-2xl max-h-[68vh] overflow-y-auto flex justify-center items-center"
              >
                {renderedImageUrl ? (
                  <img
                    src={renderedImageUrl}
                    alt="High resolution photostrip print preview"
                    className="max-h-[62vh] w-auto rounded-lg shadow-xl object-contain"
                  />
                ) : (
                  <div className="text-zinc-500 text-xs">Preview unavailable</div>
                )}
              </div>
            )}
            <p className="text-[11px] text-zinc-500 mt-2 font-mono-num no-print">
              Formatted for 2&quot;x6&quot; standard photobooth strip or 4&quot;x6&quot; photo paper
            </p>
          </div>

          {/* Right column: Print & Share Action Panel */}
          <div className="md:col-span-5 space-y-4 no-print">
            <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 mb-1">
                  Ready to Print & Share
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Your photo strip is assembled with {settings.photoCount} shots, &quot;{settings.customTitle}&quot; frame, and real-time color styling.
                </p>
              </div>

              {/* Main Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="w-full py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <Printer className="w-4 h-4" />
                <span>Print Out Now</span>
              </button>

              {/* Download PNG Button */}
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-3 px-4 bg-zinc-700/80 hover:bg-zinc-700 text-zinc-100 font-medium text-xs rounded-xl border border-zinc-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-rose-400" />
                <span>Save High-Res PNG</span>
              </button>

              {/* QR Code Share Button */}
              <button
                type="button"
                onClick={onOpenQRCode}
                className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-xs rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>Digital Sharing (QR Code)</span>
              </button>

              {/* Copy image button */}
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="w-full py-2.5 px-3 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <span>Copy Image to Clipboard</span>
                )}
              </button>
            </div>

            {/* Print tips note */}
            <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
              <span className="font-semibold text-zinc-300 block">🖨️ Printing Tip:</span>
              <p>
                In the browser print dialog, choose &quot;Save as PDF&quot; or your photo printer. Select &quot;More settings&quot; &rarr; enable &quot;Background graphics&quot; for full vibrant colors.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-zinc-950/80 border-t border-zinc-800 text-xs text-zinc-400 no-print">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Edit & Retake
          </button>
          <span className="font-mono-num text-[11px] text-zinc-500">
            PHOTOBOX v2.0 · PRINT MODULE
          </span>
        </div>
      </div>
    </div>
  );
};
