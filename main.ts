// Neon Coast Cover Studio — entrypoint for make.fun gta6-cover-art-01.
// Copies app/ and screenshots/ into the output directory and writes
// dossier.json with buildDossier from vendor/makefun-app.ts.
// Runs offline and writes the same bytes on every run: no clocks, no
// random values, files copied in sorted order.
import { copyFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-app.ts";

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
const TEXT_MAX_BYTES = 163840;

async function copyTree(src: string, dst: string): Promise<void> {
  await mkdir(dst, { recursive: true });
  const names = (await readdir(src)).sort();
  for (const name of names) {
    const from = join(src, name);
    const to = join(dst, name);
    const info = await stat(from);
    if (info.isDirectory()) await copyTree(from, to);
    else if (info.isFile()) await copyFile(from, to);
  }
}

async function countFiles(dir: string): Promise<number> {
  let total = 0;
  for (const name of (await readdir(dir)).sort()) {
    const entry = join(dir, name);
    const info = await stat(entry);
    total += info.isDirectory() ? await countFiles(entry) : 1;
  }
  return total;
}

const appDir = join(REPO_ROOT, "app");
const shotsDir = join(REPO_ROOT, "screenshots");
const indexHtml = await readFile(join(appDir, "index.html"));
if (indexHtml.length === 0) throw new Error("app/index.html is empty");
const shotNames = (await readdir(shotsDir)).sort().filter((name) => !name.startsWith("."));
if (shotNames.length < 3 || shotNames.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shotNames.length}`);
}
await copyTree(appDir, join(OUTPUT_DIR, "app"));
await copyTree(shotsDir, join(OUTPUT_DIR, "screenshots"));
const dossier = await buildDossier(REPO_ROOT, { text_max_bytes: TEXT_MAX_BYTES });
await writeFile(join(OUTPUT_DIR, "dossier.json"), dossier);
const appFiles = await countFiles(join(OUTPUT_DIR, "app"));
console.log(`neon-coast: app files=${appFiles} screenshots=${shotNames.length} dossier bytes=${dossier.length}`);
