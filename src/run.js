/*RUN-BEGIN*/
/* ===================== ESCAPE MODE: endless run + Inspector Rana (shared by every zone page) =====================
   Edit src/run.js only: scripts/sync-run.py copies this block into index.html and src/train.js. */
const RKEY='trace_run',HKEY='trace_hunter';
const ZONES={airport:{url:'index.html#bhaag',name:'Airport',sub:'Terminal, security, boarding gates',col:'#e0242b'},train:{url:'train.html',name:'Night Train',sub:'Platform 4 + moving sleeper train',col:'#1f4f9a'},
  bus:{url:'bus.html',name:'Highway Bus',sub:'Bus stand, dhaba, police checkpost',col:'#d35400'},port:{url:'port.html',name:'Docks',sub:'Containers, searchlights, cargo ship',col:'#2fa37a'}};
const MODS={blackout:{name:'Blackout',d:'Power cuts on and off. CCTV goes dark, guards see less.',good:true},
  traitor:{name:'Traitor',d:'Someone will sell your look to the police. No idea when.'},
  rush:{name:'Rush',d:'30% less time.'},
  alert:{name:'High alert',d:'Guards see further.'},
  patrol:{name:'Rana on site',d:'Inspector Rana is patrolling this zone himself. He knows your old photo.'}};
const HABITS={run:{t:'bhaagti hai',c:'Guards now suspect runners instantly.'},crowd:{t:'bheed mein chhupti hai',c:'Guards now watch crowds closely.'},
  disguise:{t:'kapde badalti hai',c:'A new look reaches every radio in 30 seconds.'},dart:{t:'dart chalaati hai',c:'Darted guards wake up faster.'},
  cams:{t:'CCTV ke saamne aati hai',c:'Cameras see further.'},flight:{t:'hamesha flight pakadti hai',c:'Airports get extra eyes.'}};
function rjson(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
function wjson(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
const getRun=()=>rjson(RKEY),saveRun=r=>wjson(RKEY,r);
const getHunter=()=>{const h=Object.assign({runs:0,best:0,learned:[]},rjson(HKEY)||{});h.habits=Object.assign({run:0,crowd:0,disguise:0,dart:0,cams:0,flight:0},h.habits||{});return h;};
const ZONE_ID=(()=>{const f=(location.pathname.split('/').pop()||'index.html').replace('.html','');return f==='train'||f==='bus'||f==='port'?f:'airport';})();
const RUN=(()=>{const r=getRun();if(!r||!r.active||r.zone!==ZONE_ID)return null;if(ZONE_ID==='airport'&&location.hash!=='#bhaag')return null;return r;})();
const HUNTER=getHunter();
/* what Rana has learned: the counters active in this run (chosen at run start from the strongest habits) */
const HUNT={run:1,crowd:.3,cam:1,g:1,dartT:25,disguise:false};
if(RUN){for(const k of RUN.counters||[]){if(k==='run')HUNT.run=1.8;if(k==='crowd')HUNT.crowd=.7;if(k==='cams')HUNT.cam=1.35;if(k==='disguise')HUNT.disguise=true;if(k==='dart')HUNT.dartT=15;}
  HUNT.g=1+Math.min(.6,(RUN.leg-1)*.07+HUNTER.runs*.02);}
const habitNorm={run:60,crowd:90,disguise:3,dart:3,cams:8,flight:2};
function pickCounters(){const h=HUNTER.habits;return Object.keys(habitNorm).map(k=>[k,(h[k]||0)/habitNorm[k]]).filter(x=>x[1]>=1).sort((a,b)=>b[1]-a[1]).slice(0,Math.min(3,1+Math.floor(HUNTER.runs/3))).map(x=>x[0]);}
function rollMods(leg){const n=leg<=1?0:leg<=3?1:leg<=6?2:3;return shuffle(Object.keys(MODS)).slice(0,n);}
function nextZones(cur){return shuffle(Object.keys(ZONES).filter(z=>z!==cur)).slice(0,2);}
function newRun(){const counters=pickCounters();const z=pick(Object.keys(ZONES));
  const r={active:true,leg:1,zone:z,mods:[],counters,darts:2+(CAREER.dartUp||0),score:0,cash:0,legs:[],lh:{run:0,crowd:0,disguise:0,dart:0,cams:0,flight:0},started:Date.now()};saveRun(r);return r;}
function startNewRun(){const r=newRun();location.href=ZONES[r.zone].url;if(ZONE_ID==='airport'&&r.zone==='airport')location.reload();}
/* ---- in-zone ---- */
const RT={on:false,lock:false,body:false,exit:null,lastLook:null,lookT:0,traitorAt:0,blackT:0,dark:false,saved:null};
function runStart(){if(!RUN)return;RT.on=true;RT.lastLook=lookKey();
  const mods=RUN.mods||[];
  if(mods.includes('rush'))S.timeLeft*=.7;
  if(mods.includes('alert'))G.forEach(g=>{g.range*=1.3;});
  if(mods.includes('patrol')&&G.length){const g=pick(G.filter(o=>o.route&&o.route.length>1&&!o.smell))||G[0];g.name='Inspector Rana';g.knows=true;g.walk=(g.walk||1.1)*1.25;g.range*=1.15;}
  if(mods.includes('traitor'))RT.traitorAt=rnd(35,80);
  if(HUNT.cam!==1&&typeof CAMS!=='undefined')CAMS.forEach(c=>{c.range*=HUNT.cam;});
  if(ZONE_ID==='airport'&&(RUN.counters||[]).includes('flight'))G.forEach(g=>{g.range*=1.2;});
  if(RUN.lh.flight===undefined)RUN.lh.flight=0;
  if(!(typeof TUT!=='undefined'&&TUT)){dartUI();gunUI();}
  const lines=[`ESCAPE · LEG ${RUN.leg} · ${ZONES[ZONE_ID].name.toUpperCase()}`];
  mods.forEach(k=>lines.push('⚠ '+MODS[k].name+': '+MODS[k].d));
  (RUN.counters||[]).forEach(k=>lines.push('RANA: "Wo '+HABITS[k].t+'." → '+HABITS[k].c));
  lines.forEach((l,i)=>setTimeout(()=>{if(RT.on)toast(l,i===0?'info':'bad');},400+i*2600));}
function runTick(dt){if(!RT.on||!P)return;const h=RUN.lh;
  if(input.run||input.keys.ShiftLeft||input.keys.ShiftRight){if(P.speed>0)h.run+=dt;}
  try{const F=typeof flags==='function'?flags():playerFlags();if(F.crowd>=2)h.crowd+=dt;}catch(e){}
  const lk=lookKey();if(lk!==RT.lastLook){RT.lastLook=lk;h.disguise++;RT.lookT=0;}
  if(HUNT.disguise&&lk!==S.startLook){RT.lookT+=dt;if(RT.lookT>30){RT.lookT=-999;S.startLook=lk;G.forEach(g=>g.knows=true);toast('Radio: "Rana sir ka order: naya hulia note karo!" Your new look is out.');}}
  if(RT.traitorAt>0){RT.traitorAt-=dt;if(RT.traitorAt<=0){RT.traitorAt=-1;S.wanted=lk;G.forEach(g=>{if(g.state!=='alert'){g.state='search';g.lastSeen=[P.pos.x+rnd(-6,6),P.pos.z+rnd(-6,6)];g.searchT=12;g.sus=Math.max(g.sus,55);}});sfx.alert();vib([80,40,80]);
    banner('TRAITOR! Police have your current look. Change it!',true);setTimeout(()=>banner(null),6000);}}
  if((RUN.mods||[]).includes('blackout')&&typeof CAMS!=='undefined'){RT.blackT+=dt;const dark=(RT.blackT%30)>21;if(dark!==RT.dark){RT.dark=dark;
    if(dark){RT.saved=CAMS.map(c=>c.range);CAMS.forEach(c=>c.range=.01);G.forEach(g=>{g._r=g.range;g.range*=.6;});hemi.intensity*=.45;sfx.thak&&sfx.thak();toast('BLACKOUT! Cameras off for 9 seconds.','info');}
    else{CAMS.forEach((c,i)=>c.range=RT.saved[i]);G.forEach(g=>{if(g._r)g.range=g._r;});hemi.intensity/=.45;}}}
  updDarts(dt);updGun(dt);checkLock();}
/* ---- airport: any alert, gunshot or found body locks the gates. No flight; leave by taxi (train or bus next) ---- */
function checkLock(){if(ZONE_ID!=='airport'||RT.lock)return;if(S.alerts>0||W.stars>0||RT.body){RT.lock=true;sfx.alert();vib([120,60,120]);
  banner('AIRPORT LOCKDOWN! Gates closed. No flight now: get out via the taxi stand',true);setTimeout(()=>{if(RT.on)banner(null);},7000);toast('Announcement: "Security alert. Saari flights hold pe hain."');drawGun();}}
const gateOpen=()=>!RT.lock;
const runClean=()=>RT.on&&S.alerts===0&&W.stars===0&&!RT.body;
/* ---- behoshi dart pistol ---- */
let dartBtn=null;
function dartUI(){if(dartBtn||!RUN)return;if(!RUN.wmode)RUN.wmode='dart';dartBtn=document.createElement('button');dartBtn.type='button';dartBtn.id='dartBtn';
  dartBtn.style.cssText='position:fixed;right:16px;bottom:calc(112px + env(safe-area-inset-bottom));width:66px;height:66px;border-radius:50%;border:3px solid #111;background:#2fe39a;color:#111;font:700 12px/1.05 "Space Grotesk",sans-serif;z-index:30;box-shadow:0 4px 0 #111;touch-action:manipulation';
  document.body.appendChild(dartBtn);dartBtn.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();fire();});
  const sw=document.createElement('button');sw.type='button';sw.id='wpnSwitch';sw.style.cssText='position:fixed;right:20px;bottom:calc(186px + env(safe-area-inset-bottom));z-index:30;border:2px solid #111;border-radius:999px;background:#fff;color:#111;font:700 11px "Space Grotesk",sans-serif;padding:5px 9px;box-shadow:0 3px 0 #111;touch-action:manipulation';
  document.body.appendChild(sw);sw.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();switchWpn();});dartBtn.sw=sw;
  addEventListener('keydown',e=>{if(e.code==='KeyF')fire();if(e.code==='KeyQ')switchWpn();});drawDartBtn();}
function fire(){if(RUN.wmode==='gun')shootGun();else shootDart();}
function switchWpn(){if(!RT.on)return;RUN.wmode=RUN.wmode==='gun'?'dart':'gun';tone(500,.05,'square',.08);drawDartBtn();}
function drawDartBtn(){if(!dartBtn)return;const gun=RUN.wmode==='gun',n=gun?(RUN.ammo||0):RUN.darts;
  dartBtn.innerHTML=`${gun?'GUN':'DART'}<br><b style="font-size:18px">${n}</b>`;dartBtn.style.background=gun?'#e0242b':'#2fe39a';dartBtn.style.color=gun?'#fff':'#111';dartBtn.style.opacity=n>0?1:.4;
  dartBtn.sw.textContent='⇄ '+(gun?'DART':'GUN');}
const playing=()=>['play','platform','train'].includes(S.phase)&&!locked;
function dartTarget(){let best=null,bd=9.5;for(const g of G){if(!g.g.visible||g.down>0||g.scripted)continue;if(g.area&&S.area&&g.area!==S.area)continue;const d=Math.hypot(g.pos.x-P.pos.x,g.pos.z-P.pos.z);if(d<bd&&!losBlocked(P.pos.x,P.pos.z,g.pos.x,g.pos.z)){bd=d;best=g;}}return best;}
function shootDart(){if(!RT.on||!playing())return;if(RUN.darts<=0){toast('No darts left.');return;}const g=dartTarget();if(!g){toast('No target in range (9 m, clear line).','info');return;}
  RUN.darts--;RUN.lh.dart++;drawDartBtn();P.yaw=Math.atan2(g.pos.x-P.pos.x,g.pos.z-P.pos.z);P.g.rotation.y=P.yaw;
  tone(1400,.08,'square',.12);burst(.12,2400,.5,'highpass');vib(30);
  g.down=HUNT.dartT;g.found=false;g.state='patrol';g.sus=0;g.g.rotation.x=-Math.PI/2;g.g.position.y=.25;g.cone.piv.visible=false;if(g.icon)g.icon.sp.visible=false;
  if(S.wanted===lookKey()&&g.state==='alert')S.wanted=null;
  for(const o of G){if(o===g||o.down>0||!o.g.visible)continue;const d=Math.hypot(o.pos.x-P.pos.x,o.pos.z-P.pos.z);if(d<11&&o.state!=='alert'){o.state='search';o.lastSeen=[P.pos.x,P.pos.z];o.searchT=8;o.sus=Math.max(o.sus,50);}}
  toast(`${g.name} knocked out for ${Math.round(HUNT.dartT)}s. If someone finds him: ALERT.`,'good');}
function updDarts(dt){for(const g of G){if(!(g.down>0))continue;g.down-=dt;g.g.rotation.x=-Math.PI/2;g.g.position.set(g.pos.x,.25,g.pos.z);
  if(!g.found)for(const o of G){if(o===g||o.down>0||!o.g.visible||o.state==='alert')continue;const dx=g.pos.x-o.pos.x,dz=g.pos.z-o.pos.z,d=Math.hypot(dx,dz);
    if(d<o.range*.9&&Math.abs(angDiff(Math.atan2(dx,dz),o.yaw))<o.fov&&!losBlocked(o.pos.x,o.pos.z,g.pos.x,g.pos.z)){g.found=true;RT.body=true;o.lastSeen=[P.pos.x,P.pos.z];goAlert(o,'found a body');toast(`${o.name}: "Yahan ek jawan behosh pada hai! SAB ALERT!"`);break;}}
  if(g.down<=0){g.down=0;g.g.rotation.x=0;g.g.position.y=0;g.state='search';g.sus=60;g.lastSeen=[g.pos.x+rnd(-3,3),g.pos.z+rnd(-3,3)];g.searchT=10;}}}
/* ---- pistol: wounds (1 hit) or kills (2-3 hits); every shot raises the wanted level. Police shoot back at 3★+ ---- */
const W={hp:100,hitT:99,stars:0,shots:0,kills:0,cd:0,ui:null,fx:[]};
function gunUI(){if(W.ui||!RUN)return;if(RUN.ammo===undefined)RUN.ammo=6;W.stars=RUN.wanted||0;
  const h=document.createElement('div');h.id='wantedHud';h.style.cssText='position:fixed;right:16px;top:calc(140px + env(safe-area-inset-top));z-index:30;background:#111;color:#fff;border-radius:999px;padding:5px 12px;font:700 13px "Space Grotesk",sans-serif;display:flex;gap:10px;align-items:center;pointer-events:none';
  document.body.appendChild(h);W.ui=h;const v=document.createElement('div');v.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:29;box-shadow:inset 0 0 120px 40px rgba(224,36,43,.75);opacity:0;transition:opacity .25s';document.body.appendChild(v);W.vig=v;drawGun();}
function drawGun(){if(!W.ui)return;drawDartBtn();
  W.ui.innerHTML=`<span style="color:#ffd166;letter-spacing:1px">${'★'.repeat(W.stars)}<span style="opacity:.3">${'★'.repeat(5-W.stars)}</span></span>${ZONE_ID==='airport'?`<span style="color:${RT.lock?'#ff6a5a':'#2fe39a'}">✈ ${RT.lock?'LOCKED':'OPEN'}</span>`:''}<span style="display:inline-block;width:70px;height:8px;background:#333;border-radius:4px;overflow:hidden"><i style="display:block;height:100%;width:${W.hp}%;background:${W.hp>50?'#2fe39a':W.hp>25?'#f5b82e':'#e0242b'}"></i></span>`;}
function addStars(n,why){const before=W.stars;W.stars=Math.min(5,W.stars+n);if(W.stars>before){toast(`WANTED ${'★'.repeat(W.stars)} · ${why}`);if(W.stars>=3&&before<3){banner('3★ WANTED: police will shoot on sight!',true);setTimeout(()=>banner(null),5000);}}drawGun();}
function tracer(a,b,col){const g=new T.BufferGeometry().setFromPoints([new T.Vector3(a.x,1.15,a.z),new T.Vector3(b.x,1.1,b.z)]);const l=new T.Line(g,new T.LineBasicMaterial({color:col,transparent:true,opacity:1,toneMapped:false}));scene.add(l);
  const f=new T.Mesh(new T.SphereGeometry(.16,8,6),new T.MeshBasicMaterial({color:0xfff2a0,toneMapped:false}));f.position.set(a.x,1.15,a.z);scene.add(f);W.fx.push({l,f,t:.12});}
function bang(){burst(.25,3000,.9,'highpass');tone(90,.25,'square',.2);vib(50);}
function gunTarget(){let best=null,bd=14;for(const g of G){if(!g.g.visible||g.dead||g.scripted)continue;if(g.area&&S.area&&g.area!==S.area)continue;const d=Math.hypot(g.pos.x-P.pos.x,g.pos.z-P.pos.z);if(d<bd&&!losBlocked(P.pos.x,P.pos.z,g.pos.x,g.pos.z)){bd=d;best=g;}}return best;}
function shootGun(){if(!RT.on||!playing()||W.cd>0)return;if(RUN.ammo<=0){toast('Out of bullets.');return;}const g=gunTarget();if(!g){toast('No target in range (14 m, clear line).','info');return;}
  W.cd=.45;RUN.ammo--;W.shots++;const d=Math.hypot(g.pos.x-P.pos.x,g.pos.z-P.pos.z);P.yaw=Math.atan2(g.pos.x-P.pos.x,g.pos.z-P.pos.z);P.g.rotation.y=P.yaw;
  bang();tracer(P.pos,g.pos,0xffe08a);if(S.traces.length<12&&W.shots===1)trace('Gunshot: heard by everyone, caught on CCTV');
  const hit=Math.random()<(d<6?.92:d<10?.75:.55);
  if(hit){g.hp=(g.hp===undefined?3:g.hp)-(Math.random()<.25?2:1);
    if(g.hp<=0){g.dead=true;g.down=Infinity;g.found=false;g.state='patrol';g.g.rotation.x=-Math.PI/2;g.g.position.y=.25;W.kills++;addStars(2,`${g.name} killed`);toast(`${g.name} down.`,'good');}
    else{g.wounded=true;g.stunT=1.5;g.walk=(g.walk||1.1)*.55;g.range*=.8;g.lastSeen=[P.pos.x,P.pos.z];goAlert(g,'shot');toast(`${g.name} wounded! (${g.hp} more)`);addStars(1,'shot a guard');}}
  else{toast('Missed!','info');addStars(1,'shots fired');}
  for(const o of G){if(o===g||o.down>0||!o.g.visible)continue;const dd=Math.hypot(o.pos.x-P.pos.x,o.pos.z-P.pos.z);if(dd<26&&o.state!=='alert'){o.state='search';o.lastSeen=[P.pos.x,P.pos.z];o.searchT=14;o.sus=Math.max(o.sus,80);}}
  drawGun();}
function updGun(dt){W.cd-=dt;for(const g of G)if(g.stunT>0)g.stunT-=dt;W.hitT+=dt;for(let i=W.fx.length-1;i>=0;i--){const f=W.fx[i];f.t-=dt;f.l.material.opacity=Math.max(0,f.t/.12);f.f.visible=f.t>.06;if(f.t<=0){scene.remove(f.l);scene.remove(f.f);W.fx.splice(i,1);}}
  if(W.hitT>6&&W.hp<100){W.hp=Math.min(100,W.hp+4*dt);if((W.hitT*10|0)%10===0)drawGun();}
  const fs=S.alerts>=3?1:0;if(fs&&W.stars<1)addStars(1,'repeated alerts');
  if(W.stars<3||locked)return;
  const F=(()=>{try{return typeof flags==='function'?flags():playerFlags();}catch(e){return {};}})();
  for(const g of G){if(g.down>0||g.dead||!g.g.visible||g.state!=='alert'||g.smell)continue;if(g.area&&S.area&&g.area!==S.area)continue;
    g.fireT=(g.fireT===undefined?rnd(.6,1.4):g.fireT)-dt;const d=canSee(g,P.pos.x,P.pos.z);if(!d||d>13){continue;}
    if(g.fireT>0)continue;g.fireT=rnd(1.3,2.2)-W.stars*.15;bang();tracer(g.pos,P.pos,0xff6a5a);
    let pHit=.38+(W.stars-3)*.1;if(P.running||F.running)pHit*=.65;if(F.crowd>=2)pHit*=.6;if(d>9)pHit*=.7;
    if(Math.random()<pHit){const dmg=ri(18,32);W.hp-=dmg;W.hitT=0;W.vig.style.opacity=1;setTimeout(()=>W.vig.style.opacity=0,260);vib([60,30,60]);drawGun();
      if(W.hp<=0){W.hp=0;drawGun();toast('You were shot...');setTimeout(()=>runEnd(false,null,`Shot by ${g.name}. At ${W.stars}★ the police don\'t ask questions.`),900);RT.dead=true;locked=true;P.g.rotation.x=-Math.PI/2;P.g.position.y=.25;return;}
      else toast(`Hit! Health ${Math.round(W.hp)}. Hide to recover.`);}}}
/* guards that are knocked out skip their normal update */
function runNoArrest(g){return !!(RT.on&&(W.stars>=3||g.stunT>0||RT.dead));}
function isDown(g){if(g.stunT>0){if(g.icon)g.icon.sp.visible=true;return true;}if(!(g.down>0))return false;g.cone.piv.visible=false;if(g.icon)g.icon.sp.visible=false;return true;}
/* ---- how you left a zone decides where you can go next ---- */
const EXITS={flight:{title:'Flight caught! ✈',text:'Clean exit. You land in a new city: wanted cleared, double cash, +1 dart. Rana loses your trail for now.',cash:2,next:['port','airport'],via:{port:'Fly to Goa →',airport:'Fly to Delhi →'}},
  jump:{title:'Jumped the train!',text:'You roll into the dark fields by the highway. Ground route only.',cash:1,next:['bus','port'],via:{bus:'Hitch to the bus stand →',port:'Hitch a truck to the docks →'}},
  station:{title:'Walked out with the crowd',text:'Clean exit at the station. Nobody looked twice. +50% cash, wanted cleared.',cash:1.5,next:['airport','bus','port'],via:{airport:'Cab to the airport →',bus:'Walk to the bus stand →',port:'Local train to the docks →'}},
  truck:{title:'Hid in a truck',text:'You skipped the police checkpost in the back of a cargo truck. It is heading for the coast.',cash:.8,next:['port','train'],via:{port:'Ride to the docks →',train:'Jump off near a station →'}},
  city:{title:'Through the checkpost',text:'The bus rolls into the city. Clean pass: +50% cash, wanted cleared.',cash:1.5,next:['airport','train','port'],via:{airport:'Auto to the airport →',train:'Walk to the station →',port:'Bus to the docks →'}},
  ship:{title:'Aboard the cargo ship',text:'The ship slips out at 4 AM. You step off two days later on a quiet coast. +50% cash, wanted cleared.',cash:1.5,next:['airport','train','bus'],via:{airport:'Land in Kochi → airport',train:'Land in Kochi → station',bus:'Land in Kochi → bus stand'}},
  boat:{title:'Stole a speedboat!',text:'Loud, fast and messy. You beach it up the coast with the police boats far behind.',cash:.8,next:['bus','train'],via:{bus:'Run to the highway →',train:'Run to a small station →'}},
  taxi:{title:'Out by taxi',text:'The airport is behind you, but every flight is watched now. Ground route only.',cash:1,next:['train','bus'],via:{train:'Taxi to the station →',bus:'Taxi to the bus stand →'}}};
/* ---- end of a zone: next leg or run over ---- */
function runEnd(win,who,why){if(!RT.on)return false;RT.on=false;S.phase='over';locked=true;if(dartBtn){dartBtn.sw.remove();dartBtn.remove();}['#wantedHud'].forEach(q=>{const e=document.querySelector(q);if(e)e.remove();});RUN.wanted=Math.max(0,W.stars-1);RUN.kills=(RUN.kills||0)+W.kills;
  ['#hud','#pads','#joy','#map'].forEach(s=>{const e=$(s);if(e)e.hidden=true;});banner(null);
  const nCam=S.camsSeen?S.camsSeen.size:0;RUN.lh.cams+=nCam;
  const legScore=win?Math.round(100+RUN.leg*40+(S.alerts?0:60)+Math.max(0,S.timeLeft)|0):0;const cash=win?40000+RUN.leg*15000:0;
  RUN.legs.push({zone:ZONE_ID,win,traces:S.traces.length,alerts:S.alerts});
  const EX=RT.exit&&EXITS[RT.exit];if(EX&&win){RUN.cash+=cash*(EX.cash-1);if(RT.exit==='flight'){RUN.lh.flight++;W.stars=0;RUN.wanted=0;RUN.darts++;}if(RT.exit==='station'||RT.exit==='city'||RT.exit==='ship'){W.stars=0;RUN.wanted=0;}}
  if(win){RUN.score+=legScore;RUN.cash+=cash;const opts=(EX?shuffle(EX.next).slice(0,2):nextZones(ZONE_ID)).map(z=>({z,mods:rollMods(RUN.leg+1)}));RUN.offer=opts;saveRun(RUN);
    const c=sheet(`<div class="eyebrow">ESCAPE · LEG ${RUN.leg} CLEARED</div><h2>${EX?EX.title:'Escaped!'}</h2>${EX?`<p>${EX.text}</p>`:''}
      <div class="stats"><div class="stat"><span>Score</span><b>${RUN.score}</b></div><div class="stat"><span>Run cash</span><b>${inr(RUN.cash)}</b></div><div class="stat"><span>Darts / Ammo</span><b>${RUN.darts} / ${RUN.ammo}</b></div></div>${RUN.wanted?`<p class="eyebrow" style="color:#ffd166">WANTED ${'★'.repeat(RUN.wanted)} carries into the next zone</p>`:''}
      <p>${RT.exit==='flight'?'Where to?':'Rana is right behind you. Pick your next route:'}</p>
      ${opts.map((o,i)=>`<button class="btn" type="button" data-i="${i}" style="background:${ZONES[o.z].col};text-align:left;line-height:1.25">${EX&&EX.via[o.z]?EX.via[o.z]:ZONES[o.z].name+' →'}<br><span style="font:500 12px var(--type,monospace);opacity:.9">${EX&&EX.via[o.z]?ZONES[o.z].name:ZONES[o.z].sub}${o.mods.length?' · ⚠ '+o.mods.map(k=>MODS[k].name).join(', '):' · no hazards'}</span></button>`).join('')}
      <button class="btn alt" type="button" id="bank">Lie low here (bank the cash)</button>`);
    c.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const o=opts[+b.dataset.i];RUN.leg++;RUN.zone=o.z;RUN.mods=o.mods;if(RUN.leg%3===0)RUN.darts++;RUN.ammo=(RUN.ammo||0)+2;saveRun(RUN);location.href=ZONES[o.z].url;if(o.z==='airport'&&ZONE_ID==='airport')location.reload();});
    c.querySelector('#bank').onclick=()=>runOver(true);}
  else{RUN.dead={who:who||null,why:why||null};runOver(false);}
  return true;}
function runOver(banked){const r=RUN;r.active=false;saveRun(r);
  for(const k in r.lh)HUNTER.habits[k]=(HUNTER.habits[k]||0)*.6+r.lh[k];HUNTER.runs++;
  const legsDone=r.legs.filter(l=>l.win).length;HUNTER.best=Math.max(HUNTER.best||0,legsDone);
  const top=Object.keys(habitNorm).map(k=>[k,(r.lh[k]||0)/habitNorm[k]]).sort((a,b)=>b[1]-a[1])[0];
  const learned=top&&top[1]>=.5?top[0]:null;wjson(HKEY,HUNTER);
  const kept=banked?r.cash:Math.round(r.cash*.25);CAREER.money+=kept;CAREER.bestRun=Math.max(CAREER.bestRun||0,legsDone);CAREER.missions=(CAREER.missions||0)+1;saveCareer();
  const c=sheet(`<div class="eyebrow">ESCAPE · RUN OVER</div><h2 style="color:${banked?'var(--good)':'var(--red)'}">${banked?'Vanished!':(r.dead&&/^Shot by/.test(r.dead.why||'')?'Shot down':'Caught')}</h2>
    <p>${banked?'You slipped out of the city. Rana came up empty.':esc(r.dead&&r.dead.who?'Caught by '+r.dead.who+'.':(r.dead&&r.dead.why)||'Rana wins. This time.')}</p>
    <div class="stats"><div class="stat"><span>Legs cleared</span><b>${legsDone}</b></div><div class="stat"><span>Score</span><b>${r.score}</b></div><div class="stat"><span>Cash earned</span><b>${inr(kept)}</b></div></div>
    <p class="eyebrow">BEST RUN: ${HUNTER.best} LEGS · RANA HAS SEEN ${HUNTER.runs} RUNS</p>
    ${learned?`<div class="dossier"><h3>Inspector Rana's notes</h3><p style="margin:6px 0 0;color:#1b1b1b">"Wo ${HABITS[learned].t}. Agli baar taiyaar rahunga."</p><span class="stampx">NOTED</span></div>`:''}
    <ul class="traces">${r.legs.map((l,i)=>`<li class="${l.win?'ok':''}">Leg ${i+1} · ${ZONES[l.zone].name} · ${l.win?'cleared':'failed'} · ${l.traces} traces</li>`).join('')}</ul>
    <button class="btn" id="again" type="button" style="background:#e0242b">New run</button><a class="btn alt" href="index.html">Safehouse</a>`);
  c.querySelector('#again').onclick=startNewRun;}
window.__run={W,gateOpen:()=>gateOpen(),switchWpn:()=>switchWpn(),shootGun:()=>shootGun(),addStars:(n)=>addStars(n,'test'),runEnd:(...a)=>runEnd(...a),shootDart:()=>shootDart(),get RUN(){return RUN;},HUNT,RT};
/*RUN-END*/
