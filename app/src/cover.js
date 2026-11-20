/* Neon Coast Cover Studio — cover renderer.
 * Draws a GTA-style multi-panel cast poster onto any canvas.
 * Pure canvas code: no network, no libraries. The editor (main.js) owns the
 * state; this file only turns a state object into pixels. */

export const POSTER_SIZES = {
  '1:1': { w: 1080, h: 1080, label: '1:1 square' },
  '4:5': { w: 1080, h: 1350, label: '4:5 portrait' },
  '16:9': { w: 1920, h: 1080, label: '16:9 wide' },
};

export const ROLES = [
  'THE DRIVER', 'THE BOSS', 'THE FIXER', 'THE CAPTAIN', 'THE LOOKOUT',
  'THE MECHANIC', 'THE RIDER', 'THE QUEEN', 'THE KING', 'THE INSIDER',
  'THE COURIER', 'THE BRAINS', 'THE WILDCARD', 'THE GETAWAY',
  'THE STRIP', 'THE PIER', 'THE DEALER', 'THE ROOKIE',
];

export const GRADES = [
  { name: 'Sunset Gold', filter: 'saturate(1.25) contrast(1.08) brightness(1.02)', tint: '#ff7a18', tintAlpha: 0.16, blend: 'soft-light' },
  { name: 'Vice Pink', filter: 'saturate(1.30) contrast(1.06) hue-rotate(-12deg)', tint: '#ff2e88', tintAlpha: 0.15, blend: 'soft-light' },
  { name: 'Neon Night', filter: 'saturate(1.35) contrast(1.12) brightness(0.96)', tint: '#7b2fff', tintAlpha: 0.18, blend: 'overlay' },
  { name: 'Palm Teal', filter: 'saturate(1.15) contrast(1.05) hue-rotate(8deg)', tint: '#00b3a4', tintAlpha: 0.13, blend: 'soft-light' },
  { name: 'Heatwave', filter: 'saturate(1.40) contrast(1.10) sepia(0.18)', tint: '#ff4d00', tintAlpha: 0.18, blend: 'soft-light' },
  { name: 'Magenta Mile', filter: 'saturate(1.30) hue-rotate(-25deg) contrast(1.08)', tint: '#d400ff', tintAlpha: 0.15, blend: 'overlay' },
  { name: 'Golden Hour', filter: 'saturate(1.20) sepia(0.28) contrast(1.05)', tint: '#ffb300', tintAlpha: 0.18, blend: 'soft-light' },
  { name: 'Bubblegum', filter: 'saturate(1.45) hue-rotate(-18deg) brightness(1.05)', tint: '#ff5da2', tintAlpha: 0.13, blend: 'soft-light' },
  { name: 'Chrome Dusk', filter: 'saturate(0.85) contrast(1.18) brightness(0.97)', tint: '#3b2d6b', tintAlpha: 0.16, blend: 'overlay' },
  { name: 'Coral Drive', filter: 'saturate(1.30) contrast(1.06) sepia(0.10)', tint: '#ff6b57', tintAlpha: 0.15, blend: 'soft-light' },
  { name: 'Midnight', filter: 'saturate(1.10) contrast(1.15) brightness(0.88)', tint: '#101a4a', tintAlpha: 0.26, blend: 'overlay' },
  { name: 'Mono Chrome', filter: 'grayscale(1) contrast(1.15)', tint: '#ffd166', tintAlpha: 0.10, blend: 'soft-light' },
];

/* Ten collages. Panels are body-relative rects (0..1); the first panel
 * flagged hero is the big close-up the title overlaps. */
export const LAYOUTS = [
  { name: 'Marquee 7', panels: [
    { x: 0.00, y: 0.00, w: 0.25, h: 0.48 }, { x: 0.00, y: 0.50, w: 0.25, h: 0.50 },
    { x: 0.27, y: 0.00, w: 0.46, h: 0.66, hero: true },
    { x: 0.75, y: 0.00, w: 0.25, h: 0.48 }, { x: 0.75, y: 0.50, w: 0.25, h: 0.50 },
    { x: 0.27, y: 0.68, w: 0.22, h: 0.32 }, { x: 0.51, y: 0.68, w: 0.22, h: 0.32 } ] },
  { name: 'Palm 5', panels: [
    { x: 0.00, y: 0.00, w: 0.30, h: 0.48 }, { x: 0.00, y: 0.50, w: 0.30, h: 0.50 },
    { x: 0.32, y: 0.00, w: 0.36, h: 1.00, hero: true },
    { x: 0.70, y: 0.00, w: 0.30, h: 0.48 }, { x: 0.70, y: 0.50, w: 0.30, h: 0.50 } ] },
  { name: 'Split Hero 5', panels: [
    { x: 0.00, y: 0.00, w: 0.44, h: 1.00, hero: true },
    { x: 0.46, y: 0.00, w: 0.26, h: 0.48 }, { x: 0.74, y: 0.00, w: 0.26, h: 0.48 },
    { x: 0.46, y: 0.50, w: 0.26, h: 0.50 }, { x: 0.74, y: 0.50, w: 0.26, h: 0.50 } ] },
  { name: 'Tilted 5', panels: [
    { x: 0.00, y: 0.00, w: 0.28, h: 0.44 }, { x: 0.72, y: 0.00, w: 0.28, h: 0.44 },
    { x: 0.30, y: 0.04, w: 0.40, h: 0.64, hero: true, tilt: -2.5 },
    { x: 0.00, y: 0.60, w: 0.48, h: 0.40 }, { x: 0.52, y: 0.60, w: 0.48, h: 0.40 } ] },
  { name: 'Duo 6', panels: [
    { x: 0.00, y: 0.00, w: 0.49, h: 0.55, hero: true },
    { x: 0.51, y: 0.00, w: 0.49, h: 0.55, hero2: true },
    { x: 0.00, y: 0.57, w: 0.24, h: 0.43 }, { x: 0.255, y: 0.57, w: 0.24, h: 0.43 },
    { x: 0.51, y: 0.57, w: 0.24, h: 0.43 }, { x: 0.765, y: 0.57, w: 0.235, h: 0.43 } ] },
  { name: 'Strip 6', panels: [
    { x: 0.00, y: 0.00, w: 1.00, h: 0.58, hero: true },
    { x: 0.00, y: 0.60, w: 0.192, h: 0.40 }, { x: 0.202, y: 0.60, w: 0.192, h: 0.40 },
    { x: 0.404, y: 0.60, w: 0.192, h: 0.40 }, { x: 0.606, y: 0.60, w: 0.192, h: 0.40 },
    { x: 0.808, y: 0.60, w: 0.192, h: 0.40 } ] },
  { name: 'Grid 6', panels: [
    { x: 0.00, y: 0.00, w: 0.50, h: 0.66, hero: true },
    { x: 0.52, y: 0.00, w: 0.48, h: 0.32 }, { x: 0.52, y: 0.34, w: 0.48, h: 0.32 },
    { x: 0.00, y: 0.68, w: 0.32, h: 0.32 }, { x: 0.34, y: 0.68, w: 0.32, h: 0.32 },
    { x: 0.68, y: 0.68, w: 0.32, h: 0.32 } ] },
  { name: 'Column 7', panels: [
    { x: 0.00, y: 0.00, w: 0.34, h: 0.32 }, { x: 0.00, y: 0.34, w: 0.34, h: 0.32 },
    { x: 0.00, y: 0.68, w: 0.34, h: 0.32 },
    { x: 0.36, y: 0.00, w: 0.28, h: 1.00, hero: true },
    { x: 0.66, y: 0.00, w: 0.34, h: 0.32 }, { x: 0.66, y: 0.34, w: 0.34, h: 0.32 },
    { x: 0.66, y: 0.68, w: 0.34, h: 0.32 } ] },
  { name: 'Triptych 6', panels: [
    { x: 0.00, y: 0.00, w: 0.32, h: 0.48 }, { x: 0.00, y: 0.50, w: 0.32, h: 0.50 },
    { x: 0.34, y: 0.06, w: 0.32, h: 0.62, hero: true },
    { x: 0.68, y: 0.00, w: 0.32, h: 0.48 }, { x: 0.68, y: 0.50, w: 0.32, h: 0.50 },
    { x: 0.34, y: 0.70, w: 0.32, h: 0.30 } ] },
  { name: 'Sunset 8', panels: [
    { x: 0.00, y: 0.00, w: 0.32, h: 0.45 }, { x: 0.68, y: 0.00, w: 0.32, h: 0.45 },
    { x: 0.00, y: 0.47, w: 0.32, h: 0.24 }, { x: 0.68, y: 0.47, w: 0.32, h: 0.24 },
    { x: 0.34, y: 0.08, w: 0.32, h: 0.58, hero: true },
    { x: 0.00, y: 0.73, w: 0.32, h: 0.27 }, { x: 0.34, y: 0.68, w: 0.32, h: 0.32 },
    { x: 0.68, y: 0.73, w: 0.32, h: 0.27 } ] },
];

export const TITLE_COMBOS = [
  { title: 'NEON COAST', sub: 'Kings of the Causeway', tag: 'SEVEN SINNERS · ONE COAST · ZERO REGRETS', quote: 'A SUN-BLEACHED JOYRIDE WITH TEETH', source: 'THE MANGROVE TIMES' },
  { title: 'SUNDOWN RACKET', sub: 'Paid in Sunsets', tag: 'EVERYONE WANTS A CUT OF THE SUNSET', quote: 'THE HOTTEST RIDE OF THE YEAR', source: 'GOLDEN MILE GAZETTE' },
  { title: 'PALM FEVER', sub: 'one last summer', tag: 'FIVE FRIENDS · ONE COAST · NO WAY BACK', quote: 'PURE GOLDEN-HOUR MAYHEM', source: 'THE HARBOR GAZETTE' },
  { title: 'NEON TIDE', sub: 'Kings of the Causeway', tag: 'SEVEN SINNERS · ONE COAST · ZERO REGRETS', quote: 'A SUN-BLEACHED JOYRIDE WITH TEETH', source: 'THE MANGROVE TIMES' },
  { title: 'HEAT WAVE', sub: 'Kings of the Coast', tag: 'ONE SUMMER · NO RULES · ALL HEAT', quote: 'A FEVER DREAM IN NEON', source: 'THE COAST HERALD' },
  { title: 'GOLDEN MILE', sub: 'Paid in Sunsets', tag: 'FIVE FRIENDS · ONE COAST · NO WAY BACK', quote: 'THE HOTTEST RIDE OF THE YEAR', source: 'GOLDEN MILE GAZETTE' },
  { title: 'VICE ROYALE', sub: 'Live Fast, Die Sunset', tag: 'ONE SUMMER · NO RULES · ALL HEAT', quote: 'PURE GOLDEN-HOUR MAYHEM', source: 'THE HARBOR GAZETTE' },
  { title: 'SUNSET HEIST', sub: 'Take the Coast', tag: 'EVERYONE WANTS A CUT OF THE SUNSET', quote: 'A FEVER DREAM IN NEON', source: 'THE COAST HERALD' },
];

/* ---- small helpers ---------------------------------------------------- */

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function fitFont(ctx, text, maxW, startPx, family, weight) {
  let px = startPx;
  ctx.font = `${weight || ''} ${px}px ${family}`;
  while (px > 10 && ctx.measureText(text).width > maxW) {
    px -= 2;
    ctx.font = `${weight || ''} ${px}px ${family}`;
  }
  return px;
}

function coverDraw(ctx, img, dx, dy, dw, dh, fx, fy, zoom) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const s = Math.max(dw / iw, dh / ih) * (zoom || 1);
  const sw = dw / s, sh = dh / s;
  const cx = (fx ?? 0.5) * iw, cy = (fy ?? 0.35) * ih;
  let sx = cx - sw / 2, sy = cy - sh / 2;
  sx = Math.max(0, Math.min(iw - sw, sx));
  sy = Math.max(0, Math.min(ih - sh, sy));
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function grainPattern(ctx) {
  const c = document.createElement('canvas');
  c.width = 140; c.height = 140;
  const g = c.getContext('2d');
  const d = g.createImageData(140, 140);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = 118 + Math.floor(Math.random() * 40);
    d.data[i] = v; d.data[i + 1] = v; d.data[i + 2] = v; d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  return ctx.createPattern(c, 'repeat');
}

function halftonePattern(ctx) {
  const c = document.createElement('canvas');
  c.width = 9; c.height = 9;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(0,0,0,0.55)';
  g.beginPath(); g.arc(4.5, 4.5, 1.6, 0, Math.PI * 2); g.fill();
  return ctx.createPattern(c, 'repeat');
}

/* Flood-fill cut-out: the background is whatever touches the border.
 * Each border pixel seeds its own region; a neighbour joins only while it
 * stays close to its seed's colour (so a slow sky gradient cannot walk
 * across the whole photo) and close to the pixel it grows from. People,
 * cars and clothes survive; skies and seas are eaten. Runs on a small
 * copy, so it stays fast; the mask is feathered and cached per photo.
 * Returns a canvas holding an alpha mask, or null when the mask would be
 * degenerate (almost all or almost nothing cut). */
const maskCache = new Map();
export function cutoutMask(img, key, threshold) {
  const ck = key + ':' + (threshold || 40);
  if (maskCache.has(ck)) return maskCache.get(ck);
  const W = 180, H = Math.max(60, Math.round(180 * (img.naturalHeight / img.naturalWidth)));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data;
  const T = threshold || 40;
  const STEP = 24;
  const bg = new Uint8Array(W * H);
  const seen = new Uint8Array(W * H);
  const queue = [];
  const pushSeed = (p) => {
    queue.push(p, d[p * 4], d[p * 4 + 1], d[p * 4 + 2]);
  };
  for (let x = 0; x < W; x++) { pushSeed(x); pushSeed(W * (H - 1) + x); }
  for (let y = 0; y < H; y++) { pushSeed(y * W); pushSeed(y * W + W - 1); }
  while (queue.length) {
    const sb = queue.pop(), sg = queue.pop(), sr = queue.pop(), p = queue.pop();
    if (seen[p]) continue;
    seen[p] = 1;
    const a = p * 4;
    const dr = d[a] - sr, dg = d[a + 1] - sg, db = d[a + 2] - sb;
    if (dr * dr + dg * dg + db * db > T * T) continue;
    bg[p] = 1;
    const x = p % W, y = (p / W) | 0;
    const nb = [];
    if (x > 0) nb.push(p - 1);
    if (x < W - 1) nb.push(p + 1);
    if (y > 0) nb.push(p - W);
    if (y < H - 1) nb.push(p + W);
    for (const q of nb) {
      if (seen[q]) continue;
      const b = q * 4;
      const er = d[b] - d[a], eg = d[b + 1] - d[a + 1], eb = d[b + 2] - d[a + 2];
      if (er * er + eg * eg + eb * eb < STEP * STEP) queue.push(q, sr, sg, sb);
    }
  }
  let fgCount = 0;
  for (let p = 0; p < W * H; p++) if (!bg[p]) fgCount++;
  let fgFrac = fgCount / (W * H);
  if (fgFrac < 0.08 || fgFrac > 0.92) { maskCache.set(ck, null); return null; }
  // Drop small foreground islands (clouds, palm bits, sky patches): the
  // subject is one big connected shape; stray islands read as dirt.
  const label = new Int32Array(W * H).fill(-1);
  let comp = 0;
  const sizes = [];
  for (let start = 0; start < W * H; start++) {
    if (bg[start] || label[start] >= 0) continue;
    let size = 0;
    const st = [start];
    label[start] = comp;
    while (st.length) {
      const p = st.pop();
      size++;
      const x = p % W, y = (p / W) | 0;
      const nb = [];
      if (x > 0) nb.push(p - 1);
      if (x < W - 1) nb.push(p + 1);
      if (y > 0) nb.push(p - W);
      if (y < H - 1) nb.push(p + W);
      for (const q of nb) {
        if (!bg[q] && label[q] < 0) { label[q] = comp; st.push(q); }
      }
    }
    sizes.push(size);
    comp++;
  }
  const keepMin = Math.max(120, Math.floor(W * H * 0.03));
  for (let p = 0; p < W * H; p++) {
    if (!bg[p] && sizes[label[p]] < keepMin) bg[p] = 1;
  }
  fgCount = 0;
  for (let p = 0; p < W * H; p++) if (!bg[p]) fgCount++;
  fgFrac = fgCount / (W * H);
  if (fgFrac < 0.08 || fgFrac > 0.92) { maskCache.set(ck, null); return null; }
  const mask = document.createElement('canvas');
  mask.width = W; mask.height = H;
  const m = mask.getContext('2d');
  const md = m.createImageData(W, H);
  for (let p = 0; p < W * H; p++) {
    md.data[p * 4 + 3] = bg[p] ? 0 : 255;
  }
  m.putImageData(md, 0, 0);
  m.filter = 'blur(3px)';
  m.globalCompositeOperation = 'source-in';
  m.drawImage(mask, 0, 0);
  maskCache.set(ck, mask);
  if (maskCache.size > 24) { const k = maskCache.keys().next().value; maskCache.delete(k); }
  return mask;
}

/* ---- the poster -------------------------------------------------------- */

export function renderCover(ctx, W, H, state) {
  const layout = LAYOUTS[state.layout];
  const grade = GRADES[state.grade];
  const s = W / 1920; // scale unit: poster drawn as if 1920 wide

  // Backdrop: deep purple night, gold frame.
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#170a2b';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#f5c542';
  ctx.lineWidth = Math.max(3, 5 * s);
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);

  const topH = H * 0.052, botH = H * 0.088;
  const body = { x: W * 0.012, y: topH + H * 0.006, w: W * 0.976, h: H - topH - botH - H * 0.012 };

  const panelRect = (p) => ({
    x: body.x + p.x * body.w, y: body.y + p.y * body.h,
    w: p.w * body.w, h: p.h * body.h,
  });

  // Panels (the hero is drawn later when pop-out is on).
  const heroIdx = layout.panels.findIndex((p) => p.hero);
  layout.panels.forEach((p, i) => {
    if (i === heroIdx && state.popout) return;
    drawPanel(ctx, panelRect(p), p, state, grade, s, i);
  });

  // Giant striped title across the middle, overlapping the panels.
  // The pop-out hero weaves through it: its lower half goes down first
  // (behind the title), the title draws over it, then its head is drawn
  // again over the title's top edge — so the hero bursts through the
  // title while the title stays fully readable.
  const titleY = H * 0.545;
  const titlePx = fitFont(ctx, state.title, W * 0.96, W * 0.115, '"Anton", sans-serif');
  const clipY = titleY - titlePx * 0.30;
  const popRect = () => {
    const p = layout.panels[heroIdx];
    const r = panelRect(p);
    return { pr: { x: r.x - r.w * 0.04, y: r.y - r.h * 0.06, w: r.w * 1.08, h: r.h * 1.18 }, r };
  };
  if (state.popout && heroIdx >= 0) {
    const { pr, r } = popRect();
    drawPopout(ctx, pr, r, state.photos[heroIdx], state, grade, s, clipY, false);
  }
  drawStripedTitle(ctx, state.title, W / 2, titleY, W * 0.96, W * 0.115);
  if (state.popout && heroIdx >= 0) {
    const { pr, r } = popRect();
    drawPopout(ctx, pr, r, state.photos[heroIdx], state, grade, s, clipY, true);
  }

  // Neon script subtitle + tagline chip under the title.
  const subY = titleY + W * 0.062;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff2e88'; ctx.shadowBlur = W * 0.014;
  ctx.fillStyle = '#ff7ac0';
  const subPx = fitFont(ctx, state.subtitle, W * 0.72, W * 0.038, '"Pacifico", cursive');
  ctx.font = `${subPx}px "Pacifico", cursive`;
  ctx.fillText(state.subtitle, W / 2, subY);
  ctx.restore();

  const tagY = subY + W * 0.038;
  drawChip(ctx, state.tagline, W / 2, tagY, W * 0.02, '#ff2e88', '#ffffff', W * 0.016);

  // Gold seal, on the right edge at the seam between the two right panels.
  drawSeal(ctx, W * 0.94, body.y + body.h * 0.50, W * 0.048, state.seal);

  // Top strip: stars, press quote, volume chip.
  ctx.fillStyle = '#12061f';
  ctx.fillRect(0, 0, W, topH);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f5c542';
  ctx.font = `${Math.round(topH * 0.52)}px "Anton", sans-serif`;
  const starsW = ctx.measureText('★★★★★').width;
  ctx.fillText('★★★★★', W * 0.02, topH * 0.72);
  ctx.fillStyle = '#ffe9a8';
  const quoteX = W * 0.02 + starsW + W * 0.015;
  const qPx = fitFont(ctx, `"${state.quote}"  —  ${state.source}`, W - quoteX - W * 0.10, topH * 0.42, '"Anton", sans-serif');
  ctx.font = `${qPx}px "Anton", sans-serif`;
  ctx.fillText(`"${state.quote}"  —  ${state.source}`, quoteX, topH * 0.70);
  drawChip(ctx, state.volume, W * 0.935, topH * 0.5, topH * 0.22, '#f5c542', '#1a0b2e', topH * 0.42, true);

  // Bottom strip: release, billing, barcode.
  ctx.fillStyle = '#12061f';
  ctx.fillRect(0, H - botH, W, botH);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f5c542';
  ctx.font = `${Math.round(botH * 0.26)}px "Anton", sans-serif`;
  ctx.fillText(state.release, W * 0.02, H - botH * 0.60);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e8ddff';
  ctx.font = `${Math.round(botH * 0.155)}px "Anton", sans-serif`;
  ctx.fillText(state.billing1, W * 0.5, H - botH * 0.62);
  ctx.fillText(state.billing2, W * 0.5, H - botH * 0.30);
  drawBarcode(ctx, W * 0.925, H - botH * 0.86, W * 0.055, botH * 0.62, state.title);

  // One warm sunset wash over everything, so every panel shares a grade.
  const wash = ctx.createLinearGradient(0, 0, 0, H);
  wash.addColorStop(0, 'rgba(255,122,24,0.07)');
  wash.addColorStop(0.6, 'rgba(255,46,136,0.05)');
  wash.addColorStop(1, 'rgba(60,10,90,0.10)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, H);
}

function drawPanel(ctx, r, p, state, grade, s, i) {
  const photo = state.photos[i];
  ctx.save();
  if (p.tilt) {
    ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
    ctx.rotate((p.tilt * Math.PI) / 180);
    ctx.translate(-(r.x + r.w / 2), -(r.y + r.h / 2));
  }
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  if (photo && photo.img) {
    const pg = photo.grade != null ? GRADES[photo.grade] : grade;
    ctx.filter = pg.filter;
    coverDraw(ctx, photo.img, r.x, r.y, r.w, r.h, photo.fx, photo.fy, photo.zoom);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = pg.blend;
    ctx.globalAlpha = pg.tintAlpha;
    ctx.fillStyle = pg.tint;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  } else {
    const g = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
    g.addColorStop(0, '#3a1c5c'); g.addColorStop(1, '#1c0b33');
    ctx.fillStyle = g;
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  if (photo) {
    if (photo.grain) { ctx.globalAlpha = 0.10; ctx.fillStyle = grainPattern(ctx); ctx.fillRect(r.x, r.y, r.w, r.h); ctx.globalAlpha = 1; }
    if (photo.halftone) { ctx.globalAlpha = 0.14; ctx.fillStyle = halftonePattern(ctx); ctx.fillRect(r.x, r.y, r.w, r.h); ctx.globalAlpha = 1; }
    if (photo.vignette) {
      const v = ctx.createRadialGradient(r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) * 0.3, r.x + r.w / 2, r.y + r.h / 2, Math.max(r.w, r.h) * 0.75);
      v.addColorStop(0, 'rgba(10,2,20,0)'); v.addColorStop(1, 'rgba(10,2,20,0.5)');
      ctx.fillStyle = v; ctx.fillRect(r.x, r.y, r.w, r.h);
    }
  }
  ctx.restore();
  // Panel frame + role tag.
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(2, 2.5 * s);
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  const role = (photo && photo.role) || ROLES[i % ROLES.length];
  drawRoleTag(ctx, role, r.x + r.w * 0.04, r.y + r.h - r.h * 0.13, r.w, s);
  ctx.restore();
}

/* Draws the hero bursting out of its panel. When clipY is given, only the
 * part above it (clipAbove) or below it is drawn, so the caller can weave
 * the hero through the title. */
function drawPopout(ctx, r, panelR, photo, state, grade, s, clipY, clipAbove) {
  if (!photo || !photo.img) return;
  const off = document.createElement('canvas');
  off.width = Math.max(2, Math.round(r.w));
  off.height = Math.max(2, Math.round(r.h));
  const o = off.getContext('2d');
  const pg = photo.grade != null ? GRADES[photo.grade] : grade;
  o.filter = pg.filter;
  coverDraw(o, photo.img, 0, 0, off.width, off.height, photo.fx, photo.fy, photo.zoom);
  o.filter = 'none';
  o.globalCompositeOperation = pg.blend;
  o.globalAlpha = pg.tintAlpha;
  o.fillStyle = pg.tint;
  o.fillRect(0, 0, off.width, off.height);
  o.globalAlpha = 1;
  o.globalCompositeOperation = 'source-over';
  if (photo.cutout) {
    const mask = cutoutMask(photo.img, photo.src, 40);
    if (mask) {
      const mc = document.createElement('canvas');
      mc.width = off.width; mc.height = off.height;
      const mg = mc.getContext('2d');
      mg.drawImage(mask, 0, 0, mc.width, mc.height);
      o.globalCompositeOperation = 'destination-in';
      o.drawImage(mc, 0, 0);
      o.globalCompositeOperation = 'source-over';
    } else {
      // Degenerate mask (photo has no clean background): fall back to the
      // soft top feather below instead of erasing the hero.
      const fade = o.createLinearGradient(0, 0, 0, off.height * 0.30);
      fade.addColorStop(0, 'rgba(0,0,0,0)');
      fade.addColorStop(1, 'rgba(0,0,0,1)');
      o.globalCompositeOperation = 'destination-in';
      o.fillStyle = fade;
      o.fillRect(0, 0, off.width, off.height * 0.30);
      o.globalCompositeOperation = 'source-over';
    }
  } else {
    // Soft top feather so the hero melts into the title.
    const fade = o.createLinearGradient(0, 0, 0, off.height * 0.30);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(1, 'rgba(0,0,0,1)');
    o.globalCompositeOperation = 'destination-in';
    o.fillStyle = fade;
    o.fillRect(0, 0, off.width, off.height * 0.30);
    o.globalCompositeOperation = 'source-over';
  }
  ctx.save();
  if (clipY != null) {
    ctx.beginPath();
    if (clipAbove) ctx.rect(0, 0, ctx.canvas.width, clipY);
    else ctx.rect(0, clipY, ctx.canvas.width, ctx.canvas.height - clipY);
    ctx.clip();
  }
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 22 * s;
  ctx.shadowOffsetY = 8 * s;
  ctx.drawImage(off, r.x, r.y, r.w, r.h);
  ctx.restore();
  ctx.save();
  if (clipY != null) {
    ctx.beginPath();
    if (clipAbove) ctx.rect(0, 0, ctx.canvas.width, clipY);
    else ctx.rect(0, clipY, ctx.canvas.width, ctx.canvas.height - clipY);
    ctx.clip();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(2, 2.5 * s);
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  // Role tag at the pop-out's top-left, clear of the title band below.
  drawRoleTag(ctx, (photo && photo.role) || 'THE QUEEN', r.x + r.w * 0.04, r.y + r.h * 0.06, r.w, s);
  ctx.restore();
}

function drawStripedTitle(ctx, text, cx, cy, maxW, startPx) {
  const px = fitFont(ctx, text, maxW, startPx, '"Anton", sans-serif');
  const tw = ctx.measureText(text).width;
  const off = document.createElement('canvas');
  off.width = Math.ceil(tw + px * 0.3);
  off.height = Math.ceil(px * 1.5);
  const o = off.getContext('2d');
  o.font = `${px}px "Anton", sans-serif`;
  o.textAlign = 'left';
  o.textBaseline = 'middle';
  const grad = o.createLinearGradient(0, off.height * 0.12, 0, off.height * 0.92);
  grad.addColorStop(0, '#ffe45c');
  grad.addColorStop(0.35, '#ffb03a');
  grad.addColorStop(0.55, '#ff5e3a');
  grad.addColorStop(0.75, '#ff2e88');
  grad.addColorStop(1, '#b537f2');
  o.fillStyle = grad;
  o.fillText(text, px * 0.15, off.height * 0.55);
  // Retro horizontal stripes laid over the letters (source-atop keeps the
  // gradient fill and only darkens thin bands of it).
  o.globalCompositeOperation = 'source-atop';
  const band = px / 7;
  for (let y = off.height * 0.12; y < off.height * 0.95; y += band) {
    o.fillStyle = 'rgba(60,0,40,0.28)';
    o.fillRect(0, y, off.width, Math.max(1.5, px * 0.028));
    o.fillStyle = 'rgba(255,255,255,0.20)';
    o.fillRect(0, y + Math.max(1.5, px * 0.028), off.width, Math.max(1, px * 0.012));
  }
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(20,0,40,0.85)';
  ctx.shadowBlur = px * 0.16;
  ctx.shadowOffsetY = px * 0.05;
  // Thick dark outline behind the fill.
  ctx.font = `${px}px "Anton", sans-serif`;
  ctx.lineWidth = px * 0.16;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1c0533';
  ctx.strokeText(text, cx, cy);
  ctx.drawImage(off, cx - off.width / 2, cy - off.height / 2);
  ctx.restore();
}

function drawChip(ctx, text, cx, cy, pad, bg, fg, px, square) {
  ctx.save();
  ctx.font = `${px}px "Anton", sans-serif`;
  const w = ctx.measureText(text).width + pad * 2;
  const h = px * 1.9;
  ctx.fillStyle = bg;
  ctx.beginPath();
  if (square) ctx.rect(cx - w / 2, cy - h / 2, w, h);
  else ctx.roundRect(cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + px * 0.04);
  ctx.restore();
}

function drawRoleTag(ctx, role, x, y, panelW, s) {
  const px = Math.max(11, 15 * s + panelW * 0.008);
  ctx.save();
  ctx.font = `${px}px "Anton", sans-serif`;
  const w = ctx.measureText(role).width + px * 1.1;
  const h = px * 1.7;
  ctx.fillStyle = 'rgba(8,3,18,0.88)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 2);
  ctx.fill();
  ctx.fillStyle = '#f5c542';
  ctx.fillRect(x, y, px * 0.28, h);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(role, x + px * 0.55, y + h / 2 + px * 0.04);
  ctx.restore();
}

function drawSeal(ctx, cx, cy, r, label) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const spikes = 20;
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i * Math.PI) / spikes - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.78;
    const x = Math.cos(ang) * rad, y = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#f5c542';
  ctx.fill();
  ctx.strokeStyle = '#8a5a00';
  ctx.lineWidth = Math.max(2, r * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
  ctx.strokeStyle = '#8a5a00';
  ctx.lineWidth = Math.max(1.5, r * 0.035);
  ctx.stroke();
  ctx.fillStyle = '#1a0b2e';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const words = String(label).split(' ');
  const px = Math.max(10, r * 0.26);
  ctx.font = `${px}px "Anton", sans-serif`;
  if (words.length > 1) {
    ctx.fillText(words[0], 0, -px * 0.55);
    ctx.fillText(words.slice(1).join(' '), 0, px * 0.55);
  } else {
    ctx.fillText(label, 0, 0);
  }
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h, seedText) {
  let seed = hashString(seedText);
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#111111';
  let bx = x + w * 0.06;
  while (bx < x + w * 0.92) {
    const bw = w * (0.015 + rnd() * 0.03);
    if (rnd() > 0.45) ctx.fillRect(bx, y + h * 0.06, bw, h * 0.68);
    bx += bw + w * 0.012;
  }
  ctx.fillStyle = '#111111';
  ctx.font = `${Math.max(9, h * 0.13)}px "Anton", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(String(1000000 + Math.floor(rnd() * 8999999)), x + w / 2, y + h * 0.94);
  ctx.restore();
}
