/* Neon Coast Cover Studio — editor.
 * Owns the state, the sidebar controls and the live preview; every pixel
 * comes from renderCover in cover.js. Photos are read on this machine and
 * never uploaded. */

import { renderCover, LAYOUTS, GRADES, ROLES, TITLE_COMBOS, POSTER_SIZES, cutoutMask } from './cover.js';

const SAMPLES = [
  { src: 'samples/man-rooftop.jpg', name: 'Rooftop' },
  { src: 'samples/man-pier.jpg', name: 'Pier' },
  { src: 'samples/woman-convertible.jpg', name: 'Convertible' },
  { src: 'samples/friends-neon.jpg', name: 'Neon Night' },
  { src: 'samples/boulevard.jpg', name: 'Boulevard' },
  { src: 'samples/pier.jpg', name: 'Boardwalk' },
];

const DEFAULT_ROLES = ['THE BOSS', 'THE CAPTAIN', 'THE QUEEN', 'THE LOOKOUT', 'THE WILDCARD', 'THE STRIP', 'THE PIER', 'THE DRIVER'];
const DEFAULT_PHOTOS = ['samples/man-rooftop.jpg', 'samples/man-pier.jpg', 'samples/woman-convertible.jpg', 'samples/friends-neon.jpg', 'samples/boulevard.jpg', 'samples/pier.jpg', 'samples/man-rooftop.jpg', 'samples/man-pier.jpg'];

const state = {
  layout: 0,
  grade: 0,
  ratio: '16:9',
  popout: true,
  title: 'NEON COAST',
  subtitle: 'Kings of the Causeway',
  tagline: 'SEVEN SINNERS · ONE COAST · ZERO REGRETS',
  quote: 'A SUN-BLEACHED JOYRIDE WITH TEETH',
  source: 'THE MANGROVE TIMES',
  seal: 'SEASON ONE',
  volume: 'VOL. 1',
  release: 'COMING SOON',
  billing1: 'A NEON COAST PICTURE  ·  STARRING YOU AND YOUR CREW  ·  SHOT ON YOUR OWN PHONE',
  billing2: 'GRADED AT SUNSET  ·  LETTERED BY HAND  ·  NO PHOTO EVER LEAVES YOUR DEVICE',
  photos: [],
  selected: 2,
};

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const sctx = stage.getContext('2d');
let userPhotos = [];
let renderQueued = false;

function blankPhoto(src, i) {
  return {
    src, img: null, name: src.split('/').pop(),
    fx: 0.5, fy: 0.35, zoom: 1,
    role: DEFAULT_ROLES[i % DEFAULT_ROLES.length],
    grade: null, grain: false, halftone: false, vignette: true, cutout: false,
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function fillPhotos() {
  const n = LAYOUTS[state.layout].panels.length;
  while (state.photos.length < n) {
    const i = state.photos.length;
    const p = blankPhoto(DEFAULT_PHOTOS[i % DEFAULT_PHOTOS.length], i);
    state.photos.push(p);
  }
  state.photos.length = n;
  // The hero pops out with its background cut away.
  const heroIdx = LAYOUTS[state.layout].panels.findIndex((p) => p.hero);
  state.photos.forEach((p, i) => { p.cutout = (i === heroIdx); });
  for (const p of state.photos) {
    if (!p.img) {
      try { p.img = await loadImage(p.src); } catch (e) { /* missing sample: panel stays gradient */ }
    }
  }
}

function queueRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => { renderQueued = false; renderPreview(); });
}

function renderPreview() {
  const size = POSTER_SIZES[state.ratio];
  const longSide = 940;
  const scale = longSide / Math.max(size.w, size.h);
  stage.width = Math.round(size.w * scale);
  stage.height = Math.round(size.h * scale);
  renderCover(sctx, stage.width, stage.height, state);
  syncPanelDots();
}

function syncPanelDots() {
  const dots = $('panelDots');
  const n = LAYOUTS[state.layout].panels.length;
  dots.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const b = document.createElement('button');
    b.className = 'dot' + (i === state.selected ? ' on' : '');
    b.textContent = String(i + 1);
    b.title = 'Panel ' + (i + 1);
    b.onclick = () => { state.selected = i; syncPanelSection(); queueRender(); };
    dots.appendChild(b);
  }
}

/* ---- sidebar builders -------------------------------------------------- */

function buildSamples() {
  const grid = $('sampleGrid');
  grid.innerHTML = '';
  const all = [...SAMPLES, ...userPhotos];
  all.forEach((smp) => {
    const card = document.createElement('button');
    card.className = 'sample';
    card.innerHTML = `<img src="${smp.src}" alt=""><span>${smp.name}</span>`;
    card.onclick = () => assignPhoto(smp.src, smp.name);
    grid.appendChild(card);
  });
}

function assignPhoto(src, name) {
  const p = state.photos[state.selected];
  if (!p) return;
  p.src = src;
  p.name = name || src.split('/').pop();
  p.img = null;
  p.fx = 0.5; p.fy = 0.35; p.zoom = 1;
  loadImage(src).then((img) => { p.img = img; queueRender(); }).catch(() => queueRender());
  setStatus(`Panel ${state.selected + 1} ← ${p.name}. Drag the photo on the stage to reframe it.`);
  queueRender();
}

function buildLayouts() {
  const grid = $('layoutGrid');
  grid.innerHTML = '';
  LAYOUTS.forEach((lay, li) => {
    const b = document.createElement('button');
    b.className = 'layout' + (li === state.layout ? ' on' : '');
    let cells = '';
    lay.panels.forEach((p) => {
      cells += `<i style="left:${p.x * 100}%;top:${p.y * 100}%;width:${p.w * 100}%;height:${p.h * 100}%" class="${p.hero ? 'hero' : ''}"></i>`;
    });
    b.innerHTML = `<span class="mini">${cells}</span><em>${lay.name}</em>`;
    b.onclick = async () => {
      state.layout = li;
      state.selected = Math.min(state.selected, lay.panels.length - 1);
      await fillPhotos();
      buildLayouts();
      syncPanelSection();
      queueRender();
    };
    grid.appendChild(b);
  });
}

function buildGrades() {
  const grid = $('gradeGrid');
  grid.innerHTML = '';
  GRADES.forEach((g, gi) => {
    const b = document.createElement('button');
    b.className = 'grade' + (gi === state.grade ? ' on' : '');
    b.innerHTML = `<i style="background:linear-gradient(135deg,#ffd166,${g.tint},#7b2fff)"></i><em>${g.name}</em>`;
    b.title = g.name;
    b.onclick = () => { state.grade = gi; buildGrades(); queueRender(); };
    grid.appendChild(b);
  });
}

function buildWords() {
  const fields = [
    ['title', 'Title', 'NEON COAST'],
    ['subtitle', 'Script subtitle', 'Kings of the Causeway'],
    ['tagline', 'Tagline chip', 'SEVEN SINNERS · ONE COAST · ZERO REGRETS'],
    ['quote', 'Press quote', 'A SUN-BLEACHED JOYRIDE WITH TEETH'],
    ['source', 'Quote source', 'THE MANGROVE TIMES'],
    ['seal', 'Gold seal', 'SEASON ONE'],
    ['volume', 'Volume chip', 'VOL. 1'],
    ['release', 'Release line', 'COMING SOON'],
    ['billing1', 'Billing line 1', 'A NEON COAST PICTURE · STARRING YOU AND YOUR CREW'],
    ['billing2', 'Billing line 2', 'GRADED AT SUNSET · LETTERED BY HAND'],
  ];
  const wrap = $('wordFields');
  wrap.innerHTML = '';
  fields.forEach(([key, label, ph]) => {
    const lab = document.createElement('label');
    lab.innerHTML = `<span>${label}</span>`;
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = state[key];
    inp.placeholder = ph;
    inp.oninput = () => { state[key] = inp.value; queueRender(); };
    lab.appendChild(inp);
    wrap.appendChild(lab);
  });
}

function syncPanelSection() {
  const p = state.photos[state.selected];
  const hero = LAYOUTS[state.layout].panels[state.selected]?.hero;
  $('panelTitle').textContent = `Panel ${state.selected + 1}${hero ? ' — HERO' : ''}`;
  $('panelPhotoName').textContent = p ? (p.name || 'empty panel') : '—';
  const roleSel = $('roleSel');
  roleSel.innerHTML = '';
  ROLES.forEach((r) => {
    const o = document.createElement('option');
    o.value = r; o.textContent = r;
    if (p && p.role === r) o.selected = true;
    roleSel.appendChild(o);
  });
  $('zoomRange').value = p ? p.zoom : 1;
  $('focusX').value = p ? p.fx : 0.5;
  $('focusY').value = p ? p.fy : 0.35;
  const pg = $('panelGrade');
  pg.innerHTML = '<option value="">— whole poster grade —</option>';
  GRADES.forEach((g, gi) => {
    const o = document.createElement('option');
    o.value = String(gi); o.textContent = g.name;
    if (p && p.grade === gi) o.selected = true;
    pg.appendChild(o);
  });
  $('fxGrain').checked = !!(p && p.grain);
  $('fxHalftone').checked = !!(p && p.halftone);
  $('fxVignette').checked = !!(p && p.vignette);
  $('fxCutout').checked = !!(p && p.cutout);
  $('popoutToggle').checked = state.popout;
  $('popoutRow').style.display = hero ? '' : 'none';
}

/* ---- export ------------------------------------------------------------- */

function exportCover(ratio, silent) {
  const size = POSTER_SIZES[ratio];
  const c = document.createElement('canvas');
  c.width = size.w; c.height = size.h;
  renderCover(c.getContext('2d'), size.w, size.h, state);
  return new Promise((resolve) => {
    c.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `neon-coast-cover-${ratio.replace(':', 'x')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      if (!silent) setStatus(`Exported neon-coast-cover-${ratio.replace(':', 'x')}.png — ${size.w} × ${size.h}.`);
      resolve(true);
    }, 'image/png');
  });
}

async function exportAll() {
  for (const ratio of ['1:1', '4:5', '16:9']) {
    await exportCover(ratio, true);
    await new Promise((r) => setTimeout(r, 350));
  }
  setStatus('Exported all 3 sizes — 1:1, 4:5 and 16:9 PNGs.');
}

function surpriseMe() {
  const combo = TITLE_COMBOS[Math.floor(Math.random() * TITLE_COMBOS.length)];
  Object.assign(state, {
    title: combo.title, subtitle: combo.sub, tagline: combo.tag,
    quote: combo.quote, source: combo.source,
  });
  state.layout = Math.floor(Math.random() * LAYOUTS.length);
  state.grade = Math.floor(Math.random() * GRADES.length);
  state.selected = Math.min(state.selected, LAYOUTS[state.layout].panels.length - 1);
  // Fresh cast tags: a shuffled deck, no repeats.
  const deck = [...ROLES].sort(() => Math.random() - 0.5);
  state.photos.forEach((p, i) => { p.role = deck[i % deck.length]; });
  fillPhotos().then(() => {
    buildLayouts(); buildGrades(); buildWords(); syncPanelSection(); queueRender();
    setStatus(`Surprise me: “${combo.title}” — ${LAYOUTS[state.layout].name}, ${GRADES[state.grade].name} grade.`);
  });
}

function setStatus(msg) { $('status').textContent = msg; }

/* ---- stage interaction: click a panel, drag its photo ------------------- */

function panelAt(mx, my) {
  const rect = stage.getBoundingClientRect();
  const x = (mx - rect.left) / rect.width, y = (my - rect.top) / rect.height;
  const size = POSTER_SIZES[state.ratio];
  const topH = 0.052, botH = 0.088;
  const body = { x: 0.012, y: topH + 0.006, w: 0.976, h: 1 - topH - botH - 0.012 };
  const panels = LAYOUTS[state.layout].panels;
  for (let i = panels.length - 1; i >= 0; i--) {
    const p = panels[i];
    const rx = body.x + p.x * body.w, ry = body.y + p.y * body.h;
    if (x >= rx && x <= rx + p.w * body.w && y >= ry && y <= ry + p.h * body.h) return i;
  }
  return -1;
}

function bindStage() {
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    const i = panelAt(e.clientX, e.clientY);
    if (i < 0) return;
    state.selected = i;
    syncPanelSection();
    queueRender();
    const p = state.photos[i];
    if (p && p.img) drag = { i, x: e.clientX, y: e.clientY, fx: p.fx, fy: p.fy };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = state.photos[drag.i];
    const rect = stage.getBoundingClientRect();
    const dx = (e.clientX - drag.x) / rect.width;
    const dy = (e.clientY - drag.y) / rect.height;
    p.fx = Math.max(0, Math.min(1, drag.fx - dx * 0.9));
    p.fy = Math.max(0, Math.min(1, drag.fy - dy * 0.9));
    $('focusX').value = p.fx;
    $('focusY').value = p.fy;
    queueRender();
  });
  stage.addEventListener('pointerup', () => { drag = null; });
}

/* Screenshot mode (for the maker's own screenshots): ?shot=cover (16:9),
 * ?shot=square (1:1) or ?shot=portrait (4:5) shows the exported PNG
 * full-screen; ?shot=editor is just the normal editor. Returns true when
 * it took over the page. */
async function shotMode() {
  const q = new URLSearchParams(location.search);
  const shot = q.get('shot');
  if (!shot || shot === 'editor') return false;
  document.body.classList.add('shot');
  try {
    await Promise.all([
      document.fonts.load('16px "Anton"'),
      document.fonts.load('16px "Pacifico"'),
    ]);
  } catch (e) { /* fonts fall back to system faces */ }
  await document.fonts.ready;
  await fillPhotos();
  const ratio = shot === 'square' ? '1:1' : shot === 'portrait' ? '4:5' : '16:9';
  const size = POSTER_SIZES[ratio];
  const c = document.createElement('canvas');
  c.width = size.w; c.height = size.h;
  renderCover(c.getContext('2d'), size.w, size.h, state);
  const img = document.createElement('img');
  img.id = 'shotImg';
  img.src = c.toDataURL('image/png');
  img.style.cssText = 'width:100vw;height:100vh;object-fit:contain;background:#170a2b;display:block';
  document.body.innerHTML = '';
  document.body.appendChild(img);
  window.__shotReady = true;
  return true;
}

/* ---- boot --------------------------------------------------------------- */

async function boot() {
  if (await shotMode()) return;
  try {
    await Promise.all([
      document.fonts.load('16px "Anton"'),
      document.fonts.load('16px "Pacifico"'),
    ]);
  } catch (e) { /* fonts fall back to system faces */ }
  await fillPhotos();
  buildSamples();
  buildLayouts();
  buildGrades();
  buildWords();
  syncPanelSection();
  bindStage();
  queueRender();

  $('surpriseBtn').onclick = surpriseMe;
  $('exportBtn').onclick = () => exportCover(state.ratio);
  $('exportAllBtn').onclick = exportAll;
  $('addPhotos').onclick = () => $('fileInput').click();
  $('fileInput').onchange = async (e) => {
    for (const f of e.target.files) {
      if (!f.type.startsWith('image/')) continue;
      const url = URL.createObjectURL(f);
      const name = f.name.replace(/\.[^.]+$/, '');
      userPhotos.push({ src: url, name });
      try { await loadImage(url); } catch (err) { /* ignore bad files */ }
    }
    buildSamples();
    setStatus(`${userPhotos.length} of your photos added. Tap one to fill the selected panel.`);
    e.target.value = '';
  };
  document.querySelectorAll('.sizeBtn').forEach((b) => {
    b.onclick = () => {
      state.ratio = b.dataset.ratio;
      document.querySelectorAll('.sizeBtn').forEach((x) => x.classList.toggle('on', x === b));
      queueRender();
    };
  });
  $('autoTagsBtn').onclick = () => {
    const deck = [...ROLES].sort(() => Math.random() - 0.5);
    state.photos.forEach((p, i) => { p.role = deck[i % deck.length]; });
    syncPanelSection();
    queueRender();
    setStatus('Cast tags re-rolled — every panel has its own role.');
  };
  $('roleSel').onchange = (e) => { state.photos[state.selected].role = e.target.value; queueRender(); };
  $('zoomRange').oninput = (e) => { state.photos[state.selected].zoom = parseFloat(e.target.value); queueRender(); };
  $('focusX').oninput = (e) => { state.photos[state.selected].fx = parseFloat(e.target.value); queueRender(); };
  $('focusY').oninput = (e) => { state.photos[state.selected].fy = parseFloat(e.target.value); queueRender(); };
  $('panelGrade').onchange = (e) => {
    state.photos[state.selected].grade = e.target.value === '' ? null : parseInt(e.target.value, 10);
    queueRender();
  };
  $('fxGrain').onchange = (e) => { state.photos[state.selected].grain = e.target.checked; queueRender(); };
  $('fxHalftone').onchange = (e) => { state.photos[state.selected].halftone = e.target.checked; queueRender(); };
  $('fxVignette').onchange = (e) => { state.photos[state.selected].vignette = e.target.checked; queueRender(); };
  $('fxCutout').onchange = (e) => { state.photos[state.selected].cutout = e.target.checked; queueRender(); };
  $('popoutToggle').onchange = (e) => { state.popout = e.target.checked; queueRender(); };

  setStatus('Ready. Pick a sample or drop in your own photo.');
}

boot();
