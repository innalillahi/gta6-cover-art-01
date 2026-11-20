// Neon Coast Cover Studio — editor.
// Own photos stay on the device: files are read with object URLs and
// nothing is ever uploaded. The poster is drawn by src/cover.js.
import {
  GRADES, LAYOUTS, ROLES, TITLE_IDEAS, TAGLINE_IDEAS, QUOTE_IDEAS,
  layoutById, gradeById, drawCover, exportSizes,
} from "./cover.js";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const SAMPLES = [
  { file: "samples/woman-convertible.jpg", name: "Convertible", role: "THE QUEEN", cx: 0.5, cy: 0.34 },
  { file: "samples/man-rooftop.jpg", name: "Rooftop", role: "THE BOSS", cx: 0.5, cy: 0.38 },
  { file: "samples/friends-neon.jpg", name: "Neon Night", role: "THE LOOKOUT", cx: 0.42, cy: 0.38 },
  { file: "samples/man-pier.jpg", name: "Pier", role: "THE CAPTAIN", cx: 0.5, cy: 0.36 },
  { file: "samples/boulevard.jpg", name: "Boulevard", role: "THE STRIP", cx: 0.5, cy: 0.3 },
  { file: "samples/pier.jpg", name: "Boardwalk", role: "THE PIER", cx: 0.5, cy: 0.3 },
];

const DEFAULT_PHOTOS = [
  { sample: 1, role: "THE BOSS", cx: 0.5, cy: 0.38 },
  { sample: 0, role: "THE QUEEN", cx: 0.5, cy: 0.34 },
  { sample: 2, role: "THE LOOKOUT", cx: 0.42, cy: 0.38 },
  { sample: 3, role: "THE CAPTAIN", cx: 0.5, cy: 0.36 },
  { sample: 4, role: "THE STRIP", cx: 0.5, cy: 0.28 },
  { sample: 5, role: "THE PIER", cx: 0.5, cy: 0.28 },
  { sample: 2, role: "THE WILDCARD", cx: 0.78, cy: 0.38 },
];

const state = {
  layoutId: "marquee7",
  gradeId: "sunset",
  title: "NEON COAST",
  subtitle: "Kings of the Causeway",
  tagline: "SEVEN SINNERS · ONE COAST · ZERO REGRETS",
  quote: "A SUN-BLEACHED JOYRIDE WITH TEETH",
  quoteSource: "THE MANGROVE TIMES",
  volume: "VOL. 1",
  sealText: "SEASON ONE",
  grain: true,
  photos: [],
  selected: 0,
  aspect: "wide",
};

const sampleImages = [];
let renderQueued = false;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

async function loadSamples() {
  for (const s of SAMPLES) {
    try {
      sampleImages.push(await loadImage(s.file));
    } catch (err) {
      sampleImages.push(null);
      console.warn(err.message);
    }
  }
  state.photos = DEFAULT_PHOTOS.map((d) => {
    const img = sampleImages[d.sample];
    if (!img) return null;
    return { img, name: SAMPLES[d.sample].name, cx: d.cx, cy: d.cy, zoom: 1, role: d.role, gradeId: "", grain: false, halftone: false, vignette: true };
  }).filter(Boolean);
}

function previewSize() {
  const sizes = { square: [960, 960], portrait: [864, 1080], wide: [960, 540] };
  return sizes[state.aspect] || sizes.wide;
}

function render() {
  const canvas = $("#preview");
  if (!canvas) return;
  let w;
  let h;
  if (SHOT_SIZES[SHOT]) {
    [w, h] = SHOT_SIZES[SHOT];
  } else {
    [w, h] = previewSize();
  }
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d");
  drawCover(ctx, state, w, h);
  const panel = state.photos[state.selected];
  $("#panelName").textContent = panel
    ? `Panel ${state.selected + 1} · ${panel.name || "your photo"}`
    : `Panel ${state.selected + 1}`;
  updatePanelDots();
}

function queueRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    render();
  });
}

function updatePanelDots() {
  const dots = $("#panelDots");
  if (!dots) return;
  const cells = layoutById(state.layoutId).cells;
  dots.innerHTML = "";
  cells.forEach((cell, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "panel-dot" + (i === state.selected ? " active" : "") + (cell.hero ? " hero" : "");
    b.textContent = String(i + 1);
    b.title = cell.hero ? `Panel ${i + 1} (hero)` : `Panel ${i + 1}`;
    b.addEventListener("click", () => {
      state.selected = i;
      syncPanelControls();
      queueRender();
    });
    dots.appendChild(b);
  });
}

function pickUnusedRole() {
  const used = new Set(state.photos.map((p) => p.role));
  return ROLES.find((r) => !used.has(r)) || ROLES[0];
}

function assignPhotoToSelected(img, name, sample) {
  const def = sample ? SAMPLES[sample] : null;
  const photo = {
    img, name: name || "your photo",
    cx: def ? def.cx : 0.5, cy: def ? def.cy : 0.38,
    zoom: 1, role: "", gradeId: "", grain: false, halftone: false, vignette: true,
  };
  const current = state.photos[state.selected];
  if (current && current.role) photo.role = current.role;
  else photo.role = pickUnusedRole();
  state.photos[state.selected] = photo;
  syncPanelControls();
  queueRender();
}

function surpriseMe() {
  const rnd = Math.random;
  state.layoutId = LAYOUTS[Math.floor(rnd() * LAYOUTS.length)].id;
  state.gradeId = GRADES[Math.floor(rnd() * GRADES.length)].id;
  const [title, subtitle] = TITLE_IDEAS[Math.floor(rnd() * TITLE_IDEAS.length)];
  state.title = title;
  state.subtitle = subtitle;
  state.tagline = TAGLINE_IDEAS[Math.floor(rnd() * TAGLINE_IDEAS.length)];
  const [quote, source] = QUOTE_IDEAS[Math.floor(rnd() * QUOTE_IDEAS.length)];
  state.quote = quote;
  state.quoteSource = source;
  state.selected = 0;
  syncAllControls();
  queueRender();
}

async function exportPng(size) {
  const canvas = document.createElement("canvas");
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas.getContext("2d"), state, size.w, size.h);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `neon-coast-${size.w}x${size.h}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return blob.size;
}

const params = new URLSearchParams(window.location.search);
const SHOT = params.get("shot") || "";
// Fixed backing sizes for screenshot mode. Headless Chrome reports a
// smaller window.innerWidth at load time than the --window-size used for
// the screenshot, so measuring the window would render the poster at the
// wrong aspect and crop it. These sizes match the screenshot windows
// exactly, so the canvas maps 1:1 onto the frame.
const SHOT_SIZES = { cover: [1280, 720], square: [1024, 1024], portrait: [1024, 1280], export: [1920, 1080] };

async function waitForFonts() {
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('16px Anton'),
        document.fonts.load('16px Pacifico'),
        document.fonts.ready,
      ]),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]);
  } catch (err) {
    console.warn("fonts not ready, using fallback", err);
  }
}

function markReady() {
  window.__shotReady = true;
  document.body.classList.add("shot-ready");
}

async function boot() {
  if (SHOT === "cover" || SHOT === "export") {
    document.body.classList.add("shot-mode", "shot-cover");
    state.aspect = "wide";
  } else if (SHOT === "square") {
    document.body.classList.add("shot-mode", "shot-square");
    state.aspect = "square";
  } else if (SHOT === "portrait") {
    document.body.classList.add("shot-mode", "shot-portrait");
    state.aspect = "portrait";
  }
  if (SHOT === "editor") document.body.classList.add("shot-mode", "shot-editor");
  // Deep links: ?layout=popout&grade=vice opens a specific look.
  const wantLayout = params.get("layout");
  if (wantLayout && LAYOUTS.some((l) => l.id === wantLayout)) state.layoutId = wantLayout;
  const wantGrade = params.get("grade");
  if (wantGrade && GRADES.some((g) => g.id === wantGrade)) state.gradeId = wantGrade;
  await loadSamples();
  await waitForFonts();
  buildLayoutPicker();
  buildGradePicker();
  buildSampleTray();
  syncAllControls();
  render();
  if (SHOT) {
    // One extra frame after fonts settle, then signal the screenshot.
    requestAnimationFrame(() => requestAnimationFrame(() => markReady()));
  }
}

document.addEventListener("DOMContentLoaded", boot);

function buildLayoutPicker() {
  const wrap = $("#layoutGrid");
  if (!wrap) return;
  wrap.innerHTML = "";
  for (const layout of LAYOUTS) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "layout-card" + (layout.id === state.layoutId ? " active" : "");
    b.dataset.layout = layout.id;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 62");
    svg.setAttribute("aria-hidden", "true");
    for (const c of layout.cells) {
      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("x", String(c.x * 100 + 1));
      r.setAttribute("y", String(c.y * 62 + 1));
      r.setAttribute("width", String(Math.max(2, c.w * 100 - 2)));
      r.setAttribute("height", String(Math.max(2, c.h * 62 - 2)));
      r.setAttribute("rx", "2");
      r.setAttribute("class", c.hero ? "cell hero" : "cell");
      svg.appendChild(r);
    }
    const label = document.createElement("span");
    label.textContent = `${layout.name} · ${layout.cells.length}`;
    b.appendChild(svg);
    b.appendChild(label);
    b.addEventListener("click", () => {
      state.layoutId = layout.id;
      state.selected = 0;
      $$(".layout-card").forEach((el) => el.classList.toggle("active", el.dataset.layout === layout.id));
      syncPanelControls();
      queueRender();
    });
    wrap.appendChild(b);
  }
}

function buildGradePicker() {
  const wrap = $("#gradeGrid");
  if (!wrap) return;
  wrap.innerHTML = "";
  for (const grade of GRADES) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "grade-chip" + (grade.id === state.gradeId ? " active" : "");
    b.dataset.grade = grade.id;
    b.style.background = `linear-gradient(135deg, ${grade.swatch[0]}, ${grade.swatch[1]})`;
    b.title = grade.name;
    const label = document.createElement("span");
    label.textContent = grade.name;
    b.appendChild(label);
    b.addEventListener("click", () => {
      state.gradeId = grade.id;
      $$(".grade-chip").forEach((el) => el.classList.toggle("active", el.dataset.grade === grade.id));
      queueRender();
    });
    wrap.appendChild(b);
  }
}

function buildSampleTray() {
  const wrap = $("#sampleTray");
  if (!wrap) return;
  wrap.innerHTML = "";
  SAMPLES.forEach((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "sample-thumb";
    b.title = `${s.name} — ${s.role}`;
    const img = document.createElement("img");
    img.src = s.file;
    img.alt = s.name;
    img.loading = "lazy";
    const label = document.createElement("span");
    label.textContent = s.name;
    b.appendChild(img);
    b.appendChild(label);
    b.addEventListener("click", () => {
      const loaded = sampleImages[i];
      if (loaded) assignPhotoToSelected(loaded, s.name, i);
    });
    wrap.appendChild(b);
  });
}

function syncPanelControls() {
  const photo = state.photos[state.selected];
  const role = $("#roleInput");
  if (role) role.value = photo ? photo.role || "" : "";
  const zoom = $("#zoomRange");
  if (zoom) zoom.value = photo ? String(photo.zoom || 1) : "1";
  const panX = $("#panXRange");
  if (panX) panX.value = photo ? String(photo.cx ?? 0.5) : "0.5";
  const panY = $("#panYRange");
  if (panY) panY.value = photo ? String(photo.cy ?? 0.38) : "0.38";
  const pGrade = $("#panelGrade");
  if (pGrade) pGrade.value = photo ? photo.gradeId || "" : "";
  const halftone = $("#halftoneToggle");
  if (halftone) halftone.checked = !!(photo && photo.halftone);
  const vignette = $("#vignetteToggle");
  if (vignette) vignette.checked = !!(photo && photo.vignette);
  const grain = $("#grainToggle");
  if (grain) grain.checked = !!state.grain;
}

function syncAllControls() {
  const bind = (id, value) => {
    const el = $(id);
    if (el) el.value = value;
  };
  bind("#titleInput", state.title);
  bind("#subtitleInput", state.subtitle);
  bind("#taglineInput", state.tagline);
  bind("#quoteInput", state.quote);
  bind("#sourceInput", state.quoteSource);
  bind("#volumeInput", state.volume);
  bind("#sealInput", state.sealText);
  $$(".layout-card").forEach((el) => el.classList.toggle("active", el.dataset.layout === state.layoutId));
  $$(".grade-chip").forEach((el) => el.classList.toggle("active", el.dataset.grade === state.gradeId));
  $$(".aspect-btn").forEach((el) => el.classList.toggle("active", el.dataset.aspect === state.aspect));
  syncPanelControls();
}

function wireControls() {
  const textBind = (id, key) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener("input", () => {
      state[key] = el.value;
      queueRender();
    });
  };
  textBind("#titleInput", "title");
  textBind("#subtitleInput", "subtitle");
  textBind("#taglineInput", "tagline");
  textBind("#quoteInput", "quote");
  textBind("#sourceInput", "quoteSource");
  textBind("#volumeInput", "volume");
  textBind("#sealInput", "sealText");

  const role = $("#roleInput");
  if (role) role.addEventListener("input", () => {
    const photo = state.photos[state.selected];
    if (photo) photo.role = role.value.toUpperCase();
    queueRender();
  });
  const zoom = $("#zoomRange");
  if (zoom) zoom.addEventListener("input", () => {
    const photo = state.photos[state.selected];
    if (photo) photo.zoom = parseFloat(zoom.value);
    queueRender();
  });
  const panX = $("#panXRange");
  if (panX) panX.addEventListener("input", () => {
    const photo = state.photos[state.selected];
    if (photo) photo.cx = parseFloat(panX.value);
    queueRender();
  });
  const panY = $("#panYRange");
  if (panY) panY.addEventListener("input", () => {
    const photo = state.photos[state.selected];
    if (photo) photo.cy = parseFloat(panY.value);
    queueRender();
  });
  const pGrade = $("#panelGrade");
  if (pGrade) {
    pGrade.innerHTML = `<option value="">Same as cover</option>` + GRADES.map((g) => `<option value="${g.id}">${g.name}</option>`).join("");
    pGrade.addEventListener("change", () => {
      const photo = state.photos[state.selected];
      if (photo) photo.gradeId = pGrade.value;
      queueRender();
    });
  }
  const halftone = $("#halftoneToggle");
  if (halftone) halftone.addEventListener("change", () => {
    const photo = state.photos[state.selected];
    if (photo) photo.halftone = halftone.checked;
    queueRender();
  });
  const vignette = $("#vignetteToggle");
  if (vignette) vignette.addEventListener("change", () => {
    const photo = state.photos[state.selected];
    if (photo) photo.vignette = vignette.checked;
    queueRender();
  });
  const grain = $("#grainToggle");
  if (grain) grain.addEventListener("change", () => {
    state.grain = grain.checked;
    queueRender();
  });
  const autoTag = $("#autoTagBtn");
  if (autoTag) autoTag.addEventListener("click", () => {
    const photo = state.photos[state.selected];
    if (photo) {
      photo.role = pickUnusedRole();
      syncPanelControls();
      queueRender();
    }
  });

  $$(".aspect-btn").forEach((b) => b.addEventListener("click", () => {
    state.aspect = b.dataset.aspect;
    $$(".aspect-btn").forEach((el) => el.classList.toggle("active", el === b));
    queueRender();
  }));

  const surprise = $("#surpriseBtn");
  if (surprise) surprise.addEventListener("click", surpriseMe);

  const status = $("#statusLine");
  const say = (msg) => { if (status) status.textContent = msg; };
  $$(".export-btn").forEach((b) => b.addEventListener("click", async () => {
    const size = exportSizes().find((s) => s.id === b.dataset.size);
    if (!size) return;
    b.disabled = true;
    say(`Exporting ${size.w} × ${size.h}…`);
    try {
      const bytes = await exportPng(size);
      say(`Exported ${size.label} PNG (${Math.round(bytes / 1024)} KB). Check your downloads.`);
    } catch (err) {
      say(`Export failed: ${err.message}`);
    } finally {
      b.disabled = false;
    }
  }));
  const exportAll = $("#exportAllBtn");
  if (exportAll) exportAll.addEventListener("click", async () => {
    exportAll.disabled = true;
    for (const size of exportSizes()) {
      say(`Exporting ${size.w} × ${size.h}…`);
      await exportPng(size);
    }
    say("Exported all three sizes as PNG. Check your downloads.");
    exportAll.disabled = false;
  });

  const fileInput = $("#fileInput");
  if (fileInput) {
    fileInput.addEventListener("change", async () => {
      const files = Array.from(fileInput.files || []);
      for (let i = 0; i < files.length; i++) {
        const url = URL.createObjectURL(files[i]);
        try {
          const img = await loadImage(url);
          if (i > 0) state.selected = Math.min(state.selected + 1, layoutById(state.layoutId).cells.length - 1);
          assignPhotoToSelected(img, files[i].name.replace(/\.[^.]+$/, ""));
        } catch (err) {
          say(`Could not read ${files[i].name}.`);
        }
      }
      fileInput.value = "";
    });
  }
  const drop = $("#dropZone");
  if (drop) {
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("drag"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
    drop.addEventListener("drop", async (e) => {
      e.preventDefault();
      drop.classList.remove("drag");
      const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
      for (const file of files) {
        const url = URL.createObjectURL(file);
        try {
          const img = await loadImage(url);
          assignPhotoToSelected(img, file.name.replace(/\.[^.]+$/, ""));
        } catch (err) {
          say(`Could not read ${file.name}.`);
        }
      }
    });
  }
}

wireControls();
