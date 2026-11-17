'use strict';

const Portraits = (() => {
  const shapes = [
    'Bear', 'Rabbit', 'Kitten', 'Smile', 'Star eyes', 'Little heart', 'Wink', 'Happy cat',
    'Butterfly', 'Shooting star', 'Crescent moon', 'Halo', 'Bubbles', 'Heart', 'Star', 'Music note',
    'Leaf', 'Wave', 'Thought cloud', 'Potion', 'Diamond', 'Clover', 'Candy', 'Flower'
  ];
  // Tone 45 preserves the sheet's original colors. Other stops tint only the artwork's fill.
  const stops = [
    { at: 0, name: 'Glacier', colors: ['#72bcff', '#c1a3ff'] },
    { at: 24, name: 'Mint', colors: ['#7be8cb', '#c0ef9a'] },
    { at: 45, name: 'Original', colors: ['#c6e8ff', '#ffd4ee'] },
    { at: 72, name: 'Apricot', colors: ['#ffeaa1', '#ffb38a'] },
    { at: 100, name: 'Sunset', colors: ['#ffb378', '#f07caa'] }
  ];
  function initial() { return [{shape: 0, tone: 45}, {shape: 1, tone: 45}]; }

  function palette(tone) {
    const end = stops.findIndex(stop => tone <= stop.at);
    const right = stops[end], left = stops[Math.max(0, end-1)];
    const t = (tone-left.at)/(right.at-left.at || 1);
    const colors = left.colors.map((a,i) => {
      const b = right.colors[i];
      const channels = [1,3,5].map(offset => {
        const x = parseInt(a.slice(offset,offset+2),16), y = parseInt(b.slice(offset,offset+2),16);
        return Math.round(x+(y-x)*t);
      });
      return 'rgb('+channels.join(',')+')';
    });
    return 'linear-gradient(135deg,'+colors.join(',')+')';
  }
  function tint(tone) {
    return '--wash:'+palette(tone)+';--strength:'+Math.min(1, Math.abs(tone-45)/(tone<45?21:27));
  }
  function sprite(shape) {
    return '<span class="portrait-sprite" aria-hidden="true" style="--x:'+(shape%4)*100/3+'%;--y:'+Math.floor(shape/4)*20+'%"></span>';
  }
  function inline(selection) {
    return '<span class="inline-portrait" aria-hidden="true" style="'+tint(selection.tone)+'">'+sprite(selection.shape)+'</span>';
  }
  const camera = '<span class="camera-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="3.3"/></svg></span>';
  function badge(selection, side, editable) {
    const inside = sprite(selection.shape)+(editable?camera:'');
    const style = ' class="party-portrait" style="'+tint(selection.tone)+'"';
    return editable
      ? '<button type="button"'+style+' data-action="portrait'+side+'" aria-label="Choose portrait for Party '+('AB'[side])+'">'+inside+'</button>'
      : '<span'+style+' role="img" aria-label="'+shapes[selection.shape]+' portrait">'+inside+'</span>';
  }

  const dialog = document.querySelector('#portrait-dialog');
  const grid = dialog.querySelector('.portrait-grid'), presets = dialog.querySelector('.color-presets');
  const slider = dialog.querySelector('input[type=range]'), preview = dialog.querySelector('.portrait-preview');
  let draft, commit;
  grid.innerHTML = shapes.map((name,i)=>'<button type="button" data-shape="'+i+'" aria-label="'+name+'" title="'+name+'">'+sprite(i)+'</button>').join('');
  presets.innerHTML = [2,0,1,3,4].map(i=>{
    const s=stops[i];
    return '<button type="button" data-tone="'+s.at+'" style="--swatch:'+palette(s.at)+'"><i aria-hidden="true"></i>'+s.name+'</button>';
  }).join('');
  function update() {
    const tone=draft.tone, style=tint(tone);
    grid.style.cssText=style;
    slider.value=tone;
    const label=stops.find(s=>s.at===tone)?.name || (tone<45?'Cool blend':'Warm blend');
    slider.setAttribute('aria-valuetext',label+' · '+tone+' of 100');
    grid.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===draft.shape)));
    presets.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.tone)===tone)));
    preview.style.cssText=style;
    preview.innerHTML=sprite(draft.shape);
    dialog.querySelector('.preview-name').textContent=shapes[draft.shape]+' · '+label;
  }
  grid.addEventListener('click',e=>{const b=e.target.closest('[data-shape]');if(b){draft.shape=Number(b.dataset.shape);update();}});
  presets.addEventListener('click',e=>{const b=e.target.closest('[data-tone]');if(b){draft.tone=Number(b.dataset.tone);update();}});
  slider.addEventListener('input',()=>{draft.tone=Number(slider.value);update();});
  dialog.querySelector('[data-dismiss]').onclick=()=>dialog.close();
  dialog.querySelector('[data-apply]').onclick=()=>{const selection={...draft};dialog.close();commit(selection);};
  function open(side, selection, onApply) {
    draft={...selection}; commit=onApply;
    dialog.querySelector('h2').textContent='Party '+('AB'[side])+' portrait';
    update();dialog.showModal();dialog.querySelector('.portrait-scroll').scrollTop=0;
    grid.children[draft.shape].focus({preventScroll:true});
  }
  return {initial,badge,inline,open};
})();
