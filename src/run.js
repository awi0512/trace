/*RUN-BEGIN*/
/* ===================== BHAGODA: endless run + Inspector Rana (shared by every zone page) =====================
   Edit src/run.js only: scripts/sync-run.py copies this block into index.html and src/train.js. */
const RKEY='trace_run',HKEY='trace_hunter';
const ZONES={airport:{url:'index.html#bhaag',name:'Airport',sub:'Mumbai T2, raat 2 baje',col:'#e0242b'},train:{url:'train.html',name:'Raat ki Gaadi',sub:'Platform 4 + chalti train',col:'#1f4f9a'},
  bus:{url:'bus.html',name:'Highway ki Bus',sub:'Bus adda, dhaba, police naka',col:'#d35400'},port:{url:'port.html',name:'Bandargah',sub:'Containers, searchlights, jahaz',col:'#2fa37a'}};
const MODS={blackout:{name:'Blackout',d:'Bijli baar baar jaati hai. CCTV band, par andhere mein guards bhi kam dekhte hain.',good:true},
  traitor:{name:'Gaddaar',d:'Koi tumhara hulia police ko bech dega. Kab, pata nahi.'},
  rush:{name:'Jaldi',d:'Waqt 30% kam.'},
  alert:{name:'High alert',d:'Guards door tak dekhte hain.'},
  patrol:{name:'Rana khud',d:'Inspector Rana is zone mein khud ghoom raha hai. Wo tumhari purani photo pehchaanta hai.'}};
const HABITS={run:{t:'bhaagti ho',c:'Bhaagne walon pe guards turant shak karenge.'},crowd:{t:'bheed mein chhupti ho',c:'Guards ab bheed ko dhyaan se dekhte hain.'},
  disguise:{t:'kapde badalti ho',c:'Naya hulia 30 second mein radio pe pahunch jaata hai.'},dart:{t:'dart chalaati ho',c:'Behosh guards jaldi uthte hain aur saathi unhe jaldi dhoondhte hain.'},
  cams:{t:'CCTV ke saamne aati ho',c:'Camere door tak dekhte hain.'}};
function rjson(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
function wjson(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
const getRun=()=>rjson(RKEY),saveRun=r=>wjson(RKEY,r);
const getHunter=()=>Object.assign({runs:0,best:0,habits:{run:0,crowd:0,disguise:0,dart:0,cams:0},learned:[]},rjson(HKEY)||{});
const ZONE_ID=(()=>{const f=(location.pathname.split('/').pop()||'index.html').replace('.html','');return f==='train'||f==='bus'||f==='port'?f:'airport';})();
const RUN=(()=>{const r=getRun();if(!r||!r.active||r.zone!==ZONE_ID)return null;if(ZONE_ID==='airport'&&location.hash!=='#bhaag')return null;return r;})();
const HUNTER=getHunter();
/* what Rana has learned: the counters active in this run (chosen at run start from the strongest habits) */
const HUNT={run:1,crowd:.3,cam:1,g:1,dartT:25,disguise:false};
if(RUN){for(const k of RUN.counters||[]){if(k==='run')HUNT.run=1.8;if(k==='crowd')HUNT.crowd=.7;if(k==='cams')HUNT.cam=1.35;if(k==='disguise')HUNT.disguise=true;if(k==='dart')HUNT.dartT=15;}
  HUNT.g=1+Math.min(.6,(RUN.leg-1)*.07+HUNTER.runs*.02);}
const habitNorm={run:60,crowd:90,disguise:3,dart:3,cams:8};
function pickCounters(){const h=HUNTER.habits;return Object.keys(habitNorm).map(k=>[k,(h[k]||0)/habitNorm[k]]).filter(x=>x[1]>=1).sort((a,b)=>b[1]-a[1]).slice(0,Math.min(3,1+Math.floor(HUNTER.runs/3))).map(x=>x[0]);}
function rollMods(leg){const n=leg<=1?0:leg<=3?1:leg<=6?2:3;return shuffle(Object.keys(MODS)).slice(0,n);}
function nextZones(cur){return shuffle(Object.keys(ZONES).filter(z=>z!==cur)).slice(0,2);}
function newRun(){const counters=pickCounters();const z=pick(Object.keys(ZONES));
  const r={active:true,leg:1,zone:z,mods:[],counters,darts:2+(CAREER.dartUp||0),score:0,cash:0,legs:[],lh:{run:0,crowd:0,disguise:0,dart:0,cams:0},started:Date.now()};saveRun(r);return r;}
function startNewRun(){const r=newRun();location.href=ZONES[r.zone].url;if(ZONE_ID==='airport'&&r.zone==='airport')location.reload();}
/* ---- in-zone ---- */
const RT={on:false,lastLook:null,lookT:0,traitorAt:0,blackT:0,dark:false,saved:null};
function runStart(){if(!RUN)return;RT.on=true;RT.lastLook=lookKey();
  const mods=RUN.mods||[];
  if(mods.includes('rush'))S.timeLeft*=.7;
  if(mods.includes('alert'))G.forEach(g=>{g.range*=1.3;});
  if(mods.includes('patrol')&&G.length){const g=pick(G.filter(o=>o.route&&o.route.length>1&&!o.smell))||G[0];g.name='Inspector Rana';g.knows=true;g.walk=(g.walk||1.1)*1.25;g.range*=1.15;}
  if(mods.includes('traitor'))RT.traitorAt=rnd(35,80);
  if(HUNT.cam!==1&&typeof CAMS!=='undefined')CAMS.forEach(c=>{c.range*=HUNT.cam;});
  dartUI();
  const lines=[`BHAGODA · LEG ${RUN.leg} · ${ZONES[ZONE_ID].name.toUpperCase()}`];
  mods.forEach(k=>lines.push('⚠ '+MODS[k].name+': '+MODS[k].d));
  (RUN.counters||[]).forEach(k=>lines.push('RANA: "Wo '+HABITS[k].t+'." '+HABITS[k].c));
  lines.forEach((l,i)=>setTimeout(()=>{if(RT.on)toast(l,i===0?'info':'bad');},400+i*2600));}
function runTick(dt){if(!RT.on||!P)return;const h=RUN.lh;
  if(input.run||input.keys.ShiftLeft||input.keys.ShiftRight){if(P.speed>0)h.run+=dt;}
  try{const F=typeof flags==='function'?flags():playerFlags();if(F.crowd>=2)h.crowd+=dt;}catch(e){}
  const lk=lookKey();if(lk!==RT.lastLook){RT.lastLook=lk;h.disguise++;RT.lookT=0;}
  if(HUNT.disguise&&lk!==S.startLook){RT.lookT+=dt;if(RT.lookT>30){RT.lookT=-999;S.startLook=lk;G.forEach(g=>g.knows=true);toast('Radio: "Rana sir ka order: naya hulia note karo!" Tumhara naya look ab sabko pata hai.');}}
  if(RT.traitorAt>0){RT.traitorAt-=dt;if(RT.traitorAt<=0){RT.traitorAt=-1;S.wanted=lk;G.forEach(g=>{if(g.state!=='alert'){g.state='search';g.lastSeen=[P.pos.x+rnd(-6,6),P.pos.z+rnd(-6,6)];g.searchT=12;g.sus=Math.max(g.sus,55);}});sfx.alert();vib([80,40,80]);
    banner('GADDAAR! Kisi ne tumhara hulia police ko bata diya. Look badlo!',true);setTimeout(()=>banner(null),6000);}}
  if((RUN.mods||[]).includes('blackout')&&typeof CAMS!=='undefined'){RT.blackT+=dt;const dark=(RT.blackT%30)>21;if(dark!==RT.dark){RT.dark=dark;
    if(dark){RT.saved=CAMS.map(c=>c.range);CAMS.forEach(c=>c.range=.01);G.forEach(g=>{g._r=g.range;g.range*=.6;});hemi.intensity*=.45;sfx.thak&&sfx.thak();toast('BLACKOUT! Camere band. 9 second.','info');}
    else{CAMS.forEach((c,i)=>c.range=RT.saved[i]);G.forEach(g=>{if(g._r)g.range=g._r;});hemi.intensity/=.45;}}}
  updDarts(dt);}
/* ---- behoshi dart pistol ---- */
let dartBtn=null;
function dartUI(){if(dartBtn||!RUN)return;dartBtn=document.createElement('button');dartBtn.type='button';dartBtn.id='dartBtn';
  dartBtn.style.cssText='position:fixed;right:16px;bottom:calc(112px + env(safe-area-inset-bottom));width:66px;height:66px;border-radius:50%;border:3px solid #111;background:#2fe39a;color:#111;font:700 12px/1.05 "Space Grotesk",sans-serif;z-index:30;box-shadow:0 4px 0 #111;touch-action:manipulation';
  document.body.appendChild(dartBtn);dartBtn.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();shootDart();});addEventListener('keydown',e=>{if(e.code==='KeyF')shootDart();});drawDartBtn();}
function drawDartBtn(){if(!dartBtn)return;dartBtn.innerHTML=`DART<br><b style="font-size:18px">${RUN.darts}</b>`;dartBtn.style.opacity=RUN.darts>0?1:.35;}
const playing=()=>['play','platform','train'].includes(S.phase)&&!locked;
function dartTarget(){let best=null,bd=9.5;for(const g of G){if(!g.g.visible||g.down>0||g.scripted)continue;if(g.area&&S.area&&g.area!==S.area)continue;const d=Math.hypot(g.pos.x-P.pos.x,g.pos.z-P.pos.z);if(d<bd&&!losBlocked(P.pos.x,P.pos.z,g.pos.x,g.pos.z)){bd=d;best=g;}}return best;}
function shootDart(){if(!RT.on||!playing())return;if(RUN.darts<=0){toast('Dart khatam.');return;}const g=dartTarget();if(!g){toast('Koi guard nishaane pe nahi (9 m ke andar, seedhi line mein).','info');return;}
  RUN.darts--;RUN.lh.dart++;drawDartBtn();P.yaw=Math.atan2(g.pos.x-P.pos.x,g.pos.z-P.pos.z);P.g.rotation.y=P.yaw;
  tone(1400,.08,'square',.12);burst(.12,2400,.5,'highpass');vib(30);
  g.down=HUNT.dartT;g.found=false;g.state='patrol';g.sus=0;g.g.rotation.x=-Math.PI/2;g.g.position.y=.25;g.cone.piv.visible=false;if(g.icon)g.icon.sp.visible=false;
  if(S.wanted===lookKey()&&g.state==='alert')S.wanted=null;
  for(const o of G){if(o===g||o.down>0||!o.g.visible)continue;const d=Math.hypot(o.pos.x-P.pos.x,o.pos.z-P.pos.z);if(d<11&&o.state!=='alert'){o.state='search';o.lastSeen=[P.pos.x,P.pos.z];o.searchT=8;o.sus=Math.max(o.sus,50);}}
  toast(`${g.name} behosh! ${Math.round(HUNT.dartT)} second. Koi saathi dekh le to ALERT.`,'good');}
function updDarts(dt){for(const g of G){if(!(g.down>0))continue;g.down-=dt;g.g.rotation.x=-Math.PI/2;g.g.position.set(g.pos.x,.25,g.pos.z);
  if(!g.found)for(const o of G){if(o===g||o.down>0||!o.g.visible||o.state==='alert')continue;const dx=g.pos.x-o.pos.x,dz=g.pos.z-o.pos.z,d=Math.hypot(dx,dz);
    if(d<o.range*.9&&Math.abs(angDiff(Math.atan2(dx,dz),o.yaw))<o.fov&&!losBlocked(o.pos.x,o.pos.z,g.pos.x,g.pos.z)){g.found=true;o.lastSeen=[P.pos.x,P.pos.z];goAlert(o,'behosh saathi mila');toast(`${o.name}: "Yahan ek jawan behosh pada hai! SAB ALERT!"`);break;}}
  if(g.down<=0){g.down=0;g.g.rotation.x=0;g.g.position.y=0;g.state='search';g.sus=60;g.lastSeen=[g.pos.x+rnd(-3,3),g.pos.z+rnd(-3,3)];g.searchT=10;}}}
/* guards that are knocked out skip their normal update */
function isDown(g){if(!(g.down>0))return false;g.cone.piv.visible=false;if(g.icon)g.icon.sp.visible=false;return true;}
/* ---- end of a zone: next leg or run over ---- */
function runEnd(win,who,why){if(!RT.on)return false;RT.on=false;S.phase='over';locked=true;if(dartBtn)dartBtn.remove();
  ['#hud','#pads','#joy','#map'].forEach(s=>{const e=$(s);if(e)e.hidden=true;});banner(null);
  const nCam=S.camsSeen?S.camsSeen.size:0;RUN.lh.cams+=nCam;
  const legScore=win?Math.round(100+RUN.leg*40+(S.alerts?0:60)+Math.max(0,S.timeLeft)|0):0;const cash=win?40000+RUN.leg*15000:0;
  RUN.legs.push({zone:ZONE_ID,win,traces:S.traces.length,alerts:S.alerts});
  if(win){RUN.score+=legScore;RUN.cash+=cash;const opts=nextZones(ZONE_ID).map(z=>({z,mods:rollMods(RUN.leg+1)}));RUN.offer=opts;saveRun(RUN);
    const c=sheet(`<div class="eyebrow">BHAGODA · LEG ${RUN.leg} PAAR</div><h2>Bach nikli!</h2>
      <div class="stats"><div class="stat"><span>Score</span><b>${RUN.score}</b></div><div class="stat"><span>Run ka paisa</span><b>${inr(RUN.cash)}</b></div><div class="stat"><span>Dart</span><b>${RUN.darts}</b></div></div>
      <p>Rana peechhe hai. Agla raasta chuno:</p>
      ${opts.map((o,i)=>`<button class="btn" type="button" data-i="${i}" style="background:${ZONES[o.z].col};text-align:left;line-height:1.25">${ZONES[o.z].name} →<br><span style="font:500 12px var(--type,monospace);opacity:.9">${ZONES[o.z].sub}${o.mods.length?' · ⚠ '+o.mods.map(k=>MODS[k].name).join(', '):' · koi khatra nahi'}</span></button>`).join('')}
      <button class="btn alt" type="button" id="bank">Yahin ruk jao (paisa bank karo)</button>`);
    c.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const o=opts[+b.dataset.i];RUN.leg++;RUN.zone=o.z;RUN.mods=o.mods;if(RUN.leg%3===0)RUN.darts++;saveRun(RUN);location.href=ZONES[o.z].url;if(o.z==='airport'&&ZONE_ID==='airport')location.reload();});
    c.querySelector('#bank').onclick=()=>runOver(true);}
  else{RUN.dead={who:who||null,why:why||null};runOver(false);}
  return true;}
function runOver(banked){const r=RUN;r.active=false;saveRun(r);
  for(const k in r.lh)HUNTER.habits[k]=(HUNTER.habits[k]||0)*.6+r.lh[k];HUNTER.runs++;
  const legsDone=r.legs.filter(l=>l.win).length;HUNTER.best=Math.max(HUNTER.best||0,legsDone);
  const top=Object.keys(habitNorm).map(k=>[k,(r.lh[k]||0)/habitNorm[k]]).sort((a,b)=>b[1]-a[1])[0];
  const learned=top&&top[1]>=.5?top[0]:null;wjson(HKEY,HUNTER);
  const kept=banked?r.cash:Math.round(r.cash*.25);CAREER.money+=kept;CAREER.bestRun=Math.max(CAREER.bestRun||0,legsDone);CAREER.missions=(CAREER.missions||0)+1;saveCareer();
  const c=sheet(`<div class="eyebrow">BHAGODA · RUN KHATAM</div><h2 style="color:${banked?'var(--good)':'var(--red)'}">${banked?'Gaayab!':'Pakdi gayi'}</h2>
    <p>${banked?'Tum shehar chhod ke chhup gayi. Rana ke haath khaali.':esc(r.dead&&r.dead.who?r.dead.who+' ne pakad liya.':(r.dead&&r.dead.why)||'Rana jeet gaya. Is baar.')}</p>
    <div class="stats"><div class="stat"><span>Legs paar</span><b>${legsDone}</b></div><div class="stat"><span>Score</span><b>${r.score}</b></div><div class="stat"><span>Paisa mila</span><b>${inr(kept)}</b></div></div>
    <p class="eyebrow">BEST RUN: ${HUNTER.best} LEGS · RANA NE ${HUNTER.runs} RUN DEKHE</p>
    ${learned?`<div class="dossier"><h3>Inspector Rana ki diary</h3><p style="margin:6px 0 0;color:#1b1b1b">"Wo ${HABITS[learned].t}. Agli baar taiyaar rahunga."</p><span class="stampx">NOTED</span></div>`:''}
    <ul class="traces">${r.legs.map((l,i)=>`<li class="${l.win?'ok':''}">Leg ${i+1} · ${ZONES[l.zone].name} · ${l.win?'paar':'pakdi gayi'} · ${l.traces} nishaan</li>`).join('')}</ul>
    <button class="btn" id="again" type="button" style="background:#e0242b">Naya run</button><a class="btn alt" href="index.html">Safehouse</a>`);
  c.querySelector('#again').onclick=startNewRun;}
window.__run={runEnd:(...a)=>runEnd(...a),shootDart:()=>shootDart(),get RUN(){return RUN;},HUNT,RT};
/*RUN-END*/
