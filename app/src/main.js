// Neon Coast Cover Studio v2: editor wiring. Owns the app state, the live
// preview, panel picking and dragging, undo/redo, PNG export, the
// "Surprise me" re-roll and the ?shot= scenes the screenshots are taken
// from. No network: photos are read with FileReader or fetched from
// app/samples/ on the same origin.

import {
  LAYOUTS, GRADES, SIZES, ROLES, TITLE_POOL, SUBTITLE_POOL, TAGLINE_POOL,
  QUOTE_POOL, SEAL_POOL, drawCover, fitPhotoCover, segmentCutoutHero,
} from './cover.js';

const $ = (id) => document.getElementById(id);
const PREVIEW_MAX = 860;
const SAMPLE_NAMES = ['boulevard.jpg', 'pier.jpg', 'palm-sunset.jpg', 'neon-street.jpg'];

const state = {
  layout: 'cast7',
  grade: 'sunset',
  sizeId: 'portrait',
  title: 'SUNSET RUN',
  subtitle: 'palm nights on the neon coast',
  tagline: 'FIVE FRIENDS · ONE COAST · NO WAY BACK',
  quote: { text: 'EVERY FRAME A POSTCARD', source: 'THE PALM JOURNAL' },
  volume: 'VOL. 1',
  release: 'COMING SOON',
  seal: 'BEST CAST',
  billing: [
    'A NEON COAST PICTURE · STARRING YOU AND YOUR CREW · SHOT ON YOUR OWN PHONE',
    'GRADED AT SUNSET · LETTERED BY HAND · NO PHOTO EVER LEAVES YOUR DEVICE',
  ],
  titleScale: 1,
  grain: true,
  vignette: true,
  halftone: true,
  cutout: false,
  cutoutTolerance: 20,
  photos: [], // { name, img, cutout }
  panels: [], // { photo, cx, cy, zoom, role, grade }
};

let selectedPanel = 0;
let undoStack = [];
let redoStack = [];
let renderQueued = false;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function currentSize() {
  return SIZES.find((s) => s.id === state.sizeId) || SIZES[1];
}

function panelCount() {
  const size = currentSize();
  return LAYOUTS[state.layout].panels(size.w, size.h, 12).length;
}

function heroPanelIndex() {
  const size = currentSize();
  const rects = LAYOUTS[state.layout].panels(size.w, size.h, 12);
  return rects.findIndex((r) => r.hero);
}

function ensurePanels() {
  const n = panelCount();
  while (state.panels.length < n) {
    state.panels.push({
      photo: 0, cx: 0.5, cy: 0.38, zoom: 1,
      role: ROLES[state.panels.length % ROLES.length], grade: '',
    });
  }
  state.panels.length = n;
  state.panels.forEach((p) => {
    if (p.photo >= state.photos.length) p.photo = 0;
    if (!p.role) p.role = ROLES[0];
  });
  if (selectedPanel >= n) selectedPanel = 0;
}

function snapshotState() {
  const { photos, ...rest } = state;
  void photos;
  return JSON.stringify(rest);
}

function pushHistory() {
  undoStack.push(snapshotState());
  if (undoStack.length > 60) undoStack.shift();
  redoStack = [];
  updateUndoButtons();
}

function restoreSnapshot(json) {
  const s = JSON.parse(json);
  const photos = state.photos;
  Object.assign(state, s, { photos });
  ensurePanels();
  syncControls();
  queueRender();
}

function undoState() {
  if (!undoStack.length) return;
  redoStack.push(snapshotState());
  restoreSnapshot(undoStack.pop());
  updateUndoButtons();
}

function redoState() {
  if (!redoStack.length) return;
  undoStack.push(snapshotState());
  restoreSnapshot(redoStack.pop());
  updateUndoButtons();
}

function updateUndoButtons() {
  $('undoBtn').disabled = !undoStack.length;
  $('redoBtn').disabled = !redoStack.length;
}

const preview = $('preview');
const pctx = preview.getContext('2d');

function renderPreview() {
  renderQueued = false;
  ensurePanels();
  const size = currentSize();
  const scale = Math.min(1, PREVIEW_MAX / Math.max(size.w, size.h));
  const pw = Math.round(size.w * scale);
  const ph = Math.round(size.h * scale);
  if (preview.width !== pw || preview.height !== ph) {
    preview.width = pw;
    preview.height = ph;
  }
  drawCover(pctx, state, pw, ph);
  drawSelectionOutline(scale);
}

function drawSelectionOutline(scale) {
  const size = currentSize();
  const g = Math.round(Math.min(size.w, size.h) * 0.012);
  const rects = LAYOUTS[state.layout].panels(size.w, size.h, g);
  const r = rects[selectedPanel];
  if (!r) return;
  pctx.save();
  pctx.strokeStyle = '#7df9ff';
  pctx.lineWidth = 3;
  pctx.setLineDash([10, 6]);
  pctx.strokeRect(r.x * scale - 2, r.y * scale - 2, r.w * scale + 4, r.h * scale + 4);
  pctx.setLineDash([]);
  pctx.fillStyle = '#7df9ff';
  pctx.font = 'bold 12px system-ui, sans-serif';
  pctx.textAlign = 'left';
  pctx.textBaseline = 'bottom';
  pctx.fillText(`PANEL ${selectedPanel + 1} · ${state.panels[selectedPanel]?.role || ''}`,
    r.x * scale + 4, Math.max(12, r.y * scale - 4));
  pctx.restore();
}

function queueRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(renderPreview);
}

// Render a full-size cover offscreen and download it as a PNG.
async function exportCoverPNG() {
  const size = currentSize();
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas.getContext('2d'), state, size.w, size.h);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `neon-coast-cover-${size.w}x${size.h}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return blob;
}

function addPhotoFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        state.photos.push({ name: file.name || 'photo', img, cutout: null });
        ensurePanels();
        renderTray();
        queueRender();
        resolve();
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function loadSamplePhotos() {
  for (const name of SAMPLE_NAMES) {
    if (state.photos.some((p) => p.name === name)) continue;
    const res = await fetch(`samples/${name}`);
    const blob = await res.blob();
    await addPhotoFile(new File([blob], name, { type: blob.type }));
  }
  ensurePanels();
  state.panels.forEach((p, i) => { p.photo = i % Math.max(1, state.photos.length); });
  renderTray();
  queueRender();
}

function renderTray() {
  const tray = $('tray');
  tray.innerHTML = '';
  state.photos.forEach((p, i) => {
    const thumb = document.createElement('button');
    thumb.className = 'thumb';
    thumb.title = `${p.name} — click to put in panel ${selectedPanel + 1}`;
    const img = document.createElement('img');
    img.src = p.img.src;
    img.alt = p.name;
    thumb.appendChild(img);
    thumb.addEventListener('click', () => {
      pushHistory();
      ensurePanels();
      state.panels[selectedPanel].photo = i;
      queueRender();
    });
    tray.appendChild(thumb);
  });
  $('photoCount').textContent = state.photos.length
    ? `${state.photos.length} photo${state.photos.length > 1 ? 's' : ''} loaded`
    : 'No photos yet — add one or load the samples';
  syncPanelInspector();
}

function buildOptionButtons(el, entries, current, onPick) {
  el.innerHTML = '';
  entries.forEach(([id, label, hint]) => {
    const b = document.createElement('button');
    b.className = 'opt' + (id === current ? ' active' : '');
    b.textContent = label;
    if (hint) b.title = hint;
    b.addEventListener('click', () => {
      pushHistory();
      onPick(id);
      buildOptionButtons(el, entries, id, onPick);
      queueRender();
    });
    el.appendChild(b);
  });
}

function setLayout(id) { state.layout = id; ensurePanels(); }
function setGrade(id) { state.grade = id; }
function setSize(id) { state.sizeId = id; }

// The panel inspector: role tag, per-panel grade and the hero cut-out.
function syncPanelInspector() {
  const panel = state.panels[selectedPanel];
  if (!panel) return;
  $('panelLabel').textContent = `Panel ${selectedPanel + 1}${selectedPanel === heroPanelIndex() ? ' · HERO' : ''}`;
  $('roleInput').value = panel.role || '';
  const sel = $('panelGrade');
  sel.innerHTML = '<option value="">Same as cover</option>';
  Object.entries(GRADES).forEach(([id, g]) => {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = g.label;
    sel.appendChild(o);
  });
  sel.value = panel.grade || '';
  $('cutoutToggle').checked = !!state.cutout;
  $('cutoutTolerance').value = state.cutoutTolerance;
  $('cutoutToleranceVal').textContent = state.cutoutTolerance;
  $('cutoutRow').style.display = selectedPanel === heroPanelIndex() ? '' : 'none';
}

function syncControls() {
  $('titleInput').value = state.title;
  $('subtitleInput').value = state.subtitle;
  $('taglineInput').value = state.tagline;
  $('quoteInput').value = state.quote.text;
  $('quoteSourceInput').value = state.quote.source;
  $('volumeInput').value = state.volume;
  $('releaseInput').value = state.release;
  $('sealInput').value = state.seal;
  $('titleSize').value = Math.round(state.titleScale * 100);
  $('titleSizeVal').textContent = `${Math.round(state.titleScale * 100)}%`;
  $('grainToggle').checked = state.grain;
  $('vignetteToggle').checked = state.vignette;
  $('halftoneToggle').checked = state.halftone;
  buildOptionButtons($('layoutBtns'),
    Object.entries(LAYOUTS).map(([id, l]) => [id, l.label, l.hint]), state.layout, setLayout);
  buildOptionButtons($('gradeBtns'),
    Object.entries(GRADES).map(([id, g]) => [id, g.label, '']), state.grade, setGrade);
  buildOptionButtons($('sizeBtns'),
    SIZES.map((s) => [s.id, s.label, '']), state.sizeId, setSize);
  renderTray();
}

// One click re-rolls layout, grade, title, subtitle, tagline, quote, seal
// and the cast roles together.
function surpriseCover() {
  pushHistory();
  const layouts = ['cast7', 'cast5', 'cast6', 'heroLeft', 'cinema', 'strip5'];
  state.layout = pick(layouts);
  state.grade = pick(Object.keys(GRADES));
  state.title = pick(TITLE_POOL);
  state.subtitle = pick(SUBTITLE_POOL);
  state.tagline = pick(TAGLINE_POOL);
  state.quote = pick(QUOTE_POOL);
  state.seal = pick(SEAL_POOL);
  ensurePanels();
  const roles = [...ROLES].sort(() => Math.random() - 0.5);
  state.panels.forEach((p, i) => { p.role = roles[i % roles.length]; });
  syncControls();
  queueRender();
}

async function applyCutout() {
  const hero = heroPanelIndex();
  if (hero < 0 || !state.photos.length) return;
  const photo = state.photos[state.panels[hero]?.photo ?? 0];
  if (!photo) return;
  photo.cutout = segmentCutoutHero(photo.img, state.cutoutTolerance);
  queueRender();
}

function pickPanelAt(clientX, clientY) {
  const rect = preview.getBoundingClientRect();
  const size = currentSize();
  const scale = preview.width / size.w;
  const x = (clientX - rect.left) * (preview.width / rect.width) / scale;
  const y = (clientY - rect.top) * (preview.height / rect.height) / scale;
  const rects = LAYOUTS[state.layout].panels(size.w, size.h, Math.round(Math.min(size.w, size.h) * 0.012));
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
  }
  return -1;
}

function wireDragging() {
  let drag = null;
  preview.addEventListener('pointerdown', (e) => {
    const hit = pickPanelAt(e.clientX, e.clientY);
    if (hit < 0) return;
    if (hit !== selectedPanel) {
      selectedPanel = hit;
      renderTray();
      queueRender();
    }
    preview.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, y: e.clientY, moved: false };
  });
  preview.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const size = currentSize();
    const scale = preview.width / size.w;
    const rect = preview.getBoundingClientRect();
    const pxPerUnit = (preview.width / rect.width) / scale;
    const dx = (e.clientX - drag.x) * pxPerUnit;
    const dy = (e.clientY - drag.y) * pxPerUnit;
    if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
    if (!drag.moved) return;
    const panel = state.panels[selectedPanel];
    const photo = state.photos[panel.photo];
    if (!photo) return;
    const rects = LAYOUTS[state.layout].panels(size.w, size.h, Math.round(Math.min(size.w, size.h) * 0.012));
    const r = rects[selectedPanel];
    const f = fitPhotoCover(photo.img, r, panel);
    if (f.dw > r.w) panel.cx = Math.min(1, Math.max(0, panel.cx - dx / (f.dw - r.w)));
    if (f.dh > r.h) panel.cy = Math.min(1, Math.max(0, panel.cy - dy / (f.dh - r.h)));
    drag.x = e.clientX;
    drag.y = e.clientY;
    queueRender();
  });
  preview.addEventListener('pointerup', () => {
    if (drag && drag.moved) pushHistory();
    drag = null;
  });
  preview.addEventListener('wheel', (e) => {
    e.preventDefault();
    const hit = pickPanelAt(e.clientX, e.clientY);
    if (hit < 0) return;
    if (hit !== selectedPanel) selectedPanel = hit;
    const panel = state.panels[selectedPanel];
    panel.zoom = Math.min(4, Math.max(1, panel.zoom * Math.exp(-e.deltaY * 0.0012)));
    queueRender();
  }, { passive: false });
}

function wireControls() {
  $('fileInput').addEventListener('change', async (e) => {
    for (const file of e.target.files) await addPhotoFile(file);
    e.target.value = '';
  });
  $('samplesBtn').addEventListener('click', async () => {
    $('samplesBtn').disabled = true;
    await loadSamplePhotos();
    $('samplesBtn').disabled = false;
  });
  $('fillAllBtn').addEventListener('click', () => {
    if (!state.photos.length) return;
    pushHistory();
    ensurePanels();
    state.panels.forEach((p) => { p.photo = 0; });
    queueRender();
  });
  $('surpriseBtn').addEventListener('click', surpriseCover);
  $('titleInput').addEventListener('input', (e) => { state.title = e.target.value; queueRender(); });
  $('subtitleInput').addEventListener('input', (e) => { state.subtitle = e.target.value; queueRender(); });
  $('taglineInput').addEventListener('input', (e) => { state.tagline = e.target.value; queueRender(); });
  $('quoteInput').addEventListener('input', (e) => { state.quote.text = e.target.value; queueRender(); });
  $('quoteSourceInput').addEventListener('input', (e) => { state.quote.source = e.target.value; queueRender(); });
  $('volumeInput').addEventListener('input', (e) => { state.volume = e.target.value; queueRender(); });
  $('releaseInput').addEventListener('change', (e) => { pushHistory(); state.release = e.target.value; queueRender(); });
  $('sealInput').addEventListener('change', (e) => { pushHistory(); state.seal = e.target.value; queueRender(); });
  ['titleInput', 'subtitleInput', 'taglineInput', 'quoteInput', 'quoteSourceInput', 'volumeInput']
    .forEach((id) => $(id).addEventListener('change', pushHistory));
  $('roleInput').addEventListener('input', (e) => {
    ensurePanels();
    state.panels[selectedPanel].role = e.target.value.toUpperCase();
    queueRender();
  });
  $('roleInput').addEventListener('change', pushHistory);
  $('panelGrade').addEventListener('change', (e) => {
    pushHistory();
    ensurePanels();
    state.panels[selectedPanel].grade = e.target.value;
    queueRender();
  });
  $('cutoutToggle').addEventListener('change', async (e) => {
    pushHistory();
    state.cutout = e.target.checked;
    if (state.cutout) await applyCutout();
    queueRender();
  });
  $('cutoutTolerance').addEventListener('input', (e) => {
    state.cutoutTolerance = +e.target.value;
    $('cutoutToleranceVal').textContent = e.target.value;
  });
  $('cutoutTolerance').addEventListener('change', async () => {
    if (state.cutout) await applyCutout();
  });
  $('titleSize').addEventListener('input', (e) => {
    state.titleScale = e.target.value / 100;
    $('titleSizeVal').textContent = `${e.target.value}%`;
    queueRender();
  });
  $('titleSize').addEventListener('change', pushHistory);
  $('grainToggle').addEventListener('change', (e) => { pushHistory(); state.grain = e.target.checked; queueRender(); });
  $('vignetteToggle').addEventListener('change', (e) => { pushHistory(); state.vignette = e.target.checked; queueRender(); });
  $('halftoneToggle').addEventListener('change', (e) => { pushHistory(); state.halftone = e.target.checked; queueRender(); });
  $('exportBtn').addEventListener('click', exportCoverPNG);
  $('undoBtn').addEventListener('click', undoState);
  $('redoBtn').addEventListener('click', redoState);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undoState(); }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); redoState(); }
  });
  const drop = $('dropzone');
  ['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', async (e) => {
    for (const file of e.dataTransfer.files) {
      if (file.type.startsWith('image/')) await addPhotoFile(file);
    }
  });
}

// Screenshot scenes: ?shot=cover|wide|square renders a finished cover and
// exports it; ?shot=editor leaves the editor open with photos loaded.
async function handleShotMode() {
  const shot = new URLSearchParams(location.search).get('shot');
  if (!shot) return;
  await document.fonts.ready;
  await loadSamplePhotos();
  if (shot === 'cover') {
    setLayout('cast7'); setGrade('sunset'); setSize('portrait');
    state.title = 'SUNSET RUN'; state.subtitle = 'palm nights on the neon coast';
    state.tagline = 'FIVE FRIENDS · ONE COAST · NO WAY BACK';
    state.quote = { text: 'EVERY FRAME A POSTCARD', source: 'THE PALM JOURNAL' };
    state.seal = 'BEST CAST';
    // the cover shot uses the clean grid: the auto cut-out of the sample
    // photo drags the car door and a palm along with the figure, which
    // reads as clutter at export size. The pop-out stays in the app as a
    // toggle for photos where it is clean.
  } else if (shot === 'wide') {
    setLayout('cast6'); setGrade('neon'); setSize('wide');
    state.title = 'NEON COAST'; state.subtitle = 'drive fast, shine brighter';
    state.tagline = 'ONE SUMMER · NO RULES · ALL HEAT';
    state.quote = { text: 'SUNSET, SERVED LOUD', source: 'COAST WEEKLY' };
    state.seal = 'SEASON ONE';
  } else if (shot === 'square') {
    setLayout('cast5'); setGrade('golden'); setSize('square');
    state.title = 'GOLDEN HOUR'; state.subtitle = 'every sunset is a cover';
    state.tagline = 'THE COAST IS NEVER CLEAR';
    state.quote = { text: 'A LOVE LETTER TO THE GOLDEN HOUR', source: 'THE HARBOR LIGHT' };
    state.seal = '100% ORIGINAL';
  } else if (shot === 'editor') {
    setLayout('cast7'); setGrade('sunset'); setSize('portrait');
    state.title = 'SUNSET RUN'; state.subtitle = 'palm nights on the neon coast';
  }
  ensurePanels();
  state.panels.forEach((p, i) => { p.photo = i % Math.max(1, state.photos.length); });
  // the hero panel always gets a photo with a person in it (boulevard)
  const hero = heroPanelIndex();
  if (hero >= 0) state.panels[hero].photo = 0;
  // the cut-out is computed after the hero photo is assigned
  if (state.cutout) await applyCutout();
  syncControls();
  renderPreview();
  if (shot !== 'editor') {
    await new Promise((r) => setTimeout(r, 300));
    await exportCoverPNG();
  }
  window.__shotDone = true;
}

async function bootEditor() {
  ensurePanels();
  syncControls();
  wireControls();
  wireDragging();
  updateUndoButtons();
  try {
    await document.fonts.load('80px Anton');
    await document.fonts.load('40px Pacifico');
  } catch (e) {
    // fonts fall back to sans-serif; the cover still renders
  }
  renderPreview();
  await handleShotMode();
}

window.__coverApp = { state, exportCoverPNG, loadSamplePhotos, renderPreview, surpriseCover, segmentCutoutHero };
bootEditor();
