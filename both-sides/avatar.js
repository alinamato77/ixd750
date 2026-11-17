'use strict';

const Avatar = (() => {
  const slot = document.getElementById('avatar-slot');
  const toggle = document.getElementById('clerk-toggle');
  const message = document.getElementById('avatar-message');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const source = 'https://prod.spline.design/1WPMwYarjzm8SXqb/scene.splinecode';
  let hidden=false, inView=false, viewer=null, runtime=null, loading;
  let messages=[],captionTimer=0,pageName='home';
  const captions=[['Message','♥'],['Message 2','Justice is the shield of the law.'],['Message 3','Order in the court. We are now in session.']];
  function syncCaption() {
    clearTimeout(captionTimer);
    const playing=runtime && inView && !hidden && !document.hidden && !reduce.matches;
    const active=playing && messages.reduce((best,item)=>item.mesh.scale.x>(best?.mesh.scale.x??0.5)?item:best,null);
    const label=active?.text || lines[pageName] || '';
    if(message.textContent!==label)message.textContent=label;
    if(playing && messages.length)captionTimer=setTimeout(syncCaption,120);
  }
  try { hidden=sessionStorage.getItem('both-sides-hide-clerk')==='yes'; } catch {}

  // The scene follows its cursor in world space. Map page positions into the
  // middle of its own canvas so that the full face stays inside the header.
  let pointer=null, trackingFrame=0;
  function moveScenePointer() {
    trackingFrame=0;
    if(!viewer || !runtime || !inView || document.hidden || hidden || reduce.matches)return;
    const canvas=viewer.shadowRoot?.querySelector('canvas');
    if(!canvas)return;
    const box=canvas.getBoundingClientRect();
    if(!box.width || !box.height)return;
    const cx=box.left+box.width/2, cy=box.top+box.height/2;
    function axis(value,center,extent) {
      const distance=value-center;
      return Math.max(-1,Math.min(1,distance/Math.max(1,distance<0?center:extent-center)));
    }
    const x=pointer?axis(pointer.x,cx,window.innerWidth):0;
    const y=pointer?axis(pointer.y,cy,window.innerHeight):0;
    const opts={clientX:cx+x*box.width*.12,clientY:cy+y*box.height*.12,
      bubbles:true,composed:true,view:window,buttons:0};
    canvas.dispatchEvent(new PointerEvent('pointermove',{...opts,pointerId:1,pointerType:'mouse',isPrimary:true}));
    canvas.dispatchEvent(new MouseEvent('mousemove',opts));
  }
  function queueTracking() {
    if(!trackingFrame && runtime && inView && !hidden && !document.hidden && !reduce.matches)
      trackingFrame=requestAnimationFrame(moveScenePointer);
  }
  function track(event) {
    if(!event.isTrusted || event.pointerType==='touch')return;
    pointer={x:event.clientX,y:event.clientY};queueTracking();
  }
  window.addEventListener('pointermove',track,{capture:true,passive:true});
  // Consume raw moves solely inside the scene. Native clicks, taps and page
  // controls keep their normal targets. The reprojected moves reach Spline.
  for(const type of ['pointermove','mousemove']){
    slot.addEventListener(type,event=>{
      if(event.isTrusted && event.pointerType!=='touch')event.stopPropagation();
    },{capture:true,passive:true});
  }
  function center() {pointer=null;queueTracking()}
  document.documentElement.addEventListener('pointerleave',center);
  window.addEventListener('blur',center);
  function fitScene() {
    if(runtime && slot.clientWidth) runtime.setZoom?.(0.45 * slot.clientWidth / 140);
  }
  if ('ResizeObserver' in window) new ResizeObserver(fitScene).observe(slot);
  function removeScene() {
    cancelAnimationFrame(trackingFrame);trackingFrame=0;
    runtime?.stop?.(); runtime=null;messages=[];syncCaption();
    viewer?.remove(); viewer=null;slot.classList.remove('scene-ready');
  }
  function sync() {
    slot.hidden=hidden;message.hidden=hidden;
    toggle.textContent=hidden?'Show avatar':'Hide avatar';
    if(hidden||reduce.matches){removeScene();return}
    if(!inView||document.hidden){runtime?.stop?.();syncCaption();return}
    if(viewer){runtime?.play?.();queueTracking();syncCaption();return}
    const current=document.createElement('spline-viewer');
    viewer=current;
    current.setAttribute('background','rgba(0,0,0,0)');
    current.setAttribute('events-target','local');
    current.setAttribute('loading','eager');
    current.setAttribute('url',source);
    current.addEventListener('load-complete',()=>{
      if(viewer!==current)return;
      const app=current._spline;
      const robot=app?.findObjectByName('Robot'),camera=app?.findObjectByName('Camera');
      if(!robot||!camera)return;
      for(const name of ['Floor','Cursor Target','Message','Message 2','Message 3']){
        const object=app.findObjectByName(name);if(object)object.visible=false;
      }
      robot.position.x=camera.position.x;robot.position.y=camera.position.y;
      app.setBackgroundColor?.('rgba(0,0,0,0)');
      messages=captions.map(([name,text])=>({mesh:app.findObjectByName(name),text})).filter(item=>item.mesh);
      runtime=app;fitScene();queueTracking();syncCaption();slot.classList.add('scene-ready');
      if(document.hidden||!inView)app.stop?.();
    },{once:true});
    current.addEventListener('error',()=>{if(current===viewer)slot.classList.remove('scene-ready')});
    slot.append(current);
    loading??=import('https://cdn.spline.design/@splinetool/viewer@2.0.159/build/spline-viewer.js');
    loading.catch(()=>{if(viewer===current)removeScene();loading=null});
  }
  toggle.addEventListener('click',()=>{
    hidden=!hidden;
    try{sessionStorage.setItem('both-sides-hide-clerk',hidden?'yes':'no')}catch{}
    sync();
  });
  if('IntersectionObserver' in window){
    new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;sync()}).observe(slot);
  } else {inView=true}
  document.addEventListener('visibilitychange',sync);reduce.addEventListener?.('change',sync);
  const lines={home:'Tell me both sides.',process:'Reading both accounts…',analysis:'What matters to each of you?',context:'What else should I know?',ai:'You can change my reading.',self:'Your call.'};
  sync();
  return {page(name){slot.closest('.hero').dataset.page=name;pageName=name;syncCaption();}};
})();
