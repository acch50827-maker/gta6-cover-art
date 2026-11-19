// Hands in the Cover Studio entry (Node 22, standard library only): the app
// is this directory's app/ folder, plain static files a desktop browser loads
// offline (app/index.html and its ES modules, the Anton font and two sample
// photos under app/, no library and no network request). The program copies
// app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored
// make.fun library. Outside the grader's container, MAKEFUN_OUTPUT_DIR
// stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

/** The directory this file lives in: the repository root. */
function repoRoot() {
  return fileURLToPath(new URL('.', import.meta.url));
}

/** Where the entry is written: /output in the grader, MAKEFUN_OUTPUT_DIR out here. */
function pickOutputDir() {
  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(dir, { recursive: true });
  return dir;
}

function bootLog(out) {
  console.log(`cover-studio: writing the entry to ${out}`);
}

/** The app's entrypoint must exist before anything is handed in. */
function requireAppEntrypoint(root) {
  const entry = join(root, 'app', 'index.html');
  if (!existsSync(entry)) throw new Error(`missing app entrypoint: ${entry}`);
  return entry;
}

/** Counts files under a directory, recursively, for the build log. */
function countFiles(dir) {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    total += statSync(path).isDirectory() ? countFiles(path) : 1;
  }
  return total;
}

/** Copies one directory tree onto another, creating the target first. */
function copyFolder(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

const root = repoRoot();
const out = pickOutputDir();
bootLog(out);
requireAppEntrypoint(root);
copyFolder(join(root, 'app'), join(out, 'app'));
console.log(`cover-studio: copied ${countFiles(join(out, 'app'))} app files`);
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(root, 'screenshots'))) {
  copyFolder(join(root, 'screenshots'), join(out, 'screenshots'));
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the others
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files in app/ or 48 MiB of app files, in all,
// or a path under app/ over 1000 bytes: app/ counts beside /output's own
// 1000-entry cap, its screenshots/ and dossier.json).
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
console.log('cover-studio: wrote dossier.json');
