// Draws a multi-panel GTA-style poster cover onto a canvas.
// The cover is the app's own art: slanted photo panels, a sunset neon grade
// and bold condensed caption lettering. Nothing here copies any game's art,
// logo or font: the caption font is Anton, an OFL font shipped under app/fonts.

export const SIZES = {
  square: { w: 1080, h: 1080, label: 'Square 1080 x 1080' },
  portrait: { w: 1080, h: 1350, label: 'Portrait 1080 x 1350' },
  wide: { w: 1920, h: 1080, label: 'Wide 1920 x 1080' },
};

export const LAYOUTS = {
  trio: 'Vice trio',
  strip: 'Sunset strip',
  grid: 'Neon grid',
};

/** A fresh cover state: three photo slots, three panels, caption and grade. */
export function defaultState() {
  return {
    size: 'wide',
    layout: 'trio',
    caption: 'Sunset Heist',
    subcaption: 'Boulevard Queen',
    captionScale: 1,
    sunset: 0.7,
    neon: true,
    grain: true,
    fillOne: true,
    photos: [null, null, null],
    panelPhoto: [0, 0, 0, 0],
    crop: [
      { zoom: 1, x: 0, y: 0 },
      { zoom: 1, x: 0, y: 0 },
      { zoom: 1, x: 0, y: 0 },
      { zoom: 1, x: 0, y: 0 },
    ],
    activePanel: 0,
  };
}

/** The three panel polygons for a layout, each a list of [x, y] corners. */
export function panelShapes(layout, w, h) {
  const g = Math.max(6, Math.round(w * 0.008));
  const s = Math.round(w * 0.035);
  if (layout === 'strip') {
    return [
      [[0, 0], [w / 3, 0], [w / 3 - s, h], [0, h]],
      [[w / 3 + g, 0], [(2 * w) / 3, 0], [(2 * w) / 3 - s, h], [w / 3 - s + g, h]],
      [[(2 * w) / 3 + g, 0], [w, 0], [w, h], [(2 * w) / 3 - s + g, h]],
    ];
  }
  if (layout === 'grid') {
    return [
      [[0, 0], [w / 2 - g / 2, 0], [w / 2 - g / 2, h / 2 - g / 2], [0, h / 2 - g / 2]],
      [[w / 2 + g / 2, 0], [w, 0], [w, h / 2 - g / 2], [w / 2 + g / 2, h / 2 - g / 2]],
      [[0, h / 2 + g / 2], [w / 2 - g / 2, h / 2 + g / 2], [w / 2 - g / 2, h], [0, h]],
      [[w / 2 + g / 2, h / 2 + g / 2], [w, h / 2 + g / 2], [w, h], [w / 2 + g / 2, h]],
    ];
  }
  if (h > w) {
    // Portrait trio: hero on top, two panels below side by side.
    const heroBottom = h * 0.55;
    return [
      [[0, 0], [w, 0], [w, heroBottom], [0, heroBottom - s]],
      [[0, heroBottom - s + g], [w / 2 - g / 2, heroBottom + g], [w / 2 - g / 2 - s / 2, h], [0, h]],
      [[w / 2 + g / 2, heroBottom + g], [w, heroBottom], [w, h], [w / 2 - g / 2 - s / 2 + g, h]],
    ];
  }
  // Landscape and square trio: hero on the left, two panels stacked right.
  const heroRight = w * 0.6;
  const midY = h * 0.5;
  return [
    [[0, 0], [heroRight, 0], [heroRight - s, h], [0, h]],
    [[heroRight + g, 0], [w, 0], [w, midY - g / 2], [heroRight - s + g, midY - g / 2]],
    [[heroRight - s + g, midY + g / 2], [w, midY + g / 2], [w, h], [heroRight - s, h]],
  ];
}

/** Bounding box of a polygon: [x, y, width, height]. */
export function shapeBounds(points) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  return [x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0];
}

function clipShape(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.clip();
}

/** Draws one photo into a panel, cover-fit with the panel's crop settings. */
export function drawPhotoInPanel(ctx, photo, points, crop) {
  const [bx, by, bw, bh] = shapeBounds(points);
  ctx.save();
  clipShape(ctx, points);
  if (!photo) {
    const grad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    grad.addColorStop(0, '#3b1d5e');
    grad.addColorStop(0.55, '#7a1e6e');
    grad.addColorStop(1, '#c2337f');
    ctx.fillStyle = grad;
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.font = `bold ${Math.round(bh * 0.05)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('ADD A PHOTO', bx + bw / 2, by + bh / 2);
  } else {
    const base = Math.max(bw / photo.naturalWidth, bh / photo.naturalHeight);
    const scale = base * crop.zoom;
    const pw = photo.naturalWidth * scale;
    const ph = photo.naturalHeight * scale;
    const dx = bx + (bw - pw) / 2 + crop.x * bw * 0.25;
    const dy = by + (bh - ph) / 2 + crop.y * bh * 0.25;
    ctx.drawImage(photo, dx, dy, pw, ph);
  }
  ctx.restore();
}

/** A sunset wash over a panel: warm at the foot, clear at the top. */
function sunsetWash(ctx, points, strength) {
  if (strength <= 0) return;
  const [bx, by, bw, bh] = shapeBounds(points);
  ctx.save();
  clipShape(ctx, points);
  const wash = ctx.createLinearGradient(0, by + bh * 0.25, 0, by + bh);
  wash.addColorStop(0, 'rgba(255, 120, 60, 0)');
  wash.addColorStop(0.6, `rgba(255, 90, 80, ${0.22 * strength})`);
  wash.addColorStop(1, `rgba(200, 30, 140, ${0.42 * strength})`);
  ctx.fillStyle = wash;
  ctx.fillRect(bx, by, bw, bh);
  ctx.restore();
}

/** Neon gutter glow: pink light along every panel edge. */
function neonGutters(ctx, shapes, w) {
  ctx.save();
  ctx.strokeStyle = '#ff2e88';
  ctx.lineWidth = Math.max(2, w * 0.0025);
  ctx.shadowColor = '#ff2e88';
  ctx.shadowBlur = Math.max(6, w * 0.012);
  for (const points of shapes) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

/** A seeded grain pattern, the same on every run. */
let grainTile = null;
function grainPattern(ctx) {
  if (grainTile) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(128, 128);
  let seed = 1337;
  const next = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(next() * 255);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  grainTile = ctx.createPattern(tile, 'repeat');
  return grainTile;
}

/** The caption band: sunset gradient, bold condensed lettering, neon rule. */
function drawCaptionBand(ctx, state, w, h) {
  const bandTop = h * 0.74;
  const band = ctx.createLinearGradient(0, bandTop, 0, h);
  band.addColorStop(0, 'rgba(24, 4, 48, 0)');
  band.addColorStop(0.45, 'rgba(24, 4, 48, 0.55)');
  band.addColorStop(1, 'rgba(24, 4, 48, 0.88)');
  ctx.fillStyle = band;
  ctx.fillRect(0, bandTop, w, h - bandTop);

  const caption = state.caption.trim().toUpperCase();
  if (caption) {
    let size = h * 0.115 * state.captionScale;
    ctx.font = `${size}px Anton, sans-serif`;
    while (ctx.measureText(caption).width > w * 0.92 && size > 16) {
      size -= 2;
      ctx.font = `${size}px Anton, sans-serif`;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(10, 0, 20, 0.9)';
    ctx.lineWidth = size * 0.14;
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.03;
    const y = h - h * 0.075;
    ctx.strokeText(caption, w / 2, y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(caption, w / 2, y);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  const sub = state.subcaption.trim().toUpperCase();
  if (sub) {
    const size = Math.max(14, h * 0.028);
    ctx.font = `bold ${size}px sans-serif`;
    ctx.textAlign = 'center';
    const subY = h - h * 0.028;
    ctx.lineWidth = size * 0.18;
    ctx.strokeStyle = 'rgba(10, 0, 20, 0.85)';
    ctx.strokeText(sub, w / 2, subY);
    ctx.fillStyle = '#ffd166';
    ctx.fillText(sub, w / 2, subY);
  }

  ctx.strokeStyle = '#37e6ff';
  ctx.lineWidth = Math.max(2, h * 0.004);
  ctx.shadowColor = '#37e6ff';
  ctx.shadowBlur = Math.max(6, h * 0.012);
  ctx.beginPath();
  ctx.moveTo(w * 0.06, bandTop + h * 0.02);
  ctx.lineTo(w * 0.94, bandTop + h * 0.02);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

/** Draws the whole cover for a state onto the canvas, at its export size. */
export function drawCover(canvas, state) {
  const { w, h } = SIZES[state.size];
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#12081f';
  ctx.fillRect(0, 0, w, h);

  const shapes = panelShapes(state.layout, w, h);
  const photos = state.fillOne
    ? shapes.map(() => state.photos[0])
    : shapes.map((_, i) => state.photos[state.panelPhoto[i]] ?? null);
  shapes.forEach((points, i) => {
    drawPhotoInPanel(ctx, photos[i], points, state.crop[i]);
    sunsetWash(ctx, points, state.sunset);
  });
  if (state.neon) neonGutters(ctx, shapes, w);

  const vignette = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.45,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  if (state.grain) {
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  drawCaptionBand(ctx, state, w, h);
}
