'use client';

import { useEffect } from 'react';

// Momo Court — the app logic lives in /public/app.js (portraits.js before it).
// The Next.js page renders the shell; after mount it loads the two classic
// scripts in order, so the original court flow, portraits and Spline clerk
// all run unchanged inside Next.js.
export default function MomoCourt() {
  useEffect(() => {
    if (window.__momoCourtBooted) return;
    window.__momoCourtBooted = true;
    const load = (src) => new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = fail;
      document.body.appendChild(s);
    });
    load('/portraits.js')
      .then(() => load('/app.js'))
      .catch(() => { window.__momoCourtBooted = false; });
  }, []);

  return (
    <>
      <div className="shell">
        <header>
          <div className="wordmark"><span className="mark" aria-hidden="true"></span>Momo Court <span className="court-tag">AI Court</span></div>
        </header>
        <main>
          <div className="hero">
            <h1 id="title" tabIndex={-1}></h1>
            <div id="avatar-slot" className="avatar" aria-hidden="true"></div>
          </div>
          <div id="app"></div>
        </main>
        <footer className="foot">
          <span>Sealed to this tab · advisory rulings only</span>
          <span>A / B</span>
        </footer>
        <span className="sr" role="status" id="live"></span>
      </div>

      <div id="roamer" role="img" aria-label="Court clerk avatar: a round glossy character with a two-dot face">
        <div className="roamer-body">
          <span className="orb-poster" aria-hidden="true"></span>
          <img className="wig" src="/judge-wig.png" alt="" aria-hidden="true" width="360" height="432" />
          <spline-viewer url="https://prod.spline.design/1WPMwYarjzm8SXqb/scene.splinecode" background="rgba(0,0,0,0)" loading="eager"></spline-viewer>
        </div>
        <span id="avatar-message" aria-hidden="true"></span>
      </div>

      <dialog id="portrait-dialog" aria-labelledby="portrait-title">
        <div className="portrait-heading"><h2 id="portrait-title">Choose a portrait</h2><button type="button" data-dismiss aria-label="Cancel portrait changes">×</button></div>
        <div className="portrait-scroll">
          <div className="portrait-grid" role="group" aria-label="Portrait shapes"></div>
          <label className="tone-label" htmlFor="portrait-tone">Color</label>
          <input id="portrait-tone" type="range" min="0" max="100" step="1" defaultValue="45" />
          <div className="temperature-ends"><span>Cool</span><span>Warm</span></div>
          <div className="color-presets" role="group" aria-label="Gradient suggestions"></div>
        </div>
        <div className="portrait-footer"><div className="portrait-preview" aria-hidden="true"></div><div><strong>Preview</strong><div className="preview-name"></div></div><button type="button" className="primary" data-apply>Use portrait</button></div>
      </dialog>
    </>
  );
}
