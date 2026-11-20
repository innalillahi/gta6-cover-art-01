// Neon Coast Cover Studio: hand-in for make.fun gta6-cover-art-01 (Node 22,
// standard library only). The entry is this repo's app/ folder: a static
// offline web app (app/index.html plus its ES modules, fonts and sample
// photos — every asset is a file under app/ or a data: URI, no network
// request at runtime). This program copies app/ and screenshots/ from
// beside this file into /output (or $MAKEFUN_OUTPUT_DIR outside the
// grader) and writes /output/dossier.json, the summary the judge reads,
// using the vendored make.fun library.
//
// Try it locally first: serve app/ with any static server, e.g.
// `python3 -m http.server 8123 --directory app`, then open
// http://localhost:8123 in desktop Chrome.
// Hand it in locally with: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// Repo root = the directory holding this file; output goes to /output in
// the grader, or $MAKEFUN_OUTPUT_DIR when run by hand.
const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the dossier bytes; the other limits refuse an entry the scorer would
// refuse (more than 4 screenshots or one over 256 KiB; more than 993
// files in app/ or 48 MiB of app files in all, or a path under app/ over
// 1000 bytes; app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

console.log(`hand-in written to ${out}`);
