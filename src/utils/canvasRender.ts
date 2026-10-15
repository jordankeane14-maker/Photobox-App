import type { CapturedPhoto, PhotoboxSettings } from '../types/photobox.ts';
import {
  calculateStripDimensions,
  formatCurrentDate,
  getFilterById,
  getFrameColorById,
} from './filterMath.ts';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Draws the complete high-resolution photostrip on a canvas and returns a high-quality dataURL.
 */
export async function renderPhotostripCanvas(
  photos: CapturedPhoto[],
  settings: PhotoboxSettings
): Promise<string> {
  const dims = calculateStripDimensions(settings.frameStyle, settings.photoCount);
  const color = getFrameColorById(settings.frameColorId);
  const filter = getFilterById(settings.filterId);

  const canvas = document.createElement('canvas');
  // 2x supersampling for ultra crisp print quality
  const scale = 2;
  canvas.width = dims.width * scale;
  canvas.height = dims.height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  ctx.scale(scale, scale);

  // 1. Draw frame background
  ctx.fillStyle = color.hexBg;
  ctx.fillRect(0, 0, dims.width, dims.height);

  // Optional subtle border
  ctx.strokeStyle = color.hexAccent + '33';
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, dims.width - 16, dims.height - 16);

  // 2. Header text
  ctx.save();
  ctx.fillStyle = color.hexText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 18px "Playfair Display", Georgia, serif';
  const headerY = dims.padding / 2 + dims.headerHeight / 2;
  ctx.fillText(settings.customTitle || 'PHOTOBOX STUDIO', dims.width / 2, headerY);

  // Small decorative accent line
  ctx.strokeStyle = color.hexAccent + '66';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(dims.width / 2 - 40, headerY + 16);
  ctx.lineTo(dims.width / 2 + 40, headerY + 16);
  ctx.stroke();
  ctx.restore();

  // 3. Draw each photo slot
  const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
    photos.map(async (p) => {
      try {
        return await loadImage(p.dataUrl);
      } catch {
        return null;
      }
    })
  );

  const startY = dims.padding + dims.headerHeight;

  for (let idx = 0; idx < settings.photoCount; idx++) {
    let col = 0;
    let row = idx;

    if (dims.columns === 2) {
      col = idx % 2;
      row = Math.floor(idx / 2);
    }

    const x = dims.padding + col * (dims.photoWidth + dims.gap);
    const y = startY + row * (dims.photoHeight + dims.gap);

    // Photo mat / card backing
    ctx.save();
    ctx.fillStyle = '#09090b';
    ctx.fillRect(x, y, dims.photoWidth, dims.photoHeight);

    const img = loadedImages[idx];
    if (img) {
      ctx.save();
      // Apply canvas filter
      if (filter.canvasFilter && filter.canvasFilter !== 'none') {
        ctx.filter = filter.canvasFilter;
      }

      // Clip to rounded rectangle
      const radius = 6;
      ctx.beginPath();
      ctx.roundRect(x, y, dims.photoWidth, dims.photoHeight, radius);
      ctx.clip();

      // Cover-fit image calculation
      const imgAspect = img.width / img.height;
      const targetAspect = dims.photoWidth / dims.photoHeight;
      let drawW = dims.photoWidth;
      let drawH = dims.photoHeight;
      let drawX = x;
      let drawY = y;

      if (imgAspect > targetAspect) {
        drawW = dims.photoHeight * imgAspect;
        drawX = x - (drawW - dims.photoWidth) / 2;
      } else {
        drawH = dims.photoWidth / imgAspect;
        drawY = y - (drawH - dims.photoHeight) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Soft photo inner border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, dims.photoWidth, dims.photoHeight);
    } else {
      // Empty placeholder slot
      ctx.fillStyle = '#27272a';
      ctx.fillRect(x, y, dims.photoWidth, dims.photoHeight);
      ctx.fillStyle = '#71717a';
      ctx.font = '14px "Space Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`[ SHOT ${idx + 1} ]`, x + dims.photoWidth / 2, y + dims.photoHeight / 2);
    }
    ctx.restore();
  }

  // 4. Footer Branding & Date
  const footerStartY = dims.height - dims.footerHeight;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Subtitle
  ctx.fillStyle = color.hexText;
  ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    settings.customSubtitle || 'MEMORIES · LIFE IN FRAMES',
    dims.width / 2,
    footerStartY + 28
  );

  // Date and location stamp
  ctx.fillStyle = color.hexAccent;
  ctx.font = '11px "Space Mono", monospace';
  const dateStr = settings.dateStamp ? formatCurrentDate() : '';
  const stampText = dateStr ? `${dateStr}  ·  PHOTOBOX NO. ${Math.floor(1000 + Math.random() * 9000)}` : 'PHOTOBOX NO. 4082';
  ctx.fillText(stampText, dims.width / 2, footerStartY + 50);

  // Retro mini barcode graphic
  const barcodeY = footerStartY + 68;
  const barcodeW = 140;
  const startBarcodeX = (dims.width - barcodeW) / 2;
  ctx.fillStyle = color.hexText;
  const barPattern = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 3, 2, 1, 4, 1, 2];
  let curX = startBarcodeX;
  barPattern.forEach((w, i) => {
    if (i % 2 === 0) {
      ctx.fillRect(curX, barcodeY, w, 14);
    }
    curX += w + 2;
  });

  ctx.restore();

  // 5. Render Stickers
  if (settings.stickers && settings.stickers.length > 0) {
    for (const sticker of settings.stickers) {
      ctx.save();
      const px = (sticker.xPercent / 100) * dims.width;
      const py = (sticker.yPercent / 100) * dims.height;

      ctx.translate(px, py);
      ctx.rotate((sticker.rotation * Math.PI) / 180);
      ctx.scale(sticker.scale, sticker.scale);

      ctx.font = '42px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.emoji, 0, 0);
      ctx.restore();
    }
  }

  return canvas.toDataURL('image/png');
}
