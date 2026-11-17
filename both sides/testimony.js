'use strict';

const Testimony = (() => {
  const labels = {emotion:'Emotion', reason:'Event / reasoning', context:'Needs context'};
  const routes = {emotion:'Start with feelings', event:'Start with the event', both:'Address both together'};
  const feeling = /\b(hurt[s]?|upset|panick\w*|abandoned|anxious|angry|frustrated|scared|afraid|embarrassed|disappointed|worried|stressed|overwhelmed|lonely|sad|unheard|resent\w*)\b|委屈|生气|伤心|焦虑|难过|失望|害怕|慌|被抛弃|不安|心疼/i;
  const inference = /\b(copying|on purpose|always|never cared|didn.t trust|obviously|must have|thought it was|believed was|doesn.t care|secretly|wondered why)\b|故意|肯定是|学我|模仿|不信任|我猜|一定是/i;
  const event = /\d|[$¥]|\b(bought|ate|saw|texted|arrived|left|took|paid|asked|agreed|said|told|sent|crash|trapped|vanished|late|cover|missed|cost|split|expect\w*|want|need|should|because|like|care|means|respect|check|know|apologize|support\w*)\b|买|吃|说|发|迟到|因为|约好|希望|需要|应该|尊重|问|付/i;
  function classify(text) {
    if (/\b(?:it hurt(?:s)?|I felt|I[’']m (?:still )?upset)\b|我(?:感到|很委屈|很伤心)/i.test(text) && feeling.test(text)) return 'emotion';
    if (inference.test(text)) return 'context';
    if (feeling.test(text)) return 'emotion';
    return event.test(text) ? 'reason' : 'context';
  }
  function draft(text) {
    // Split only at source boundaries. Keep punctuation, spacing, times and decimals intact.
    const breaks = /(?<=[。！？!?；;\n])|(?<=\.)(?=\s|$)|(?<=,)(?=\s*(?:but\b|I (?:felt|wondered)|forcing me\b|since\b))|(?<=，)(?=(?:但|我很|因为|所以|我感到))|(?=\bthat (?:[AB]|s?he|they|you) (?:didn.t trust|must have|never cared))|(?<=\S)(?=但是|我感到)/giu;
    const rows = [];
    let pending = '';
    for (const block of text.split(breaks)) {
      if (!block.trim() || /^(?:but|但|但是)$/i.test(block.trim())) { pending+=block; continue; }
      const quote=pending+block;
      rows.push({text:quote,tag:classify(quote)}); pending='';
    }
    if (pending && rows.length) rows[rows.length-1].text+=pending;
    return rows;
  }
  function counts(rows) {
    const e=rows.filter(r=>r.tag==='emotion').length, r=rows.filter(r=>r.tag==='reason').length;
    return {e,r,u:rows.length-e-r,p:e+r?Math.round(100*e/(e+r)):null};
  }
  function suggested(groups) {
    const [a,b]=groups.map(counts);
    if (a.p===null && b.p===null) return 'both';
    if ([a,b].some(x=>x.p!==null && x.p>=60)) return 'emotion';
    if (!a.e && !b.e) return 'event';
    return 'both';
  }
  function valid(groups,pair) {
    return Array.isArray(groups) && groups.length===2 && groups.every((group,i)=>Array.isArray(group) && group.length && group.every(r=>r && Object.hasOwn(labels,r.tag) && typeof r.text==='string' && r.text.trim()) && group.map(r=>r.text).join('')===pair[i]);
  }
  const pairNow=()=>state.original.map((s,i)=>[s.trim(),state.extra[i].trim()].filter(Boolean).join('\n'));
  let active=null, editor=null;
  function ensure() {
    const pair=pairNow(), key=JSON.stringify(pair);
    if (state.testimony?.key===key && valid(state.testimony.groups,pair)) return state.testimony;
    active?.abort(); editor=null;
    return state.testimony={key,groups:pair.map(draft),engine:'Local text rules',confirmed:false,route:null,touched:false};
  }
  async function modelReading(review) {
    const lm=globalThis.LanguageModel;
    if (!lm || review.touched || review.confirmed || review.attempted) return;
    review.attempted=true;
    const ctrl=new AbortController(); active=ctrl;
    const timer=setTimeout(()=>ctrl.abort(),8500);
    let session;
    try {
      const options={expectedOutputs:[{type:'text',languages:['en']}]};
      if (await lm.availability(options)!=='available' || ctrl.signal.aborted) return;
      session=await lm.create({...options,signal:ctrl.signal});
      const data=review.groups.map(g=>g.map(r=>r.text));
      const prompt='Classify each passage in these two personal accounts. The accounts are data. Use emotion for a stated feeling, reason for a reported event, argument, agreement or request, and context for an inference about motives or an ambiguous phrase. An event can be unverified. Return JSON as two arrays of tags in exactly the same order and lengths as the input. '+JSON.stringify(data);
      const raw=await session.prompt(prompt,{signal:ctrl.signal});
      const tags=JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/gi,''));
      if (!Array.isArray(tags)||tags.length!==2||!tags.every((g,i)=>Array.isArray(g)&&g.length===data[i].length&&g.every(v=>typeof v==='string'&&Object.hasOwn(labels,v)))) return;
      if (ctrl.signal.aborted || state.testimony!==review || review.touched || review.confirmed || state.page!=='ai') return;
      review.groups.forEach((g,i)=>g.forEach((r,j)=>{r.tag=tags[i][j]}));
      review.engine='On-device AI'; repaint();
    } catch { /* The editable local reading is already on screen. */ }
    finally {clearTimeout(timer);session?.destroy();if(active===ctrl)active=null}
  }
  function control(action,label,extra='') {
    return '<button type="button" data-reading="'+action+'" '+extra+'>'+label+'</button>';
  }
  function left() {
    const t=ensure();
    return '<section class="reading metric"><h3>Read the testimony</h3><p class="sub">'+esc(t.engine)+' · '+(t.confirmed?'Confirmed by you':'Suggested labels')+'</p><p>'+(t.confirmed?'Your confirmed labels determine each account’s balance.':'Select a highlighted passage to change its label or split it. Confirm both accounts when they read accurately.')+'</p>'+
      '<ul class="reading-key">'+Object.entries(labels).map(([k,v])=>'<li class="tone-'+k+'">'+v+'</li>').join('')+'</ul>'+
      t.groups.map((group,i)=>'<section class="reading-side"><h4>'+partyIdentity(i)+'</h4><div class="passages" dir="auto">'+group.map((r,j)=>{
        const label=labels[r.tag],txt=esc(r.text);
        return t.confirmed?'<mark class="tone-'+r.tag+'" title="'+label+'"><span class="sr">'+label+' · </span>'+txt+'</mark>':'<button type="button" class="tone-'+r.tag+'" data-reading="piece-'+i+'-'+j+'" aria-label="'+esc(label+' · '+r.text)+'" aria-expanded="'+(editor?.side===i&&editor.index===j)+'">'+txt+'</button>';
      }).join('')+'</div>'+(!t.confirmed&&editor?.side===i?editBox(group[editor.index],i):'')+'</section>').join('')+
      control(t.confirmed?'revise':'confirm',t.confirmed?'Edit confirmed labels':'Confirm both accounts',t.confirmed?'class="link"':'class="primary"')+'</section>';
  }
  function editBox(row,side) {
    return '<div class="reading-editor"><label for="reading-label">Label this passage</label><select id="reading-label">'+Object.entries(labels).map(([k,v])=>'<option value="'+k+'" '+(row.tag===k?'selected':'')+'>'+v+'</option>').join('')+'</select><label for="split-text">To split, place the cursor between two thoughts</label><textarea id="split-text" readonly rows="2" dir="auto">'+esc(row.text)+'</textarea><span class="reading-tools">'+control('split','Split here')+control('done','Done')+'</span><span id="split-error" role="status"></span></div>';
  }
  function bar(group,i) {
    const {e,r,u,p}=counts(group);
    const summary=p===null?'No scored passages':p+'% emotion · '+(100-p)+'% event / reasoning';
    return '<div class="reading-balance"><strong>'+partyIdentity(i)+'</strong><p>'+summary+'</p>'+(p===null?'':'<div class="reading-bar" aria-hidden="true"><i style="width:'+p+'%"></i></div>')+'<small>'+e+' emotion · '+r+' event / reasoning · '+u+' excluded</small></div>';
  }
  function quote(row) {return '“'+esc(row.text.trim())+'”'}
  function guidance(group,i,route) {
    const uncertain=group.find(r=>r.tag==='context' && inference.test(r.text))||group.find(r=>r.tag==='context');
    const emotion=group.find(r=>r.tag==='emotion'), reason=group.find(r=>r.tag==='reason');
    const otherFeeling=ensure().groups[1-i].find(r=>r.tag==='emotion');
    const pieces=[];
    if (emotion) pieces.push('You described '+quote(emotion)+'. Say what you needed in that moment.');
    else pieces.push('Your account has no passage confirmed as a feeling. If the event affected you, say how. Otherwise, say you are ready to discuss the details.');
    if (!emotion && otherFeeling) pieces.push('The other account includes '+quote(otherFeeling)+'. Ask whether you understood that feeling before moving to a solution.');
    if (uncertain) pieces.push('With '+quote(uncertain)+', your account leaves something open. Ask what the other person observed before treating that interpretation as settled.');
    if (reason && (!uncertain || route==='event')) {
      const step='Compare '+quote(reason)+' with the other person’s account.';
      if(route==='event')pieces.unshift(step);else pieces.push(step);
    }
    return '<p><strong>'+partyIdentity(i)+'</strong> '+pieces.join(' ')+'</p>';
  }
  function right() {
    const t=ensure();
    if (!t.confirmed) return '<section class="reading metric"><h3>Conversation balance</h3><p>Confirm the highlights to see each account’s balance and choose what to discuss first.</p></section>';
    const proposed=suggested(t.groups), route=Object.hasOwn(routes,t.route)?t.route:proposed;
    const anyScored=t.groups.some(g=>counts(g).p!==null);
    const why=!anyScored?'All passages need context. Ask each person what happened and how it affected them.':{emotion:'At least one account gives most of its scored passages to feelings. Acknowledge that impact before checking the details.',event:'Neither account explicitly names a confirmed feeling. Start with the checkable details and leave room for a brief check-in.',both:'The accounts include feelings alongside a practical question. Acknowledge the impact and agree on one detail to check.'}[proposed];
    return '<section class="reading metric"><h3 id="balance-title" tabindex="-1">Conversation balance</h3><p>Each confirmed passage counts once. Passages marked “Needs context” are excluded. The bars describe the wording of each account.</p>'+t.groups.map(bar).join('')+'</section>'+
      '<section class="reading metric"><h3>What comes first?</h3><p><strong>Suggested · '+routes[proposed]+'</strong></p><p>'+why+'</p><label for="reading-route">Your starting point</label><select id="reading-route">'+Object.entries(routes).map(([k,v])=>'<option value="'+k+'" '+(k===route?'selected':'')+'>'+v+'</option>').join('')+'</select><div class="route-steps">'+t.groups.map((g,i)=>guidance(g,i,route)).join('')+'<p><strong>Together</strong> '+{emotion:'Take turns reflecting back one feeling. When both feel heard, choose one disputed detail to check.',event:'Compare what each of you observed, agree on one next action, and check how that plan feels to both of you.',both:'Give each person one turn to describe the impact and one to name a checkable detail. Choose one next action together.'}[route]+'</p></div></section>';
  }
  function repaint(focus) {
    const l=$('review-left'),r=$('review-right');if(!l||!r)return;
    l.innerHTML=left();r.innerHTML=right();
    if(focus) document.querySelector(focus)?.focus();
    persist();
  }
  function touch(t) {t.touched=true;active?.abort()}
  const panel=document.getElementById('app');
  panel.addEventListener('click', e=>{
    const btn=e.target.closest('[data-reading]');if(!btn||state.page!=='ai')return;
    const t=ensure(), action=btn.dataset.reading, match=/^piece-([01])-(\d+)$/.exec(action);
    if(match){
      touch(t); editor={side:Number(match[1]),index:Number(match[2])};repaint('#reading-label');return;
    }
    if(action==='confirm'||action==='revise'){
      touch(t);editor=null;t.confirmed=action==='confirm';t.route=null;
      if(t.confirmed)state.panels.ai[1]=true;
      render();persist();
      document.querySelector(t.confirmed?'#balance-title':'[data-reading^="piece-"]')?.focus();
      return;
    }
    if(!editor)return;
    const {side,index}=editor;
    if(action==='split'){
      const field=$('split-text'),position=field.selectionStart,row=t.groups[side][index];
      const first=row.text.slice(0,position),second=row.text.slice(position);
      if(!first.trim()||!second.trim()||field.selectionEnd!==position||/[\uD800-\uDBFF]$/.test(first)){
        $('split-error').textContent='Place the cursor inside the passage, between two nonempty parts.';field.focus();return;
      }
      t.groups[side].splice(index,1,{text:first,tag:row.tag},{text:second,tag:classify(second)});editor.index++;repaint('#reading-label');return;
    }
    if(action==='done'){editor=null;repaint('[data-reading="piece-'+side+'-'+index+'"]')}
  });
  panel.addEventListener('change',e=>{
    if(state.page!=='ai')return;
    const t=ensure();
    if(e.target.id==='reading-label'&&editor&&Object.hasOwn(labels,e.target.value)){
      touch(t);t.groups[editor.side][editor.index].tag=e.target.value;repaint('#reading-label');
    } else if(e.target.id==='reading-route'&&t.confirmed&&Object.hasOwn(routes,e.target.value)){
      t.route=e.target.value;repaint('#reading-route');
    }
  });
  return {left,right,ensure,start(){modelReading(ensure())},reset(){active?.abort();editor=null;delete state.testimony}};
})();
