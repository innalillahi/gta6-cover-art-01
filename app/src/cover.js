// Neon Coast Cover Studio — cover engine.
// Draws GTA-style multi-panel cast posters on a 2D canvas, offline, from
// the user's own photos. Every render is deterministic: all randomness
// comes from a seeded generator, so the same state always draws the same
// bytes. No network, no external assets beyond the vendored fonts.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const ROLES = [
  "THE DRIVER", "THE BOSS", "THE FIXER", "THE CAPTAIN", "THE LOOKOUT",
  "THE MECHANIC", "THE RIDER", "THE QUEEN", "THE WILDCARD", "THE GETAWAY",
  "THE BRAINS", "THE CLOSER", "THE NAVIGATOR", "THE INSIDER", "THE COURIER",
];

export const TITLE_IDEAS = [
  ["NEON COAST", "Kings of the Causeway"],
  ["SUNDOWN RACKET", "Paid in Sunsets"],
  ["PALM FEVER", "One Last Summer"],
  ["HEAT WAVE", "Kings of the Coast"],
  ["HIGH TIDE HUSTLE", "After the Tide"],
  ["CORAL HEAT", "Seven Sinners, One Coast"],
  ["VICE HARBOR", "No Way Back"],
  ["GOLDEN MILE", "The Hottest Ride of the Year"],
  ["MIDNIGHT PALMS", "Everybody Wants a Cut"],
  ["SUNSET STRIP", "Zero Regrets"],
];

export const TAGLINE_IDEAS = [
  "SEVEN SINNERS · ONE COAST · ZERO REGRETS",
  "FIVE FRIENDS · ONE COAST · NO WAY BACK",
  "ONE COASTLINE · SIX STORIES · NO CURFEW",
  "ONE SUMMER · NO RULES · ALL HEAT",
  "THE COAST IS NEVER CLEAR",
  "EVERYONE WANTS A CUT OF THE SUNSET",
  "SHOT ON YOUR OWN PHONE · GRADED AT SUNSET",
];

export const QUOTE_IDEAS = [
  ["A SUN-BLEACHED JOYRIDE WITH TEETH", "THE MANGROVE TIMES"],
  ["THE HOTTEST RIDE OF THE YEAR", "GOLDEN MILE GAZETTE"],
  ["PURE GOLDEN-HOUR MAYHEM", "THE HARBOR GAZETTE"],
  ["HOTTER THAN THE ASPHALT", "THE PALM GAZETTE"],
  ["A FEVER DREAM IN NEON", "THE COAST HERALD"],
  ["A SUN-SOAKED THRILL RIDE", "THE BAYSIDE BUGLE"],
];

// Twelve colour grades. Each grade is a canvas filter plus a tint overlay
// blended over the photo, so every panel shares one warm sunset grade.
export const GRADES = [
  { id: "sunset", name: "Sunset Gold", filter: "saturate(1.4) contrast(1.08) sepia(0.25) brightness(1.03)", blend: "soft-light", alpha: 0.35, from: "#ff9e2c", to: "#ff2e88", swatch: ["#ffb020", "#ff2e88"] },
  { id: "vice", name: "Neon Vice", filter: "saturate(1.5) contrast(1.12) hue-rotate(-15deg)", blend: "overlay", alpha: 0.3, from: "#ff2e88", to: "#12d6c8", swatch: ["#ff2e88", "#12d6c8"] },
  { id: "golden", name: "Golden Hour", filter: "saturate(1.3) sepia(0.35) contrast(1.05)", blend: "multiply", alpha: 0.25, from: "#ffcf5c", to: "#ff7a18", swatch: ["#ffcf5c", "#ff7a18"] },
  { id: "dusk", name: "Magenta Dusk", filter: "saturate(1.45) hue-rotate(15deg) contrast(1.1)", blend: "overlay", alpha: 0.32, from: "#b537f2", to: "#ff5c8a", swatch: ["#b537f2", "#ff5c8a"] },
  { id: "teal", name: "Teal Noir", filter: "saturate(1.1) contrast(1.15) hue-rotate(140deg) brightness(0.95)", blend: "soft-light", alpha: 0.3, from: "#0f766e", to: "#f59e0b", swatch: ["#0f766e", "#f59e0b"] },
  { id: "heat", name: "Heat Haze", filter: "saturate(1.6) contrast(1.05) sepia(0.4)", blend: "overlay", alpha: 0.28, from: "#ff3d00", to: "#ffb020", swatch: ["#ff3d00", "#ffb020"] },
  { id: "palm", name: "Palm Shadow", filter: "saturate(1.2) contrast(1.12) brightness(0.98)", blend: "soft-light", alpha: 0.25, from: "#3f6212", to: "#fbbf24", swatch: ["#3f6212", "#fbbf24"] },
  { id: "chrome", name: "Chrome Night", filter: "saturate(0.9) contrast(1.2) brightness(1.05)", blend: "overlay", alpha: 0.3, from: "#6366f1", to: "#ec4899", swatch: ["#6366f1", "#ec4899"] },
  { id: "bubble", name: "Bubblegum", filter: "saturate(1.7) hue-rotate(25deg) contrast(1.05)", blend: "soft-light", alpha: 0.35, from: "#ff7ad9", to: "#7c3aed", swatch: ["#ff7ad9", "#7c3aed"] },
  { id: "mono", name: "Mono Gold", filter: "grayscale(0.85) sepia(0.5) contrast(1.1)", blend: "overlay", alpha: 0.3, from: "#d4a017", to: "#7c2d12", swatch: ["#d4a017", "#7c2d12"] },
  { id: "coral", name: "Coral Crush", filter: "saturate(1.5) contrast(1.06) hue-rotate(-25deg)", blend: "soft-light", alpha: 0.3, from: "#fb7185", to: "#f97316", swatch: ["#fb7185", "#f97316"] },
  { id: "midnight", name: "Midnight Drive", filter: "saturate(1.25) contrast(1.18) brightness(0.92)", blend: "multiply", alpha: 0.3, from: "#312e81", to: "#be185d", swatch: ["#312e81", "#be185d"] },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}

// Ten layouts. Cells are fractions of the panel area (between the top and
// bottom strips). hero marks the big close-up panel; popOut draws the hero
// as a sticker bursting out over the title band.
export const LAYOUTS = [
  { id: "marquee7", name: "Marquee 7", popOut: false, cells: [
    { x: 0.0, y: 0.0, w: 0.24, h: 0.5 }, { x: 0.25, y: 0.0, w: 0.5, h: 0.62, hero: true },
    { x: 0.76, y: 0.0, w: 0.24, h: 0.5 }, { x: 0.0, y: 0.51, w: 0.24, h: 0.49 },
    { x: 0.25, y: 0.63, w: 0.24, h: 0.37 }, { x: 0.5, y: 0.63, w: 0.25, h: 0.37 },
    { x: 0.76, y: 0.51, w: 0.24, h: 0.49 } ] },
  { id: "palm5", name: "Palm 5", popOut: false, cells: [
    { x: 0.0, y: 0.0, w: 0.27, h: 0.45 }, { x: 0.28, y: 0.05, w: 0.44, h: 0.9, hero: true },
    { x: 0.73, y: 0.0, w: 0.27, h: 0.45 }, { x: 0.0, y: 0.55, w: 0.27, h: 0.45 },
    { x: 0.73, y: 0.55, w: 0.27, h: 0.45 } ] },
  { id: "split", name: "Split Hero", popOut: false, cells: [
    { x: 0.0, y: 0.0, w: 0.55, h: 1.0, hero: true },
    { x: 0.56, y: 0.0, w: 0.44, h: 0.24 }, { x: 0.56, y: 0.25, w: 0.44, h: 0.24 },
    { x: 0.56, y: 0.5, w: 0.44, h: 0.24 }, { x: 0.56, y: 0.75, w: 0.44, h: 0.25 } ] },
  { id: "tilt", name: "Tilted Stack", popOut: false, cells: [
    { x: 0.02, y: 0.0, w: 0.52, h: 0.58, hero: true, rot: -1.5 },
    { x: 0.56, y: 0.02, w: 0.42, h: 0.42, rot: 1.5 },
    { x: 0.0, y: 0.6, w: 0.32, h: 0.4, rot: 1 },
    { x: 0.33, y: 0.62, w: 0.32, h: 0.38, rot: -1 },
    { x: 0.66, y: 0.48, w: 0.34, h: 0.52, rot: 1.5 } ] },
  { id: "nine", name: "Nine Grid", popOut: false, cells: [
    { x: 0.0, y: 0.0, w: 0.32, h: 0.32 }, { x: 0.34, y: 0.0, w: 0.32, h: 0.32 },
    { x: 0.68, y: 0.0, w: 0.32, h: 0.32 }, { x: 0.0, y: 0.34, w: 0.32, h: 0.32 },
    { x: 0.34, y: 0.34, w: 0.32, h: 0.32, hero: true }, { x: 0.68, y: 0.34, w: 0.32, h: 0.32 },
    { x: 0.0, y: 0.68, w: 0.32, h: 0.32 }, { x: 0.34, y: 0.68, w: 0.32, h: 0.32 },
    { x: 0.68, y: 0.68, w: 0.32, h: 0.32 } ] },
  { id: "strip", name: "Sunset Strip", popOut: false, cells: [
    { x: 0.0, y: 0.0, w: 1.0, h: 0.55, hero: true },
    { x: 0.0, y: 0.56, w: 0.24, h: 0.44 }, { x: 0.25, y: 0.56, w: 0.24, h: 0.44 },
    { x: 0.5, y: 0.56, w: 0.24, h: 0.44 }, { x: 0.75, y: 0.56, w: 0.25, h: 0.44 } ] },
  { id: "popout", name: "Pop-Out Hero", popOut: true, cells: [
    { x: 0.0, y: 0.0, w: 0.27, h: 0.46 }, { x: 0.28, y: 0.0, w: 0.44, h: 0.72, hero: true },
    { x: 0.73, y: 0.0, w: 0.27, h: 0.46 }, { x: 0.0, y: 0.54, w: 0.27, h: 0.46 },
    { x: 0.28, y: 0.74, w: 0.21, h: 0.26 }, { x: 0.51, y: 0.74, w: 0.21, h: 0.26 },
    { x: 0.73, y: 0.54, w: 0.27, h: 0.46 } ] },
  { id: "duo", name: "Duo Cast", popOut: false, cells: [
    { x: 0.0, y: 0.0, w: 0.49, h: 0.55, hero: true }, { x: 0.51, y: 0.0, w: 0.49, h: 0.55 },
    { x: 0.0, y: 0.56, w: 0.24, h: 0.44 }, { x: 0.25, y: 0.56, w: 0.24, h: 0.44 },
    { x: 0.5, y: 0.56, w: 0.24, h: 0.44 }, { x: 0.75, y: 0.56, w: 0.25, h: 0.44 } ] },
  { id: "crown", name: "Crown", popOut: false, cells: [
    { x: 0.0, y: 0.0, w: 0.24, h: 0.5 }, { x: 0.25, y: 0.0, w: 0.5, h: 0.5, hero: true },
    { x: 0.76, y: 0.0, w: 0.24, h: 0.5 }, { x: 0.0, y: 0.51, w: 0.24, h: 0.49 },
    { x: 0.25, y: 0.51, w: 0.5, h: 0.49 }, { x: 0.76, y: 0.51, w: 0.24, h: 0.49 } ] },
  { id: "vice", name: "Vice Grid", popOut: false, cells: [
    { x: 0.0, y: 0.0, w: 0.27, h: 0.48 }, { x: 0.28, y: 0.0, w: 0.26, h: 0.48 },
    { x: 0.0, y: 0.49, w: 0.27, h: 0.51 }, { x: 0.28, y: 0.49, w: 0.26, h: 0.51 },
    { x: 0.55, y: 0.0, w: 0.45, h: 1.0, hero: true } ] },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

const CHROME_STRIPES = ["#ffe45c", "#ff9e2c", "#ff2e88", "#b537f2"];

function stripedFill(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  const bands = CHROME_STRIPES.length;
  for (let i = 0; i < bands; i++) {
    const a = i / bands;
    const b = (i + 1) / bands;
    g.addColorStop(a, CHROME_STRIPES[i]);
    g.addColorStop(Math.min(b - 0.001, 1), CHROME_STRIPES[i]);
    if (b < 1) g.addColorStop(b, CHROME_STRIPES[i + 1] || CHROME_STRIPES[i]);
  }
  return g;
}

export function fitLines(ctx, text, fontFamily, maxWidth, startSize, minSize) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return { lines: [""], size: startSize };
  let size = startSize;
  const measure = (line, s) => {
    ctx.font = `${s}px ${fontFamily}`;
    return ctx.measureText(line).width;
  };
  while (size > minSize && measure(words.join(" "), size) > maxWidth) size *= 0.94;
  if (measure(words.join(" "), size) <= maxWidth) return { lines: [words.join(" ")], size };
  let best = 1;
  for (let split = 1; split < words.length; split++) {
    const a = words.slice(0, split).join(" ");
    const b = words.slice(split).join(" ");
    if (measure(a, size) <= maxWidth && measure(b, size) <= maxWidth) { best = split; break; }
  }
  return { lines: [words.slice(0, best).join(" "), words.slice(best).join(" ")], size };
}

function starPath(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function drawStars(ctx, x, y, size, count) {
  ctx.save();
  ctx.fillStyle = "#ffc93c";
  for (let i = 0; i < count; i++) {
    starPath(ctx, x + i * size * 1.35 + size / 2, y + size / 2, size / 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawBarcode(ctx, x, y, w, h, seedText) {
  const rng = mulberry32(hashString(seedText || "neon-coast"));
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#111111";
  let bx = x + w * 0.04;
  while (bx < x + w * 0.94) {
    const bw = (1 + Math.floor(rng() * 4)) * (w / 90);
    if (rng() > 0.42) ctx.fillRect(bx, y + h * 0.06, bw, h * 0.72);
    bx += bw + (w / 110);
  }
  ctx.restore();
}

export function drawSeal(ctx, cx, cy, r, line1, line2) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const teeth = 24;
  for (let i = 0; i < teeth * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.88;
    const a = (i * Math.PI) / teeth;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
  g.addColorStop(0, "#ffe45c");
  g.addColorStop(0.7, "#ffb020");
  g.addColorStop(1, "#e08a00");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = "#7a4d00";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.74, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1.5, r * 0.04);
  ctx.strokeStyle = "#7a4d00";
  ctx.stroke();
  ctx.fillStyle = "#4a2c00";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${Math.round(r * 0.3)}px Anton, sans-serif`;
  ctx.fillText(line1, 0, -r * 0.16);
  ctx.font = `${Math.round(r * 0.24)}px Anton, sans-serif`;
  ctx.fillText(line2, 0, r * 0.2);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// Draw one photo into a panel rect with a face-biased cover crop, the
// chosen grade, and the panel's own grain / halftone / vignette toggles.
// photo: { img, cx, cy, zoom } — cx/cy are 0..1 focus points (default
// 0.5 / 0.38, the upper third, so faces are never cut off).
function drawPhotoPanel(ctx, photo, rect, grade, rot) {
  const { img, cx, cy, zoom } = photo;
  ctx.save();
  if (rot) {
    ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
  }
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const base = Math.max(rect.w / iw, rect.h / ih) * (zoom || 1);
  const sw = rect.w / base;
  const sh = rect.h / base;
  let sx = (cx ?? 0.5) * iw - sw / 2;
  let sy = (cy ?? 0.38) * ih - sh / 2;
  sx = Math.max(0, Math.min(iw - sw, sx));
  sy = Math.max(0, Math.min(ih - sh, sy));
  ctx.filter = grade.filter;
  ctx.drawImage(img, sx, sy, sw, sh, rect.x, rect.y, rect.w, rect.h);
  ctx.filter = "none";
  ctx.globalCompositeOperation = grade.blend;
  ctx.globalAlpha = grade.alpha;
  const tint = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  tint.addColorStop(0, grade.from);
  tint.addColorStop(1, grade.to);
  ctx.fillStyle = tint;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  if (photo.vignette) {
    const v = ctx.createRadialGradient(
      rect.x + rect.w / 2, rect.y + rect.h / 2, Math.min(rect.w, rect.h) * 0.35,
      rect.x + rect.w / 2, rect.y + rect.h / 2, Math.max(rect.w, rect.h) * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.38)");
    ctx.fillStyle = v;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  }
  if (photo.halftone) {
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    const step = Math.max(6, rect.w / 90);
    for (let yy = rect.y + step / 2; yy < rect.y + rect.h; yy += step) {
      for (let xx = rect.x + step / 2; xx < rect.x + rect.w; xx += step) {
        ctx.beginPath();
        ctx.arc(xx, yy, step * 0.14, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
  ctx.save();
  ctx.lineWidth = Math.max(2, rect.w * 0.008);
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}

function drawRoleTag(ctx, text, x, y, size) {
  if (!text) return;
  ctx.save();
  ctx.font = `${Math.round(size)}px Anton, sans-serif`;
  const tw = ctx.measureText(text).width;
  const pad = size * 0.55;
  const h = size * 1.9;
  const w = tw + pad * 2 + size * 0.55;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - size * 0.4, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fillStyle = "rgba(8,4,16,0.92)";
  ctx.fill();
  ctx.fillStyle = "#ffc93c";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y + size * 0.25);
  ctx.lineTo(x + size * 0.55, y + size * 0.25);
  ctx.lineTo(x + size * 0.3, y + h - size * 0.25);
  ctx.lineTo(x, y + h - size * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + pad + size * 0.5, y + h / 2 + 1);
  ctx.restore();
}

function titleMetrics(ctx, state, W, H, area) {
  const maxW = W * 0.94;
  const { lines, size } = fitLines(ctx, state.title, "Anton, sans-serif", maxW, H * 0.155, H * 0.055);
  const lineH = size * 1.02;
  const blockH = lineH * lines.length;
  // Slightly above the middle: the subtitle clears the bottom row's faces.
  const cy = area.y + area.h * 0.47;
  const subSize = Math.max(14, H * 0.052);
  const subY = cy + blockH / 2 + subSize * 0.85;
  return { lines, size, lineH, blockH, cy, subSize, subY, top: cy - blockH / 2, bottom: subY + subSize * 0.72 };
}

function drawTitleBlock(ctx, state, W, H, area) {
  const maxW = W * 0.94;
  const { lines, size, lineH, blockH, cy, subSize, subY } = titleMetrics(ctx, state, W, H, area);
  let ty = cy - blockH / 2;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = size * 0.09;
  ctx.shadowOffsetY = size * 0.04;
  for (const line of lines) {
    ctx.font = `${Math.round(size)}px Anton, sans-serif`;
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(3, size * 0.085);
    ctx.strokeStyle = "#180a26";
    const ly = ty + lineH / 2;
    ctx.strokeText(line, W / 2, ly);
    ctx.fillStyle = stripedFill(ctx, W / 2 - maxW / 2, ly - size / 2, maxW, size);
    ctx.fillText(line, W / 2, ly);
    ty += lineH;
  }
  ctx.restore();
  ctx.save();
  ctx.font = `${Math.round(subSize)}px Pacifico, cursive`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const subW = ctx.measureText(state.subtitle).width;
  ctx.fillStyle = "rgba(10,5,18,0.72)";
  roundRect(ctx, W / 2 - subW / 2 - subSize * 0.7, subY - subSize * 0.72, subW + subSize * 1.4, subSize * 1.44, subSize * 0.72);
  ctx.fill();
  ctx.shadowColor = "#ff2e88";
  ctx.shadowBlur = subSize * 0.7;
  ctx.fillStyle = "#ff8fd2";
  ctx.fillText(state.subtitle, W / 2, subY);
  ctx.restore();
  return { top: cy - blockH / 2, bottom: subY + subSize * 0.72, size };
}

function drawTopStrip(ctx, state, W, topH) {
  const pad = W * 0.018;
  const starSize = Math.max(10, topH * 0.34);
  const y = (topH - starSize) / 2;
  drawStars(ctx, pad, y, starSize, 5);
  const qSize = Math.max(11, topH * 0.32);
  const chip = state.volume || "VOL. 1";
  ctx.save();
  ctx.font = `${Math.round(qSize)}px Anton, sans-serif`;
  const cw = ctx.measureText(chip).width + qSize * 1.6;
  const ch = topH * 0.58;
  const cx = W - pad - cw;
  const cy = (topH - ch) / 2;
  // The quote must end before the volume chip starts.
  const qx = pad + starSize * 5 * 1.35 + pad;
  const quoteMaxW = Math.max(50, cx - pad - qx);
  ctx.fillStyle = "#ffe9a8";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const quote = `\u201C${state.quote}\u201D  —  ${state.quoteSource}`;
  ctx.fillText(quote, qx, topH / 2 + 1, quoteMaxW);
  ctx.restore();
  ctx.save();
  ctx.font = `${Math.round(qSize)}px Anton, sans-serif`;
  ctx.fillStyle = "#ffc93c";
  roundRect(ctx, cx, cy, cw, ch, ch / 2);
  ctx.fill();
  ctx.fillStyle = "#1a0b2e";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(chip, cx + cw / 2, cy + ch / 2 + 1);
  ctx.restore();
}

function drawBottomStrip(ctx, state, W, H, botY, botH, seed) {
  const pad = W * 0.018;
  const g = ctx.createLinearGradient(0, botY, 0, H);
  g.addColorStop(0, "#1c0b33");
  g.addColorStop(1, "#0c0518");
  ctx.fillStyle = g;
  ctx.fillRect(0, botY, W, botH);
  ctx.fillStyle = "rgba(255,201,60,0.9)";
  ctx.fillRect(0, botY, W, Math.max(2, botH * 0.05));
  const pillH = botH * 0.42;
  const pillSize = Math.max(11, pillH * 0.42);
  ctx.save();
  ctx.font = `${Math.round(pillSize)}px Anton, sans-serif`;
  const tw = ctx.measureText(state.tagline).width;
  const pw = Math.min(tw + pillSize * 2.2, W * 0.62);
  const px = (W - pw) / 2;
  const py = botY + botH * 0.1;
  const pg = ctx.createLinearGradient(px, py, px + pw, py);
  pg.addColorStop(0, "#ff2e88");
  pg.addColorStop(1, "#b537f2");
  ctx.fillStyle = pg;
  roundRect(ctx, px, py, pw, pillH, pillH / 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(state.tagline, W / 2, py + pillH / 2 + 1, pw - pillSize);
  ctx.restore();
  const small = Math.max(9, W * 0.0075);
  ctx.save();
  ctx.font = `${Math.round(small)}px Anton, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const billing = "A NEON COAST PICTURE  ·  STARRING YOU AND YOUR CREW  ·  SHOT ON YOUR OWN PHONE";
  ctx.fillText(billing, W / 2, botY + botH * 0.66, W * 0.6);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("GRADED AT SUNSET  ·  LETTERED BY HAND  ·  NO PHOTO EVER LEAVES YOUR DEVICE", W / 2, botY + botH * 0.88, W * 0.6);
  ctx.restore();
  const csSize = Math.max(11, botH * 0.2);
  ctx.save();
  ctx.font = `${Math.round(csSize)}px Anton, sans-serif`;
  ctx.fillStyle = "#ffc93c";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("COMING SOON", pad, botY + botH * 0.32);
  ctx.restore();
  const bw = W * 0.075;
  const bh = botH * 0.42;
  drawBarcode(ctx, W - pad - bw, botY + botH * 0.14, bw, bh, seed);
  ctx.save();
  ctx.font = `${Math.round(Math.max(8, W * 0.006))}px Anton, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("8 6 7 5 3 0 9", W - pad - bw / 2, botY + botH * 0.68);
  ctx.restore();
}

function drawGrain(ctx, W, H, seed, amount) {
  const rng = mulberry32(seed);
  ctx.save();
  const n = Math.round(amount);
  for (let i = 0; i < n; i++) {
    const a = rng() * 0.09;
    ctx.fillStyle = rng() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.fillRect(rng() * W, rng() * H, 1.6, 1.6);
  }
  ctx.restore();
}

// The main render. state carries everything the editor edits; W/H pick the
// export size (1080x1080, 1080x1350 or 1920x1080). Returns nothing.
export function drawCover(ctx, state, W, H) {
  const layout = layoutById(state.layoutId);
  const grade = gradeById(state.gradeId);
  const topH = H * 0.075;
  const botH = H * 0.105;
  const area = { x: 0, y: topH, w: W, h: H - topH - botH };
  const gap = Math.max(4, W * 0.006);
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#150a20";
  ctx.fillRect(0, 0, W, H);
  const cells = layout.cells.map((c) => ({
    x: area.x + c.x * area.w + gap / 2,
    y: area.y + c.y * area.h + gap / 2,
    w: c.w * area.w - gap,
    h: c.h * area.h - gap,
    hero: !!c.hero,
    rot: c.rot || 0,
  }));
  const heroIdx = cells.findIndex((c) => c.hero);
  const titleBox = titleMetrics(ctx, state, W, H, area);
  cells.forEach((cell, i) => {
    // In pop-out layouts the hero is drawn last, enlarged, below.
    if (layout.popOut && i === heroIdx) return;
    const photo = state.photos[i % state.photos.length];
    if (!photo || !photo.img) return;
    const pGrade = photo.gradeId ? gradeById(photo.gradeId) : grade;
    drawPhotoPanel(ctx, photo, cell, pGrade, cell.rot);
    const tagSize = Math.max(11, H * 0.021);
    // The title band crosses the upper panels' lower third, so any tag
    // whose panel ends inside the title band rides at the top-left
    // instead of being buried under the title.
    const tagY = (cell.hero || cell.y + cell.h <= titleBox.bottom + 8)
      ? cell.y + tagSize * 0.5
      : cell.y + cell.h - tagSize * 2.4;
    drawRoleTag(ctx, photo.role || "", cell.x + tagSize * 0.5, tagY, tagSize);
  });
  if (layout.popOut && heroIdx >= 0) {
    // Pop-out hero: the big close-up bursts out of its grid cell — drawn
    // 12% larger than its cell, on a white sticker card with a drop
    // shadow, overlapping its neighbours. The title is drawn after it,
    // so the title stays on top and always readable.
    const photo = state.photos[heroIdx % state.photos.length];
    const cell = cells[heroIdx];
    if (photo && photo.img) {
      const big = {
        x: cell.x - cell.w * 0.06,
        y: cell.y,
        w: cell.w * 1.12,
        h: cell.h * 1.12,
      };
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.65)";
      ctx.shadowBlur = W * 0.02;
      ctx.shadowOffsetY = H * 0.008;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, big.x, big.y, big.w, big.h, Math.max(6, W * 0.008));
      ctx.fill();
      ctx.restore();
      const pGrade = photo.gradeId ? gradeById(photo.gradeId) : grade;
      drawPhotoPanel(ctx, photo, big, pGrade, 0);
      const tagSize = Math.max(11, H * 0.021);
      drawRoleTag(ctx, photo.role || "", big.x + tagSize * 0.5, big.y + tagSize * 0.5, tagSize);
    }
  }
  drawTitleBlock(ctx, state, W, H, area);
  drawTopStrip(ctx, state, W, topH);
  drawBottomStrip(ctx, state, W, H, H - botH, botH, state.title);
  if (state.sealText) {
    const parts = state.sealText.split(/\s+/);
    const mid = Math.ceil(parts.length / 2);
    // Stamped on the hero panel's top-right corner: sky and palms there,
    // so the seal never covers a face. Clamped inside the poster edge.
    const r = Math.max(26, W * 0.045);
    let sealX = W * 0.72;
    if (heroIdx >= 0) sealX = cells[heroIdx].x + cells[heroIdx].w - r * 0.55;
    sealX = Math.min(sealX, W - r * 1.05);
    drawSeal(ctx, sealX, area.y + area.h * 0.07, r,
      parts.slice(0, mid).join(" "), parts.slice(mid).join(" ") || "★");
  }
  if (state.grain) drawGrain(ctx, W, H, hashString(state.title + state.layoutId), W * H / 2600);
  ctx.lineWidth = Math.max(3, W * 0.004);
  ctx.strokeStyle = "rgba(255,201,60,0.85)";
  ctx.strokeRect(1, 1, W - 2, H - 2);
  ctx.restore();
}

export function exportSizes() {
  return [
    { id: "square", label: "1:1 · 1080 × 1080", w: 1080, h: 1080 },
    { id: "portrait", label: "4:5 · 1080 × 1350", w: 1080, h: 1350 },
    { id: "wide", label: "16:9 · 1920 × 1080", w: 1920, h: 1080 },
  ];
}
