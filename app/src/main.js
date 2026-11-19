// Wires the Cover Studio page: pick photos, arrange the panels, write the
// caption and export the cover as a PNG. A `?shot=` query sets up a fixed
// scene for a screenshot instead (./shots.js).
import { drawCover, defaultState, SIZES, LAYOUTS } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('preview');
const status = document.getElementById('status');
const state = defaultState();

/** Loads an image from a URL, resolving to the image once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

function redraw() {
  drawCover(canvas, state);
  const { w, h } = SIZES[state.size];
  document.getElementById('sizeLabel').textContent = `${w} x ${h}`;
}

function setStatus(text) {
  status.textContent = text;
}

/** Applies a photo to a slot and repaints. */
export async function setPhoto(slot, image) {
  state.photos[slot] = image;
  redraw();
}

function photoName(slot) {
  return state.photos[slot] ? `Photo ${slot + 1} loaded` : `Photo ${slot + 1} empty`;
}

function refreshPhotoLabels() {
  for (let i = 0; i < 3; i++) {
    document.getElementById(`slotLabel${i + 1}`).textContent = photoName(i);
  }
}

async function loadSample(slot, name) {
  try {
    const image = await loadImage(`samples/${name}.jpg`);
    await setPhoto(slot, image);
    refreshPhotoLabels();
    setStatus(`Loaded sample ${name}.jpg into photo ${slot + 1}.`);
  } catch {
    setStatus(`Could not load sample ${name}.jpg.`);
  }
}

function bindControls() {
  for (let i = 0; i < 3; i++) {
    document.getElementById(`photo${i + 1}`).addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const image = await loadImage(URL.createObjectURL(file));
        await setPhoto(i, image);
        refreshPhotoLabels();
        setStatus(`Loaded ${file.name} into photo ${i + 1}.`);
      } catch {
        setStatus(`Could not read ${file.name}.`);
      }
    });
    document.getElementById(`sample${i + 1}`).addEventListener('click', () => {
      loadSample(i, i === 2 ? 'pier' : 'boulevard');
    });
  }

  const panelSelect = document.getElementById('panel');
  panelSelect.addEventListener('change', () => {
    state.activePanel = Number(panelSelect.value);
    syncPanelControls();
  });
  document.getElementById('panelPhoto').addEventListener('change', (e) => {
    state.panelPhoto[state.activePanel] = Number(e.target.value);
    redraw();
  });
  document.getElementById('zoom').addEventListener('input', (e) => {
    state.crop[state.activePanel].zoom = Number(e.target.value);
    redraw();
  });
  document.getElementById('panX').addEventListener('input', (e) => {
    state.crop[state.activePanel].x = Number(e.target.value);
    redraw();
  });
  document.getElementById('panY').addEventListener('input', (e) => {
    state.crop[state.activePanel].y = Number(e.target.value);
    redraw();
  });

  document.getElementById('fillOne').addEventListener('change', (e) => {
    state.fillOne = e.target.checked;
    document.getElementById('panelControls').classList.toggle('hidden', state.fillOne);
    redraw();
  });

  document.querySelectorAll('input[name="layout"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      state.layout = radio.value;
      redraw();
    });
  });
  document.querySelectorAll('input[name="size"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      state.size = radio.value;
      redraw();
    });
  });

  document.getElementById('caption').addEventListener('input', (e) => {
    state.caption = e.target.value;
    redraw();
  });
  document.getElementById('subcaption').addEventListener('input', (e) => {
    state.subcaption = e.target.value;
    redraw();
  });
  document.getElementById('captionScale').addEventListener('input', (e) => {
    state.captionScale = Number(e.target.value);
    redraw();
  });
  document.getElementById('sunset').addEventListener('input', (e) => {
    state.sunset = Number(e.target.value);
    redraw();
  });
  document.getElementById('neon').addEventListener('change', (e) => {
    state.neon = e.target.checked;
    redraw();
  });
  document.getElementById('grain').addEventListener('change', (e) => {
    state.grain = e.target.checked;
    redraw();
  });

  document.getElementById('export').addEventListener('click', () => {
    const { w, h } = SIZES[state.size];
    canvas.toBlob((blob) => {
      if (!blob) {
        setStatus('Export failed.');
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `cover-${w}x${h}.png`;
      a.click();
      setStatus(`Saved cover-${w}x${h}.png`);
    }, 'image/png');
  });
}

function syncPanelControls() {
  const i = state.activePanel;
  document.getElementById('panelPhoto').value = String(state.panelPhoto[i]);
  document.getElementById('zoom').value = String(state.crop[i].zoom);
  document.getElementById('panX').value = String(state.crop[i].x);
  document.getElementById('panY').value = String(state.crop[i].y);
}

async function loadCaptionFont() {
  try {
    const face = new FontFace('Anton', 'url(fonts/Anton-Regular.ttf)');
    await face.load();
    document.fonts.add(face);
  } catch {
    // Falls back to sans-serif lettering; the cover still draws.
  }
}

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
bindControls();
syncPanelControls();
refreshPhotoLabels();
document.getElementById('panelControls').classList.add('hidden');
await loadCaptionFont();
if (shot) {
  await runShot(shot, params, { state, setPhoto, redraw, refreshPhotoLabels, setStatus });
} else {
  redraw();
}
