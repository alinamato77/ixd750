'use strict';

// Spline owns pointer tracking and interaction. The viewport-sized viewer
// receives global events while the page underneath retains normal hit testing.
(() => {
  const layer = document.getElementById('avatar-layer');
  const toggle = document.getElementById('clerk-toggle');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let preference = null;
  try { preference = sessionStorage.getItem('both-sides-hide-clerk'); } catch {}
  let shown = preference === null ? !motion.matches : preference !== 'yes';
  let viewer;

  function display() {
    layer.hidden = !shown;
    toggle.textContent = shown ? 'Hide avatar' : 'Show avatar';
    if (!shown) {
      viewer?.remove();
      viewer = null;
      return;
    }
    if (viewer) return;
    viewer = document.createElement('spline-viewer');
    viewer.setAttribute('url', 'https://prod.spline.design/1WPMwYarjzm8SXqb/scene.splinecode');
    viewer.setAttribute('events-target', 'global');
    viewer.setAttribute('background', 'rgba(0,0,0,0)');
    viewer.setAttribute('loading', 'eager');
    viewer.addEventListener('load-complete', event => {
      const app = event.currentTarget._spline;
      // Remove the static backdrop so that the form stays visible.
      const floor = app?.findObjectByName('Floor');
      if (floor) floor.visible = false;
      app?.setZoom?.(0.45);
    }, {once:true});
    layer.append(viewer);
    import('https://cdn.spline.design/@splinetool/viewer@2.0.159/build/spline-viewer.js').catch(() => {
      if (viewer && !customElements.get('spline-viewer')) {
        viewer.remove(); viewer = null; shown = false; display();
      }
    });
  }
  toggle.addEventListener('click', () => {
    shown = !shown;
    preference = shown ? 'no' : 'yes';
    try { sessionStorage.setItem('both-sides-hide-clerk', preference); } catch {}
    display();
  });
  motion.addEventListener('change', () => {
    if (preference === null) { shown = !motion.matches; display(); }
  });
  display();
})();
