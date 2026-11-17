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
  function fitScene() {
    if(runtime && slot.clientWidth) runtime.setZoom?.(0.45 * slot.clientWidth / 140);
  }
  if ('ResizeObserver' in window) new ResizeObserver(fitScene).observe(slot);
  function removeScene() {
    runtime?.stop?.(); runtime=null;messages=[];syncCaption();
    viewer?.remove(); viewer=null;slot.classList.remove('scene-ready');
  }
  function sync() {
    slot.hidden=hidden;message.hidden=hidden;
    toggle.textContent=hidden?'Show avatar':'Hide avatar';
    if(hidden||reduce.matches){removeScene();return}
    if(!inView||document.hidden){runtime?.stop?.();syncCaption();return}
    if(viewer){runtime?.play?.();syncCaption();return}
    const current=document.createElement('spline-viewer');
    viewer=current;
    current.setAttribute('background','rgba(0,0,0,0)');
    current.setAttribute('events-target','global');
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
      runtime=app;fitScene();syncCaption();slot.classList.add('scene-ready');
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
