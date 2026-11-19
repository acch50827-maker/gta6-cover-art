// Fixed scenes for screenshots: ?shot=editor shows the page with a sample
// photo loaded; ?shot=cover shows the cover alone, at its export size.
// `photo` picks the sample (samples/<photo>.jpg), `caption` and `subcaption`
// the words, `size` the export size and `layout` the panel layout.
// window.__shotReady is set once the scene is painted.
import { loadImage } from './main.js';

export async function runShot(shot, query, app) {
  const { state, setPhoto, redraw, refreshPhotoLabels } = app;
  const photoName = query.get('photo') ?? 'pier';
  const caption = query.get('caption') ?? 'Sunset Heist';
  const subcaption = query.get('subcaption') ?? 'Boulevard Queen';
  const size = query.get('size') ?? 'wide';
  const layout = query.get('layout') ?? 'trio';

  if (shot === 'cover') document.body.classList.add('shot-cover');
  state.size = size;
  state.layout = layout;
  state.caption = caption;
  state.subcaption = subcaption;
  state.fillOne = query.get('fill') !== '0';
  if (query.get('fill') === '0') {
    document.getElementById('fillOne').checked = false;
    document.getElementById('panelControls').classList.remove('hidden');
  }
  document.getElementById('caption').value = caption;
  document.getElementById('subcaption').value = subcaption;
  const image = await loadImage(`samples/${photoName}.jpg`);
  await setPhoto(0, image);
  if (query.get('photo2')) {
    await setPhoto(1, await loadImage(`samples/${query.get('photo2')}.jpg`));
    state.panelPhoto[1] = 1;
    if (query.get('photo3')) {
      await setPhoto(2, await loadImage(`samples/${query.get('photo3')}.jpg`));
      state.panelPhoto[2] = 2;
    }
  }
  refreshPhotoLabels();
  redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
