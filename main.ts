/* Neon Coast Cover Studio — entrypoint.
 * Hands the entry in: copies app/ and screenshots/ from this repository
 * into the output directory and writes dossier.json with buildDossier
 * from the kit's library (vendor/makefun-app.ts, unchanged).
 * Runs on Node 22 with no install: `node main.ts`.
 * Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output. */

import { buildDossier } from './vendor/makefun-app.ts';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(outDir, { recursive: true });
for (const name of ['app', 'screenshots']) {
  const dest = join(outDir, name);
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  cpSync(join(repoRoot, name), dest, { recursive: true });
}
if (existsSync(join(outDir, 'dossier.json'))) rmSync(join(outDir, 'dossier.json'));

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`neon-coast-cover-studio: wrote ${outDir} (${dossier.length} byte dossier)`);
