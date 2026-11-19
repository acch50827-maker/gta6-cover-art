# Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/acch50827-maker/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/acch50827-maker/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Cover Studio turns your photos and a caption into multi-panel poster cover art in the style of GTA 6's posters — slanted photo panels, a sunset neon grade and bold condensed lettering — and exports it as a PNG to share. Everything runs offline in a desktop browser: your photos are read on your own machine and never uploaded.

## What it does

- **Any photo**: load up to three of your own photos (or the two included samples), crop and position each one per panel with zoom and pan sliders.
- **Three panels, three layouts**: Vice trio (hero + two stacked), Sunset strip (three slanted columns) and Neon grid (2×2).
- **Caption**: bold Anton lettering with outline and neon shadow, plus a sub-caption, in your words.
- **Grade**: sunset strength, neon gutter glow and film grain sliders.
- **Fast**: a few steps from photo to PNG in the common post sizes — 1080 × 1080, 1080 × 1350 and 1920 × 1080.

The caption font is Anton, shipped under `app/fonts/` under the SIL Open Font License (`app/fonts/OFL.txt`). The two sample photos (`app/samples/boulevard.jpg`, `app/samples/pier.jpg`) were made with an image model for make.fun and are free to use. No Rockstar Games logo, artwork, character or font is used anywhere.

## Run it

Serve `app/` with any static file server, then open it in a desktop browser:

```sh
python3 -m http.server --directory app 8080
# open http://localhost:8080
```

Or with Node:

```sh
npx -y serve app
```

Pick a photo (or a sample), choose a layout, write the caption, pick a size and press **Export PNG**.

---

<sub>Entered on [make.fun](https://make.fun/?ref=xzdd07z5&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · [GTA 6 Cover Art bounty](https://make.fun/bounty/gta6-cover-art-01)</sub>
