// Neon Coast cover engine v2: draws the multi-panel cast-poster look on a
// 2D canvas — a big face-forward hero panel in the centre, a cast of
// panels around it, a giant striped retro-chrome title overlapping them, a
// neon script subtitle, role tags on every panel, a press-quote top strip,
// a billing bottom strip and a gold seal. Everything is drawn from the
// user's own photos plus gradients and lettering: no Rockstar Games logo,
// artwork, character or font. Display lettering is Anton, the script
// subtitle is Pacifico, both SIL Open Font License files under app/fonts/.

export const ROLES = [
  'THE DRIVER', 'THE BOSS', 'THE FIXER', 'THE CAPTAIN', 'THE LOOKOUT',
  'THE MECHANIC', 'THE RIDER', 'THE QUEEN', 'THE INSIDER', 'THE COURIER',
  'THE NAVIGATOR', 'THE WILDCARD', 'THE BRAINS', 'THE GETAWAY', 'THE CLOSER',
];

export const TITLE_POOL = [
  'SUNDOWN RACKET', 'PALM FEVER', 'NEON TIDE', 'HEATWAVE', 'HIGH TIDE HUSTLE',
  'SUNSET RUN', 'GOLDEN HOUR', 'VICE NIGHTS', 'COASTLINE KINGS', 'MIDNIGHT PALMS',
  'SOLAR FLARE', 'TURBO SUNSET', 'AFTERGLOW', 'PALM COURT', 'SUMMER HEAT',
];

export const SUBTITLE_POOL = [
  'Paid in Sunsets', 'one last summer', 'Kings of the Causeway', 'Coastline Nights',
  'After the Tide', 'palm nights on the neon coast', 'drive fast, shine brighter',
  'every sunset is a cover', 'no way back', 'kings of the coast', 'chasing the light',
  'one more golden hour',
];

export const TAGLINE_POOL = [
  'FIVE FRIENDS · ONE COAST · NO WAY BACK',
  'SEVEN SINNERS · ONE COAST · ZERO REGRETS',
  'ONE SUMMER · NO RULES · ALL HEAT',
  'ONE COASTLINE · SIX STORIES · NO CURFEW',
  'THE COAST IS NEVER CLEAR',
  'EVERYONE WANTS A CUT OF THE SUNSET',
  'SUNSET, SERVED LOUD',
];

export const QUOTE_POOL = [
  { text: 'EVERY FRAME A POSTCARD', source: 'THE PALM JOURNAL' },
  { text: 'THE COAST HAS NEVER LOOKED THIS GOOD', source: 'THE SUNSET POST' },
  { text: 'SUNSET, SERVED LOUD', source: 'COAST WEEKLY' },
  { text: 'A LOVE LETTER TO THE GOLDEN HOUR', source: 'THE HARBOR LIGHT' },
  { text: 'LOUD, BRIGHT, UNFORGETTABLE', source: 'NEON REVIEW' },
  { text: 'THE DEFINITIVE COAST POSTER', source: 'THE BOARDWALK TIMES' },
];

export const SEAL_POOL = ['BEST CAST', 'SEASON ONE', '100% ORIGINAL', "HOT SUMMER '26", 'ORIGINAL COVER ART'];

// Layouts return panel rects in pixels for a W x H cover. The hero is the
// largest rect; titleMode says where the big title goes.
export const LAYOUTS = {
  cast7: {
    label: 'Cast 7',
    hint: 'Seven panels: hero in the centre, three a side',
    titleMode: 'band',
    panels(W, H, g) {
      const gy0 = H * 0.058, gy1 = H * 0.90;
      const gh = gy1 - gy0;
      const lw = W * 0.205, hw = W * 0.36;
      const lx = W * 0.015, hx = lx + lw + g, rx = hx + hw + g;
      const rw = W * 0.985 - rx;
      const third = (gh - g * 2) / 3;
      return [
        { x: lx, y: gy0, w: lw, h: third },
        { x: lx, y: gy0 + third + g, w: lw, h: third },
        { x: lx, y: gy0 + (third + g) * 2, w: lw, h: third },
        { x: hx, y: gy0, w: hw, h: gh, hero: true },
        { x: rx, y: gy0, w: rw, h: third },
        { x: rx, y: gy0 + third + g, w: rw, h: third },
        { x: rx, y: gy0 + (third + g) * 2, w: rw, h: third },
      ];
    },
  },
  cast5: {
    label: 'Cast 5',
    hint: 'Five panels: hero in the centre, two a side',
    titleMode: 'band',
    panels(W, H, g) {
      const gy0 = H * 0.058, gy1 = H * 0.90;
      const gh = gy1 - gy0;
      const lw = W * 0.225, hw = W * 0.38;
      const lx = W * 0.015, hx = lx + lw + g, rx = hx + hw + g;
      const rw = W * 0.985 - rx;
      const half = (gh - g) / 2;
      return [
        { x: lx, y: gy0, w: lw, h: half },
        { x: lx, y: gy0 + half + g, w: lw, h: half },
        { x: hx, y: gy0, w: hw, h: gh, hero: true },
        { x: rx, y: gy0, w: rw, h: half },
        { x: rx, y: gy0 + half + g, w: rw, h: half },
      ];
    },
  },
  cast6: {
    label: 'Cast 6',
    hint: 'Six panels: hero centre, two left, three right',
    titleMode: 'band',
    panels(W, H, g) {
      const gy0 = H * 0.058, gy1 = H * 0.90;
      const gh = gy1 - gy0;
      const lw = W * 0.21, hw = W * 0.37;
      const lx = W * 0.015, hx = lx + lw + g, rx = hx + hw + g;
      const rw = W * 0.985 - rx;
      const half = (gh - g) / 2;
      const third = (gh - g * 2) / 3;
      return [
        { x: lx, y: gy0, w: lw, h: half },
        { x: lx, y: gy0 + half + g, w: lw, h: half },
        { x: hx, y: gy0, w: hw, h: gh, hero: true },
        { x: rx, y: gy0, w: rw, h: third },
        { x: rx, y: gy0 + third + g, w: rw, h: third },
        { x: rx, y: gy0 + (third + g) * 2, w: rw, h: third },
      ];
    },
  },
  heroLeft: {
    label: 'Hero left',
    hint: 'One big hero on the left, a wide panel and two small right',
    titleMode: 'band',
    panels(W, H, g) {
      const gy0 = H * 0.058, gy1 = H * 0.90;
      const gh = gy1 - gy0;
      const hw = W * 0.42;
      const rx = W * 0.015 + hw + g;
      const rw = W * 0.985 - rx;
      const half = (gh - g) / 2;
      return [
        { x: W * 0.015, y: gy0, w: hw, h: gh, hero: true },
        { x: rx, y: gy0, w: rw, h: half },
        { x: rx, y: gy0 + half + g, w: rw / 2 - g / 2, h: half },
        { x: rx + rw / 2 + g / 2, y: gy0 + half + g, w: rw / 2 - g / 2, h: half },
      ];
    },
  },
  cinema: {
    label: 'Cinema',
    hint: 'Wide hero on top, three panels along the bottom',
    titleMode: 'band',
    panels(W, H, g) {
      const gy0 = H * 0.058, gy1 = H * 0.90;
      const topH = (gy1 - gy0) * 0.56;
      const botY = gy0 + topH + g;
      const botH = gy1 - botY;
      const bw = (W * 0.97 - g * 2) / 3;
      return [
        { x: W * 0.015, y: gy0, w: W * 0.97, h: topH, hero: true },
        { x: W * 0.015, y: botY, w: bw, h: botH },
        { x: W * 0.015 + bw + g, y: botY, w: bw, h: botH },
        { x: W * 0.015 + (bw + g) * 2, y: botY, w: bw, h: botH },
      ];
    },
  },
  grid4: {
    label: 'Grid 2 x 2',
    hint: 'Four equal panels, two by two',
    titleMode: 'band',
    panels(W, H, g) {
      const gy0 = H * 0.058, gy1 = H * 0.90;
      const pw = (W * 0.97 - g) / 2;
      const ph = (gy1 - gy0 - g) / 2;
      return [
        { x: W * 0.015, y: gy0, w: pw, h: ph },
        { x: W * 0.015 + pw + g, y: gy0, w: pw, h: ph },
        { x: W * 0.015, y: gy0 + ph + g, w: pw, h: ph },
        { x: W * 0.015 + pw + g, y: gy0 + ph + g, w: pw, h: ph },
      ];
    },
  },
  mosaic9: {
    label: 'Mosaic 3 x 3',
    hint: 'Nine cells with the title block in the middle',
    titleMode: 'center',
    panels(W, H, g) {
      const gy0 = H * 0.058, gy1 = H * 0.90;
      const cw = (W * 0.97 - g * 2) / 3;
      const ch = (gy1 - gy0 - g * 2) / 3;
      const cells = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (row === 1 && col === 1) continue;
          cells.push({
            x: W * 0.015 + col * (cw + g),
            y: gy0 + row * (ch + g),
            w: cw, h: ch,
          });
        }
      }
      return cells;
    },
  },
  strip5: {
    label: 'Strips 5',
    hint: 'Five tall vertical strips, hero in the middle',
    titleMode: 'band',
    panels(W, H, g) {
      const gy0 = H * 0.058, gy1 = H * 0.90;
      const sw = (W * 0.97 - g * 4) / 5;
      return [0, 1, 2, 3, 4].map((i) => ({
        x: W * 0.015 + i * (sw + g),
        y: gy0, w: sw, h: gy1 - gy0,
        hero: i === 2,
      }));
    },
  },
  tilt: {
    label: 'Tilted snaps',
    hint: 'Overlapping tilted snapshots on a sunset backdrop',
    titleMode: 'top',
    panels(W, H, g) {
      const pw = W * 0.34;
      const ph = H * 0.50;
      return [
        { x: W * 0.05, y: H * 0.30, w: pw, h: ph, rot: -0.10 },
        { x: W * 0.33, y: H * 0.24, w: pw, h: ph, rot: 0.03, hero: true },
        { x: W * 0.61, y: H * 0.30, w: pw, h: ph, rot: 0.09 },
      ];
    },
  },
  fullbleed: {
    label: 'Full bleed',
    hint: 'One photo edge to edge, title over the bottom',
    titleMode: 'band',
    panels(W, H, g) {
      return [{ x: 0, y: H * 0.058, w: W, h: H * 0.90 - H * 0.058, hero: true }];
    },
  },
};

export const GRADES = {
  sunset: {
    label: 'Sunset', sky: ['#2b1055', '#ff5e7a', '#ff9a3d'],
    overlay: ['rgba(255,154,61,0.50)', 'rgba(255,94,122,0.32)', 'rgba(122,43,143,0.42)'],
    mode: 'soft-light', tint: 'rgba(255,120,60,0.10)',
    accent: '#ffd166', band: 'rgba(16,5,24,0.88)',
  },
  neon: {
    label: 'Neon', sky: ['#0b1035', '#ff2e88', '#00e5ff'],
    overlay: ['rgba(255,46,136,0.48)', 'rgba(0,229,255,0.30)', 'rgba(120,40,220,0.40)'],
    mode: 'overlay', tint: 'rgba(255,46,136,0.08)',
    accent: '#7df9ff', band: 'rgba(8,4,28,0.88)',
  },
  teal: {
    label: 'Vice teal', sky: ['#062a2e', '#0e7c7b', '#ffb347'],
    overlay: ['rgba(14,124,123,0.45)', 'rgba(255,179,71,0.28)', 'rgba(6,42,46,0.42)'],
    mode: 'soft-light', tint: 'rgba(14,124,123,0.10)',
    accent: '#8ff5d2', band: 'rgba(4,22,24,0.88)',
  },
  noir: {
    label: 'Noir', sky: ['#000000', '#3a3a3a', '#bdbdbd'],
    overlay: ['rgba(128,128,128,0.55)', 'rgba(0,0,0,0.35)', 'rgba(255,255,255,0.25)'],
    mode: 'overlay', desaturate: true, tint: null,
    accent: '#ffffff', band: 'rgba(0,0,0,0.88)',
  },
  golden: {
    label: 'Golden hour', sky: ['#3d1e04', '#ff8c1a', '#ffe066'],
    overlay: ['rgba(255,190,60,0.52)', 'rgba(255,140,26,0.30)', 'rgba(120,60,0,0.35)'],
    mode: 'soft-light', tint: 'rgba(255,190,60,0.12)',
    accent: '#ffe066', band: 'rgba(26,12,2,0.88)',
  },
  miami: {
    label: 'Miami', sky: ['#12082e', '#ff2e88', '#2ee6ff'],
    overlay: ['rgba(255,46,136,0.55)', 'rgba(46,230,255,0.38)', 'rgba(18,8,46,0.35)'],
    mode: 'overlay', tint: 'rgba(255,46,136,0.06)',
    accent: '#ff7ad9', band: 'rgba(12,4,30,0.88)',
  },
  ember: {
    label: 'Ember', sky: ['#1c0303', '#e5382a', '#ff7a18'],
    overlay: ['rgba(229,56,42,0.50)', 'rgba(255,122,24,0.32)', 'rgba(28,3,3,0.40)'],
    mode: 'soft-light', tint: 'rgba(229,56,42,0.10)',
    accent: '#ffb347', band: 'rgba(20,2,2,0.88)',
  },
  lagoon: {
    label: 'Lagoon', sky: ['#012a2e', '#00b39a', '#ffe066'],
    overlay: ['rgba(0,179,154,0.45)', 'rgba(255,224,102,0.28)', 'rgba(1,42,46,0.42)'],
    mode: 'soft-light', tint: 'rgba(0,179,154,0.10)',
    accent: '#8ff5d2', band: 'rgba(1,26,28,0.88)',
  },
  violet: {
    label: 'Violet', sky: ['#160b2e', '#8b2ff5', '#ff5e9c'],
    overlay: ['rgba(139,47,245,0.50)', 'rgba(255,94,156,0.32)', 'rgba(22,11,46,0.40)'],
    mode: 'soft-light', tint: 'rgba(139,47,245,0.10)',
    accent: '#d9a7ff', band: 'rgba(14,6,28,0.88)',
  },
  chrome: {
    label: 'Chrome', sky: ['#0a1420', '#5f7fa3', '#cfe8ff'],
    overlay: ['rgba(95,127,163,0.50)', 'rgba(207,232,255,0.30)', 'rgba(10,20,32,0.40)'],
    mode: 'soft-light', tint: 'rgba(207,232,255,0.08)',
    accent: '#cfe8ff', band: 'rgba(6,12,20,0.88)',
  },
};

export const SIZES = [
  { id: 'square', label: '1080 x 1080', w: 1080, h: 1080 },
  { id: 'portrait', label: '1080 x 1350', w: 1080, h: 1350 },
  { id: 'wide', label: '1920 x 1080', w: 1920, h: 1080 },
];

// Cover-fit geometry for one photo inside one panel, with pan (cx, cy in
// 0..1) and zoom. Default cy is 0.38: faces sit in the upper half of most
// portraits, so a face-biased crop keeps them centred, never cut off.
export function fitPhotoCover(img, panel, crop) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(panel.w / iw, panel.h / ih);
  const scale = base * (crop.zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = panel.x + (panel.w - dw) / 2 - ((crop.cx ?? 0.5) - 0.5) * (dw - panel.w);
  const dy = panel.y + (panel.h - dh) / 2 - ((crop.cy ?? 0.38) - 0.5) * (dh - panel.h);
  return { dx, dy, dw, dh };
}

function applyGrade(ctx, r, grade) {
  if (grade.desaturate) {
    ctx.globalCompositeOperation = 'saturation';
    ctx.fillStyle = '#808080';
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  const grad = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
  grade.overlay.forEach((c, i) => grad.addColorStop(i / (grade.overlay.length - 1), c));
  ctx.globalCompositeOperation = grade.mode;
  ctx.fillStyle = grad;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  if (grade.tint) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = grade.tint;
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  const shade = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  shade.addColorStop(0, 'rgba(255,255,255,0.10)');
  shade.addColorStop(0.5, 'rgba(255,255,255,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.30)');
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = shade;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.globalCompositeOperation = 'source-over';
}

function drawPhotoPanel(ctx, img, panel, crop, grade, showBorder = true) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(panel.x, panel.y, panel.w, panel.h);
  ctx.clip();
  if (img) {
    const f = fitPhotoCover(img, panel, crop);
    ctx.drawImage(img, f.dx, f.dy, f.dw, f.dh);
  } else {
    const g = ctx.createLinearGradient(panel.x, panel.y, panel.x + panel.w, panel.y + panel.h);
    g.addColorStop(0, '#3a2b52');
    g.addColorStop(1, '#120a18');
    ctx.fillStyle = g;
    ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `${Math.max(13, panel.w * 0.055)}px Anton, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADD A PHOTO', panel.x + panel.w / 2, panel.y + panel.h / 2);
  }
  applyGrade(ctx, panel, grade);
  ctx.restore();
  if (showBorder) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = Math.max(2, panel.w * 0.008);
    ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);
    ctx.strokeStyle = 'rgba(0,0,0,0.30)';
    ctx.lineWidth = Math.max(2, panel.w * 0.012);
    ctx.strokeRect(panel.x + 2, panel.y + 2, panel.w - 4, panel.h - 4);
    ctx.restore();
  }
}

// Black role chip with a yellow accent slash, bottom-left inside a panel.
function drawRoleTag(ctx, role, panel, H) {
  if (!role) return;
  const size = Math.max(11, Math.min(panel.w * 0.085, H * 0.016));
  ctx.save();
  ctx.font = `${size}px Anton, sans-serif`;
  const tw = ctx.measureText(role.toUpperCase()).width;
  const padX = size * 0.9;
  const bw = tw + padX * 2 + size * 0.7;
  const bh = size * 2.0;
  const bx = panel.x + Math.max(4, panel.w * 0.03);
  const by = panel.y + panel.h - bh - Math.max(4, panel.h * 0.03);
  ctx.fillStyle = 'rgba(0,0,0,0.88)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 2);
  ctx.fill();
  // yellow slash
  ctx.fillStyle = '#ffd166';
  const sx = bx + padX * 0.45;
  ctx.beginPath();
  ctx.moveTo(sx, by + bh * 0.18);
  ctx.lineTo(sx + size * 0.42, by + bh * 0.18);
  ctx.lineTo(sx + size * 0.22, by + bh * 0.82);
  ctx.lineTo(sx - size * 0.20, by + bh * 0.82);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(role.toUpperCase(), bx + padX + size * 0.55, by + bh / 2 + size * 0.05);
  ctx.restore();
}

let noiseCanvas = null;
function getNoiseCanvas() {
  if (noiseCanvas) return noiseCanvas;
  noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 140;
  noiseCanvas.height = 140;
  const nctx = noiseCanvas.getContext('2d');
  const data = nctx.createImageData(140, 140);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 118 + Math.floor(Math.random() * 40) - 20;
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  nctx.putImageData(data, 0, 0);
  return noiseCanvas;
}

function drawGrain(ctx, W, H, amount) {
  if (!amount) return;
  const pattern = ctx.createPattern(getNoiseCanvas(), 'repeat');
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawVignette(ctx, W, H, amount) {
  if (!amount) return;
  const g = ctx.createRadialGradient(
    W / 2, H / 2, Math.min(W, H) * 0.42,
    W / 2, H / 2, Math.max(W, H) * 0.78,
  );
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${0.38 * amount})`);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawStar(ctx, x, y, size, fill = '#ffd166') {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = Math.max(1, size * 0.08);
  ctx.beginPath();
  for (let k = 0; k < 10; k++) {
    const r = k % 2 === 0 ? size : size * 0.45;
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawStarsRow(ctx, cx, cy, size, count = 5) {
  const gap = size * 1.7;
  const x0 = cx - ((count - 1) * gap) / 2;
  for (let i = 0; i < count; i++) drawStar(ctx, x0 + i * gap, cy, size);
}

// Four-point sparkle glint, as seen beside big poster titles.
function drawSparkle(ctx, x, y, size, fill = '#ffffff') {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.quadraticCurveTo(x, y, x + size, y);
  ctx.quadraticCurveTo(x, y, x, y + size);
  ctx.quadraticCurveTo(x, y, x - size, y);
  ctx.quadraticCurveTo(x, y, x, y - size);
  ctx.fill();
  ctx.restore();
}

// Gold starburst seal: "BEST CAST", "SEASON ONE", "100% ORIGINAL".
function drawGoldSeal(ctx, text, W, H) {
  if (!text) return;
  const cx = W * 0.90;
  const cy = H * 0.335;
  const R = Math.max(28, W * 0.052);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = R * 0.18;
  ctx.shadowOffsetY = R * 0.05;
  const g = ctx.createRadialGradient(0, 0, R * 0.1, 0, 0, R);
  g.addColorStop(0, '#fff3c4');
  g.addColorStop(0.6, '#ffd166');
  g.addColorStop(1, '#e8a91c');
  ctx.fillStyle = g;
  ctx.beginPath();
  const points = 14;
  for (let k = 0; k < points * 2; k++) {
    const r = k % 2 === 0 ? R : R * 0.86;
    const a = -Math.PI / 2 + (k * Math.PI) / points;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#8a5a00';
  ctx.lineWidth = Math.max(1.5, R * 0.02);
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.74, 0, Math.PI * 2);
  ctx.stroke();
  const lines = text.toUpperCase().split(' ');
  const size = R * 0.30;
  ctx.fillStyle = '#3d2703';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px Anton, sans-serif`;
  const mid = Math.ceil(lines.length / 2);
  const first = lines.slice(0, mid).join(' ');
  const second = lines.slice(mid).join(' ');
  if (second) {
    ctx.fillText(first, 0, -size * 0.55);
    ctx.fillText(second, 0, size * 0.55);
  } else {
    ctx.fillText(first, 0, 0);
  }
  drawStar(ctx, 0, -R * 0.52, R * 0.09, '#3d2703');
  ctx.restore();
}

function drawHalftone(ctx, x, y, w, h, step) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  for (let py = y + step / 2; py < y + h; py += step) {
    for (let px = x + step / 2; px < x + w; px += step) {
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1, step * 0.12), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// The giant striped retro-chrome title: horizontal sunset bands
// (yellow, orange, pink, purple) inside a thick dark outline and glow.
function drawStripedTitle(ctx, state, W, H, zone) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const cx = zone.x + zone.w / 2;
  let size = H * 0.115 * (state.titleScale || 1);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px Anton, sans-serif`;
  const maxW = zone.w * 0.94;
  while (ctx.measureText(state.title).width > maxW && size > 12) {
    size *= 0.94;
    ctx.font = `${size}px Anton, sans-serif`;
  }
  const cy = zone.y + zone.h * 0.40;
  const top = cy - size * 0.52;
  const bottom = cy + size * 0.52;
  const stripes = ctx.createLinearGradient(0, top, 0, bottom);
  stripes.addColorStop(0.0, '#fff3c4');
  stripes.addColorStop(0.20, '#ffe066');
  stripes.addColorStop(0.20, '#ff9a3d');
  stripes.addColorStop(0.42, '#ff9a3d');
  stripes.addColorStop(0.42, '#ff5e7a');
  stripes.addColorStop(0.64, '#ff5e7a');
  stripes.addColorStop(0.64, '#c65df0');
  stripes.addColorStop(0.86, '#c65df0');
  stripes.addColorStop(0.86, '#7a2b8f');
  stripes.addColorStop(1.0, '#7a2b8f');
  const text = state.title.toUpperCase();
  ctx.save();
  ctx.lineJoin = 'round';
  // soft drop shadow
  ctx.shadowColor = 'rgba(20,4,20,0.75)';
  ctx.shadowBlur = size * 0.10;
  ctx.shadowOffsetY = size * 0.05;
  ctx.strokeStyle = '#14060f';
  ctx.lineWidth = Math.max(3, size * 0.17);
  ctx.strokeText(text, cx, cy);
  ctx.shadowColor = 'rgba(255,94,122,0.55)';
  ctx.shadowBlur = size * 0.22;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = stripes;
  ctx.fillText(text, cx, cy);
  ctx.restore();
  // sparkle glints at the title's corners
  const halfW = Math.min(maxW, ctx.measureText(text).width) / 2;
  drawSparkle(ctx, cx - halfW - size * 0.16, cy - size * 0.42, size * 0.10);
  drawSparkle(ctx, cx + halfW + size * 0.14, cy + size * 0.34, size * 0.08);
  // neon script subtitle
  if (state.subtitle) {
    const subSize = Math.max(14, size * 0.38);
    ctx.save();
    ctx.font = `${subSize}px Pacifico, cursive`;
    ctx.fillStyle = '#ff8fd0';
    ctx.shadowColor = 'rgba(255,46,136,0.8)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.02;
    ctx.fillText(state.subtitle, cx, cy + size * 0.66);
    ctx.restore();
  }
  // tagline chip with pink end triangles
  if (state.tagline) {
    const chipSize = Math.max(11, size * 0.20);
    ctx.save();
    ctx.font = `${chipSize}px Anton, sans-serif`;
    const tw = ctx.measureText(state.tagline.toUpperCase()).width;
    const padX = chipSize * 1.4;
    const bw = tw + padX * 2;
    const bh = chipSize * 2.1;
    const bx = cx - bw / 2;
    const by = cy + size * 0.92;
    ctx.fillStyle = 'rgba(0,0,0,0.92)';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 3);
    ctx.fill();
    ctx.fillStyle = '#ff5e7a';
    ctx.beginPath();
    ctx.moveTo(bx - chipSize * 0.9, by + bh / 2);
    ctx.lineTo(bx - chipSize * 0.1, by + chipSize * 0.25);
    ctx.lineTo(bx - chipSize * 0.1, by + bh - chipSize * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx + bw + chipSize * 0.9, by + bh / 2);
    ctx.lineTo(bx + bw + chipSize * 0.1, by + chipSize * 0.25);
    ctx.lineTo(bx + bw + chipSize * 0.1, by + bh - chipSize * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(state.tagline.toUpperCase(), cx, by + bh / 2 + chipSize * 0.06);
    ctx.restore();
  }
}

function drawTopPressStrip(ctx, state, W, H) {
  const stripH = H * 0.052;
  ctx.save();
  ctx.fillStyle = '#0d0512';
  ctx.fillRect(0, 0, W, stripH);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, stripH - 1, W, 1);
  const cy = stripH / 2;
  // five gold stars, left
  const starSize = Math.max(7, stripH * 0.30);
  drawStarsRow(ctx, W * 0.015 + starSize * 4, cy, starSize, 5);
  // press quote, centred
  const quote = state.quote || { text: '', source: '' };
  const qText = quote.text ? `"${quote.text.toUpperCase()}"` : '';
  const qSource = quote.source ? ` — ${quote.source.toUpperCase()}` : '';
  let qSize = Math.max(10, stripH * 0.34);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${qSize}px Anton, sans-serif`;
  const maxQW = W * 0.62;
  while (ctx.measureText(qText + qSource).width > maxQW && qSize > 8) {
    qSize *= 0.94;
    ctx.font = `${qSize}px Anton, sans-serif`;
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillText(qText, W * 0.5, cy);
  if (qSource) {
    const qW = ctx.measureText(qText).width;
    ctx.fillStyle = '#ffd166';
    ctx.textAlign = 'left';
    ctx.fillText(qSource, W * 0.5 + qW / 2 + qSize * 0.4, cy);
  }
  // volume chip, right
  const vText = (state.volume || 'VOL. 1').toUpperCase();
  ctx.font = `${qSize}px Anton, sans-serif`;
  const vw = ctx.measureText(vText).width + qSize * 1.6;
  const vh = stripH * 0.62;
  const vx = W - W * 0.015 - vw;
  const vy = (stripH - vh) / 2;
  const vg = ctx.createLinearGradient(vx, vy, vx + vw, vy);
  vg.addColorStop(0, '#ffd166');
  vg.addColorStop(1, '#ff9a3d');
  ctx.fillStyle = vg;
  ctx.beginPath();
  ctx.roundRect(vx, vy, vw, vh, 2);
  ctx.fill();
  ctx.fillStyle = '#160818';
  ctx.textAlign = 'center';
  ctx.fillText(vText, vx + vw / 2, cy + qSize * 0.05);
  ctx.restore();
}

function drawPalmSilhouette(ctx, x, y, s, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  ctx.fillStyle = '#1c0510';
  // trunk: a filled tapering curve
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.quadraticCurveTo(2, -34, -1, -62);
  ctx.quadraticCurveTo(4, -34, 6, 0);
  ctx.closePath();
  ctx.fill();
  // fronds: filled drooping leaf shapes fanning from the crown
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.06 + i * 0.145);
    const tipX = -1 + Math.cos(a) * 52;
    const tipY = -62 + Math.sin(a) * 30 + 14;
    const midX = -1 + Math.cos(a) * 30;
    const midY = -62 + Math.sin(a) * 12 - 8;
    ctx.beginPath();
    ctx.moveTo(-1, -62);
    ctx.quadraticCurveTo(midX, midY - 10, tipX, tipY);
    ctx.quadraticCurveTo(midX + 6, midY + 8, -1, -62);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h, seedText) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  let seed = 0;
  for (let i = 0; i < seedText.length; i++) seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
  let bx = x + w * 0.06;
  const barAreaW = w * 0.88;
  const barH = h * 0.68;
  ctx.fillStyle = '#000000';
  while (bx < x + barAreaW) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const bw = 1 + (seed % 4) * (w / 220);
    const gap = 1 + ((seed >> 3) % 3) * (w / 220);
    if ((seed >> 5) % 3 !== 0) ctx.fillRect(bx, y + h * 0.08, bw, barH);
    bx += bw + gap;
  }
  ctx.fillStyle = '#000000';
  ctx.font = `${Math.max(7, Math.min(h * 0.14, w / 13))}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('0 10472 85991 8', x + w / 2, y + h * 0.86);
  ctx.restore();
}

function drawBottomBillingStrip(ctx, state, W, H) {
  const stripY = H * 0.905;
  const stripH = H - stripY;
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.save();
  const g = ctx.createLinearGradient(0, stripY, 0, H);
  g.addColorStop(0, grade.sky[1]);
  g.addColorStop(1, grade.sky[0]);
  ctx.fillStyle = g;
  ctx.fillRect(0, stripY, W, stripH);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(0, stripY, W, Math.max(2, H * 0.003));
  // palm silhouettes tucked at the strip's outer corners
  drawPalmSilhouette(ctx, W * 0.004, H * 0.998, Math.max(0.35, H * 0.00075));
  drawPalmSilhouette(ctx, W * 0.996, H * 0.998, Math.max(0.35, H * 0.00075), true);
  // release label, left
  const relSize = Math.max(12, stripH * 0.26);
  ctx.font = `${relSize}px Anton, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText((state.release || 'COMING SOON').toUpperCase(), W * 0.035, stripY + stripH * 0.32);
  // billing block, centred in the middle of the strip, shrunk to fit
  let billSize = Math.max(8, stripH * 0.155);
  ctx.font = `${billSize}px Anton, sans-serif`;
  const lines = state.billing && state.billing.length ? state.billing : [
    'A NEON COAST PICTURE · STARRING YOU AND YOUR CREW · SHOT ON YOUR OWN PHONE',
    'GRADED AT SUNSET · LETTERED BY HAND · NO PHOTO EVER LEAVES YOUR DEVICE',
  ];
  const maxBillW = W * 0.50;
  while (lines.some((l) => ctx.measureText(l).width > maxBillW) && billSize > 7) {
    billSize *= 0.94;
    ctx.font = `${billSize}px Anton, sans-serif`;
  }
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.textAlign = 'center';
  ctx.fillText(lines[0], W * 0.50, stripY + stripH * 0.30);
  if (lines[1]) ctx.fillText(lines[1], W * 0.50, stripY + stripH * 0.62);
  // barcode, right
  const bw = W * 0.085;
  const bh = stripH * 0.82;
  drawBarcode(ctx, W - W * 0.015 - bw, stripY + stripH * 0.09, bw, bh, state.title || 'NEON');
  ctx.restore();
}

function drawCentreTitleCell(ctx, state, W, H, grade) {
  const g = Math.round(Math.min(W, H) * 0.012);
  const gy0 = H * 0.058, gy1 = H * 0.90;
  const cw = (W * 0.97 - g * 2) / 3;
  const ch = (gy1 - gy0 - g * 2) / 3;
  const x = W * 0.015 + cw + g;
  const y = gy0 + ch + g;
  ctx.save();
  const bg = ctx.createLinearGradient(x, y, x + cw, y + ch);
  bg.addColorStop(0, grade.sky[0]);
  bg.addColorStop(1, grade.sky[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, cw, ch);
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = Math.max(2, cw * 0.008);
  ctx.strokeRect(x, y, cw, ch);
  drawStripedTitle(ctx, state, W, H, { x, y: y + ch * 0.06, w: cw, h: ch * 0.88 });
  ctx.restore();
}

// Background removal for the pop-out hero: region-growing from the
// photo's edges on a small copy. A pixel joins the background when it is
// close in colour to the background pixel it touches, so smooth skies,
// sand and roads grow outwards while strong edges (hair, shirt, car)
// stop the growth. The mask is feathered, then applied as alpha, so the
// figure is left on transparency. Runs fully on-device.
export function segmentCutoutHero(img, tolerance = 20) {
  const W = 200;
  const H = Math.max(1, Math.round((200 * img.naturalHeight) / img.naturalWidth));
  const small = document.createElement('canvas');
  small.width = W;
  small.height = H;
  const sctx = small.getContext('2d', { willReadFrequently: true });
  sctx.drawImage(img, 0, 0, W, H);
  const data = sctx.getImageData(0, 0, W, H).data;
  const tol2 = tolerance * tolerance;
  const close = (a, b) => {
    const dr = data[a] - data[b], dg = data[a + 1] - data[b + 1], db = data[a + 2] - data[b + 2];
    return dr * dr + dg * dg + db * db < tol2;
  };
  const mask = new Uint8Array(W * H); // 1 = background
  const stack = [];
  const seed = (x, y) => {
    const idx = y * W + x;
    if (!mask[idx]) { mask[idx] = 1; stack.push(idx); }
  };
  for (let x = 0; x < W; x++) { seed(x, 0); seed(x, H - 1); }
  for (let y = 0; y < H; y++) { seed(0, y); seed(W - 1, y); }
  while (stack.length) {
    const idx = stack.pop();
    const x = idx % W, y = (idx / W) | 0;
    const base = idx * 4;
    const tryNeighbour = (nx, ny) => {
      const nidx = ny * W + nx;
      if (mask[nidx]) return;
      if (close(nidx * 4, base)) { mask[nidx] = 1; stack.push(nidx); }
    };
    if (x > 0) tryNeighbour(x - 1, y);
    if (x < W - 1) tryNeighbour(x + 1, y);
    if (y > 0) tryNeighbour(x, y - 1);
    if (y < H - 1) tryNeighbour(x, y + 1);
  }
  let bgCount = 0;
  for (let i = 0; i < mask.length; i++) bgCount += mask[i];
  if (bgCount < mask.length * 0.04 || bgCount > mask.length * 0.92) return null;
  // keep only the largest connected foreground blob: the figure. Small
  // disconnected islands (a palm frond, a sign) would otherwise float
  // beside it as stray artefacts.
  const seen = new Uint8Array(W * H);
  let best = null;
  let bestSize = 0;
  for (let s = 0; s < W * H; s++) {
    if (mask[s] || seen[s]) continue;
    const comp = [];
    const q = [s];
    seen[s] = 1;
    while (q.length) {
      const idx = q.pop();
      comp.push(idx);
      const x = idx % W, y = (idx / W) | 0;
      const nb = (nx, ny) => {
        const nidx = ny * W + nx;
        if (!mask[nidx] && !seen[nidx]) { seen[nidx] = 1; q.push(nidx); }
      };
      if (x > 0) nb(x - 1, y);
      if (x < W - 1) nb(x + 1, y);
      if (y > 0) nb(x, y - 1);
      if (y < H - 1) nb(x, y + 1);
    }
    if (comp.length > bestSize) { bestSize = comp.length; best = comp; }
  }
  if (!best || bestSize < mask.length * 0.03) return null;
  const keep = new Uint8Array(W * H);
  for (const idx of best) keep[idx] = 1;
  // crop the mask to the figure's bounding box
  let minX = W, maxX = -1, minY = H, maxY = -1;
  for (const idx of best) {
    const x = idx % W, y = (idx / W) | 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  // feather the mask: shrink it to a quarter and draw it back up smoothed
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = bw;
  maskCanvas.height = bh;
  const mctx = maskCanvas.getContext('2d');
  const imgData = mctx.createImageData(bw, bh);
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const i = (y * bw + x) * 4;
      const kept = keep[(minY + y) * W + (minX + x)];
      imgData.data[i] = 255;
      imgData.data[i + 1] = 255;
      imgData.data[i + 2] = 255;
      imgData.data[i + 3] = kept ? 255 : 0;
    }
  }
  mctx.putImageData(imgData, 0, 0);
  const tiny = document.createElement('canvas');
  tiny.width = Math.max(2, bw >> 2);
  tiny.height = Math.max(2, bh >> 2);
  tiny.getContext('2d').drawImage(maskCanvas, 0, 0, tiny.width, tiny.height);
  mctx.imageSmoothingEnabled = true;
  mctx.clearRect(0, 0, bw, bh);
  mctx.drawImage(tiny, 0, 0, bw, bh);
  // apply the cropped mask to the matching crop of the full-size photo
  const sx = (minX / W) * img.naturalWidth;
  const sy = (minY / H) * img.naturalHeight;
  const sw = (bw / W) * img.naturalWidth;
  const sh = (bh / H) * img.naturalHeight;
  const out = document.createElement('canvas');
  out.width = Math.round(sw);
  out.height = Math.round(sh);
  const octx = out.getContext('2d');
  octx.drawImage(img, sx, sy, sw, sh, 0, 0, out.width, out.height);
  octx.globalCompositeOperation = 'destination-in';
  octx.drawImage(maskCanvas, 0, 0, out.width, out.height);
  return out;
}

// Main entry: paint the whole cover for the given state at W x H.
export function drawCover(ctx, state, W, H) {
  const grade = GRADES[state.grade] || GRADES.sunset;
  const layout = LAYOUTS[state.layout] || LAYOUTS.cast7;
  const g = Math.round(Math.min(W, H) * 0.012);
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, grade.sky[0]);
  bg.addColorStop(0.55, grade.sky[1]);
  bg.addColorStop(1, grade.sky[2]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const rects = layout.panels(W, H, g);
  const heroIdx = rects.findIndex((r) => r.hero);
  const cutout = state.cutout && heroIdx >= 0
    ? state.photos[state.panels[heroIdx]?.photo ?? 0]?.cutout || null
    : null;

  if (state.layout === 'tilt') {
    rects.forEach((r, i) => {
      ctx.save();
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.rotate(r.rot || 0);
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = W * 0.02;
      ctx.shadowOffsetY = H * 0.012;
      const frame = 0.06 * Math.min(r.w, r.h);
      ctx.fillStyle = '#fdfdf8';
      ctx.fillRect(-r.w / 2 - frame, -r.h / 2 - frame, r.w + frame * 2, r.h + frame * 2 + frame * 2.2);
      ctx.restore();
      ctx.save();
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.rotate(r.rot || 0);
      ctx.translate(-r.w / 2, -r.h / 2);
      drawPhotoPanel(ctx, state.photos[state.panels[i]?.photo ?? 0]?.img || null,
        { x: 0, y: 0, w: r.w, h: r.h }, state.panels[i] || {},
        (state.panels[i]?.grade && GRADES[state.panels[i].grade]) || grade);
      ctx.restore();
    });
  } else {
    rects.forEach((r, i) => {
      const panelGrade = (state.panels[i]?.grade && GRADES[state.panels[i].grade]) || grade;
      if (i === heroIdx && cutout) {
        // pop-out hero: the cut-out figure overlaps its panel and the title.
        // The figure keeps its own colours (no grade rect over it: a rect
        // would paint the transparent surroundings). It is drawn tall,
        // bottom-aligned to its panel, so the head sits high and the body
        // dives behind the title.
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur = W * 0.02;
        ctx.shadowOffsetY = H * 0.01;
        const ch = r.h * 0.96;
        const cw = (ch * cutout.width) / cutout.height;
        const cx = r.x + r.w / 2 - cw / 2;
        const cy = r.y + r.h - ch + H * 0.01;
        ctx.drawImage(cutout, cx, cy, cw, ch);
        ctx.restore();
      } else {
        drawPhotoPanel(ctx, state.photos[state.panels[i]?.photo ?? 0]?.img || null,
          r, state.panels[i] || {}, panelGrade);
      }
    });
  }

  // role tags on every panel (except the single full-bleed photo)
  if (rects.length > 1) {
    rects.forEach((r, i) => {
      drawRoleTag(ctx, state.panels[i]?.role || ROLES[i % ROLES.length], r, H);
    });
  }

  if (layout.titleMode === 'center') {
    drawCentreTitleCell(ctx, state, W, H, grade);
  } else if (layout.titleMode === 'top') {
    drawStripedTitle(ctx, state, W, H, { x: 0, y: H * 0.015, w: W, h: H * 0.20 });
  } else {
    // title overlapping the panels' lower third, then subtitle + tagline.
    // The zone sits high enough that the tagline clears the bottom-row
    // panels' role tags.
    drawStripedTitle(ctx, state, W, H, { x: 0, y: H * 0.52, w: W, h: H * 0.30 });
  }

  drawGoldSeal(ctx, state.seal, W, H);
  drawTopPressStrip(ctx, state, W, H);
  drawBottomBillingStrip(ctx, state, W, H);

  if (state.vignette) drawVignette(ctx, W, H, 1);
  if (state.grain) drawGrain(ctx, W, H, 0.07);
  ctx.restore();
}
