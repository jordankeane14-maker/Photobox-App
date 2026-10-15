import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Smartphone, Sparkles, ExternalLink, Download } from 'lucide-react';
import type { PhotoboxSettings } from '../types/photobox.ts';

interface QRCodeModalProps {
  settings: PhotoboxSettings;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ settings, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate shareable URL
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?strip_id=${Date.now()}&title=${encodeURIComponent(
        settings.customTitle || 'Photobox'
      )}`
    : 'https://photobox.studio';

  useEffect(() => {
    QRCode.toDataURL(shareUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#18181b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [shareUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `photobox_qr_${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-5 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-left">
            <Smartphone className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Digital Photobox QR</h3>
              <p className="text-[11px] text-zinc-400">Scan to download on mobile</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR Code dialog"
            className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Graphic Frame */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner max-w-[260px] mx-auto border border-zinc-200">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Scan QR code for instant mobile photo transfer"
              className="w-56 h-56 object-contain"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-zinc-400 text-xs">
              Generating QR Code...
            </div>
          )}
          <span className="text-[10px] text-zinc-600 font-mono-num font-semibold mt-1">
            PHOTOBOX INSTANT PASS
          </span>
        </div>

        {/* Instruction badge */}
        <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/60 text-left flex items-start gap-2.5 text-xs text-zinc-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-300 leading-relaxed">
            Point your smartphone camera at the QR code to instantly open your digital photo strip, save to camera roll, or share to Instagram and TikTok!
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-[11px] text-zinc-400 font-mono-num truncate select-all outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl border border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="w-full py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-xl border border-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download QR</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
