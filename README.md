# Neon Coast Cover Studio — GTA 6-style cast poster maker

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/innalillahi/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/innalillahi/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Turn your own photo and a caption into a GTA 6-style cast poster, exported
as a PNG to share. Open `app/index.html` in desktop Chrome; everything runs
offline and no photo ever leaves your machine.

## What it does

- **Ten collages** (Marquee 7, Palm 5, Split Hero 5, Tilted 5, Duo 6,
  Strip 6, Grid 6, Column 7, Triptych 6, Sunset 8), each with one big hero
  close-up the title overlaps.
- **Pop-Out Hero**: the hero bursts over the title, with an on-device
  background cut-out (flood-fill from the photo's border) so the cast member
  breaks out of the frame.
- **The winning look**: giant striped retro-chrome title (Anton, sunset
  gradient with horizontal bands, thick dark outline), neon pink script
  subtitle (Pacifico), a role tag on every panel, five gold stars with an
  invented press quote, VOL. 1 chip, gold seal, tagline chip, full billing
  block and barcode.
- **Twelve sunset grades** across the whole poster, plus a per-panel grade,
  grain, halftone and vignette toggles.
- **Auto cast-tags** and one-click **Surprise me** (re-rolls layout, grade,
  title, tagline and quote together).
- **Fast**: pick a sample or drop in your own photo, drag inside a panel to
  reframe, export PNG in 1:1 (1080×1080), 4:5 (1080×1350) and 16:9
  (1920×1080) — one click exports all three.

## Run it

```sh
# try it in a browser (any static server; e.g. Python)
python3 -m http.server 8080 --directory app
# then open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
node ../makefun-kit/gta6-cover-art-01-kit/cli/makefun.mjs check --kit ../makefun-kit/gta6-cover-art-01-kit --repo .
```

`main.ts` copies `app/` and `screenshots/` to the output directory and
writes `dossier.json` with `buildDossier` from `vendor/makefun-app.ts`
(the kit's library, unchanged).

## Originality

No Rockstar logo, wordmark, artwork, character or font is used. Anton and
Pacifico are licensed under the SIL Open Font License (see
`app/fonts/OFL.txt`). Sample photos are original or free to use.

## License

MIT — see `LICENSE`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=wcgbp5n6&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
