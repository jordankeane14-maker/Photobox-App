/**
 * Generates stylish, high-resolution demo photobooth shots for testing or fallback
 * when webcam is unavailable or permissions are denied.
 */
export function generateSamplePhoto(poseIndex: number): string {
  if (typeof document === 'undefined') return '';

  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const poses = [
    {
      bgTop: '#fda4af',
      bgBottom: '#f43f5e',
      vibe: 'Peace & Smile ✌️',
      emoji: '✌️',
      shirtColor: '#18181b',
      skinTone: '#ffd2ba',
      hairColor: '#382215',
      accessory: 'earrings',
    },
    {
      bgTop: '#93c5fd',
      bgBottom: '#2563eb',
      vibe: 'Cute Wink 😉',
      emoji: '😉',
      shirtColor: '#f8fafc',
      skinTone: '#fed7aa',
      hairColor: '#172554',
      accessory: 'sunglasses',
    },
    {
      bgTop: '#fde047',
      bgBottom: '#ea580c',
      vibe: 'Finger Heart 🫰',
      emoji: '🫰',
      shirtColor: '#15803d',
      skinTone: '#fbcfe8',
      hairColor: '#451a03',
      accessory: 'beret',
    },
    {
      bgTop: '#d8b4fe',
      bgBottom: '#7e22ce',
      vibe: 'Silly Face 🤪',
      emoji: '🤪',
      shirtColor: '#db2777',
      skinTone: '#fde047',
      hairColor: '#1e1b4b',
      accessory: 'stars',
    },
  ];

  const p = poses[poseIndex % poses.length];

  // Studio background gradient with subtle vignette
  const grad = ctx.createRadialGradient(320, 240, 50, 320, 240, 360);
  grad.addColorStop(0, p.bgTop);
  grad.addColorStop(1, p.bgBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Soft booth spotlight
  const spot = ctx.createRadialGradient(320, 180, 20, 320, 200, 260);
  spot.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  spot.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = spot;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Studio backdrop grid lines (subtle retro texture)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 40; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 40; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw stylized silhouette character
  // Shoulders / Torso
  ctx.fillStyle = p.shirtColor;
  ctx.beginPath();
  ctx.ellipse(320, 480, 190, 150, 0, Math.PI, 0, true);
  ctx.fill();

  // Neck
  ctx.fillStyle = p.skinTone;
  ctx.fillRect(290, 290, 60, 80);

  // Head
  ctx.beginPath();
  ctx.ellipse(320, 230, 95, 115, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair back / top
  ctx.fillStyle = p.hairColor;
  ctx.beginPath();
  ctx.arc(320, 210, 105, Math.PI * 0.8, Math.PI * 2.2);
  ctx.lineTo(410, 300);
  ctx.lineTo(230, 300);
  ctx.closePath();
  ctx.fill();

  // Cheeks blush
  ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
  ctx.beginPath();
  ctx.ellipse(265, 255, 22, 14, 0, 0, Math.PI * 2);
  ctx.ellipse(375, 255, 22, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#0f172a';
  if (poseIndex % 2 === 1) {
    // Wink!
    ctx.beginPath();
    ctx.arc(275, 225, 7, 0, Math.PI * 2);
    ctx.fill();
    // Arc for winking eye
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(365, 228, 12, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(275, 225, 7, 0, Math.PI * 2);
    ctx.arc(365, 225, 7, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(277, 222, 2.5, 0, Math.PI * 2);
    ctx.arc(367, 222, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smile
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#991b1b';
  ctx.beginPath();
  ctx.arc(320, 260, 24, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // Sparkles / pose emoji badge
  ctx.font = '54px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.emoji, 440, 260);

  // Retro photo booth timestamp at bottom-right
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 15px "Space Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`SHOT 0${poseIndex + 1} // STUDIO`, 610, 460);

  return canvas.toDataURL('image/jpeg', 0.92);
}
