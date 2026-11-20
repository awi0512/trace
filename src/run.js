/*RUN-BEGIN*/
/* ===================== ESCAPE MODE: endless run + Inspector Rana (shared by every zone page) =====================
   Edit src/run.js only: scripts/sync-run.py copies this block into index.html and src/train.js. */
const RKEY='trace_run',HKEY='trace_hunter';
const ZONES={airport:{url:'index.html#bhaag',name:'Airport',sub:'Terminal, security, boarding gates',col:'#e0242b'},train:{url:'train.html',name:'Night Train',sub:'3 platforms, overbridge, sleeper train',col:'#1f4f9a'},
  bus:{url:'bus.html',name:'Highway Bus',sub:'Bus stand, dhaba, police checkpost',col:'#d35400'},port:{url:'port.html',name:'Docks',sub:'Containers, searchlights, cargo ship',col:'#2fa37a'},
  plane:{url:'flight.html',name:'Flight',sub:'Cabin, air marshal, immigration',col:'#6d4bd6',special:true}};
const GROUND=Object.keys(ZONES).filter(z=>!ZONES[z].special);
const MODS={blackout:{name:'Blackout',d:'Power cuts on and off. CCTV goes dark, guards see less.',good:true},
  traitor:{name:'Traitor',d:'Someone will sell your look to the police. No idea when.'},
  rush:{name:'Rush',d:'30% less time.'},
  alert:{name:'High alert',d:'Guards see further.'},
  patrol:{name:'Rana on site',d:'Inspector Rana is patrolling this zone himself. He knows your old photo.'}};
const HABITS={run:{t:'bhaagti hai',c:'Guards now suspect runners instantly.'},crowd:{t:'bheed mein chhupti hai',c:'Guards now watch crowds closely.'},
  disguise:{t:'kapde badalti hai',c:'A new look reaches every radio in 30 seconds.'},dart:{t:'dart chalaati hai',c:'Darted guards wake up faster.'},
  cams:{t:'CCTV ke saamne aati hai',c:'Cameras see further.'},flight:{t:'hamesha flight pakadti hai',c:'Airports get extra eyes.'},upi:{t:'UPI se paise deti hai',c:'He reads bank records: phone pings come faster.'}};
function rjson(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
function wjson(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
const getRun=()=>rjson(RKEY),saveRun=r=>wjson(RKEY,r);
const getHunter=()=>{const h=Object.assign({runs:0,best:0,learned:[]},rjson(HKEY)||{});h.habits=Object.assign({run:0,crowd:0,disguise:0,dart:0,cams:0,flight:0,upi:0},h.habits||{});return h;};
const ZONE_ID=(()=>{const f=(location.pathname.split('/').pop()||'index.html').replace('.html','');return f==='train'||f==='bus'||f==='port'?f:f==='flight'?'plane':'airport';})();
const RUN=(()=>{const r=getRun();if(!r||!r.active||r.zone!==ZONE_ID)return null;if(ZONE_ID==='airport'&&location.hash!=='#bhaag')return null;return r;})();
const HUNTER=getHunter();
/* the world remembers: violence in a zone raises its security in later runs, and makes the news */
const WKEY='trace_world';
const getWorld=()=>{const w=Object.assign({zones:{},news:[]},rjson(WKEY)||{});for(const z of Object.keys(ZONES))w.zones[z]=w.zones[z]||0;return w;};
const WORLD=getWorld();
const secLevel=z=>{const v=WORLD.zones[z]||0;return v>=8?3:v>=4?2:v>=1.5?1:0;};
const SEC_NAMES=['Normal','Tight','High','Lockdown'];
/* what Rana has learned: the counters active in this run (chosen at run start from the strongest habits) */
const HUNT={run:1,crowd:.3,cam:1,g:1,dartT:25,disguise:false};
if(RUN){for(const k of RUN.counters||[]){if(k==='run')HUNT.run=1.8;if(k==='crowd')HUNT.crowd=.7;if(k==='cams')HUNT.cam=1.35;if(k==='disguise')HUNT.disguise=true;if(k==='dart')HUNT.dartT=15;}
  HUNT.g=1+Math.min(.6,(RUN.leg-1)*.07+HUNTER.runs*.02);}
const habitNorm={run:60,crowd:90,disguise:3,dart:3,cams:8,flight:2,upi:3};
function pickCounters(){const h=HUNTER.habits;return Object.keys(habitNorm).map(k=>[k,(h[k]||0)/habitNorm[k]]).filter(x=>x[1]>=1).sort((a,b)=>b[1]-a[1]).slice(0,Math.min(3,1+Math.floor(HUNTER.runs/3))).map(x=>x[0]);}
function rollMods(leg){const n=leg<=1?0:leg<=3?1:leg<=6?2:3;return shuffle(Object.keys(MODS)).slice(0,n);}
function nextZones(cur){return shuffle(GROUND.filter(z=>z!==cur)).slice(0,2);}
function newRun(){const counters=pickCounters();for(const k in WORLD.zones)WORLD.zones[k]=+(WORLD.zones[k]*.75).toFixed(2);wjson(WKEY,WORLD);const z=pick(GROUND);
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
  if(ZONE_ID==='airport'&&typeof GATES!=='undefined'&&Math.random()<.6)RT.gcT=rnd(50,110);
  if(HUNT.cam!==1&&typeof CAMS!=='undefined')CAMS.forEach(c=>{c.range*=HUNT.cam;});
  if(ZONE_ID==='airport'&&(RUN.counters||[]).includes('flight'))G.forEach(g=>{g.range*=1.2;});
  const sec=secLevel(ZONE_ID);if(sec>=1)G.forEach(g=>{g.range*=1+sec*.1;});if(sec>=2)G.forEach(g=>{g.walk=(g.walk||1.1)*1.1;});if(sec>=3)W.shootAt=2;
  const hl=WORLD.news.filter(n=>n.zone===ZONE_ID).slice(-1)[0];if(sec>=1||hl)setTimeout(()=>{if(RT.on)newsFlash(hl?hl.text:null,sec);},1800);
  if(RUN.lh.flight===undefined)RUN.lh.flight=0;
  if(!(typeof TUT!=='undefined'&&TUT)){dartUI();gunUI();phoneUI();}
  const lines=[`ESCAPE · LEG ${RUN.leg} · ${ZONES[ZONE_ID].name.toUpperCase()}`];
  mods.forEach(k=>lines.push('⚠ '+MODS[k].name+': '+MODS[k].d));
  (RUN.counters||[]).forEach(k=>lines.push('RANA: "Wo '+HABITS[k].t+'." → '+HABITS[k].c));
  lines.forEach((l,i)=>setTimeout(()=>{if(RT.on)toast(l,i===0?'info':'bad');},400+i*2600));
  setTimeout(spawnContact,rnd(15000,40000));}
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
  updDarts(dt);updGun(dt);checkLock();phoneTick(dt);
  if(RT.gcT>0){RT.gcT-=dt;if(RT.gcT<=0&&S.phase==='play'){const old=MYGATE;MYGATE=pick(GATES.filter(g=>g!==old));const sw={code:MYGATE.code,dest:MYGATE.dest};Object.assign(MYGATE,{code:old.code,dest:old.dest});Object.assign(old,sw);setGateSign(old);setGateSign(MYGATE);S.gateChanged=true;drawBoard();sfx.chime();vib([60,40,60]);
    banner(`GATE CHANGE! ${MYGATE.code} ${MYGATE.dest} now boards at Gate ${MYGATE.n}`,true);setTimeout(()=>{if(RT.on)banner(null);},6000);toast(`Announcement: "${MYGATE.code} ${MYGATE.dest} ab Gate ${MYGATE.n} se jaayegi."`,'info');}}}
/* ---- airport: any alert, gunshot or found body locks the gates. No flight; leave by taxi (train or bus next) ---- */
function checkLock(){if(ZONE_ID!=='airport'||RT.lock)return;if(S.alerts>0||W.stars>0||RT.body){RT.lock=true;sfx.alert();vib([120,60,120]);
  banner('AIRPORT LOCKDOWN! Gates closed. No flight now: get out via the taxi stand',true);setTimeout(()=>{if(RT.on)banner(null);},7000);toast('Announcement: "Security alert. Saari flights hold pe hain."');drawGun();}}
const gateOpen=()=>!RT.lock;
const runClean=()=>RT.on&&S.alerts===0&&W.stars===0&&!RT.body;
/* ---- behoshi dart pistol ---- */
let dartBtn=null;
function dartUI(){if(dartBtn||!RUN)return;const st=document.createElement('style');st.textContent='body.talking #dartBtn,body.talking #wpnSwitch,body.talking #wantedHud{display:none!important}';document.head.appendChild(st);if(!RUN.wmode)RUN.wmode='dart';dartBtn=document.createElement('button');dartBtn.type='button';dartBtn.id='dartBtn';
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
const W={shootAt:3,hp:100,hitT:99,stars:0,shots:0,kills:0,cd:0,ui:null,fx:[]};
function gunUI(){if(W.ui||!RUN)return;if(RUN.ammo===undefined)RUN.ammo=6;W.stars=RUN.wanted||0;
  const h=document.createElement('div');h.id='wantedHud';h.style.cssText='position:fixed;right:16px;top:calc(140px + env(safe-area-inset-top));z-index:30;background:#111;color:#fff;border-radius:999px;padding:5px 12px;font:700 13px "Space Grotesk",sans-serif;display:flex;gap:10px;align-items:center;pointer-events:none';
  document.body.appendChild(h);W.ui=h;const v=document.createElement('div');v.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:29;box-shadow:inset 0 0 120px 40px rgba(224,36,43,.75);opacity:0;transition:opacity .25s';document.body.appendChild(v);W.vig=v;drawGun();}
function drawGun(){if(!W.ui)return;drawDartBtn();
  W.ui.innerHTML=`<span style="color:#ffd166;letter-spacing:1px">${'★'.repeat(W.stars)}<span style="opacity:.3">${'★'.repeat(5-W.stars)}</span></span>${ZONE_ID==='airport'?`<span style="color:${RT.lock?'#ff6a5a':'#2fe39a'}">✈ ${RT.lock?'LOCKED':'OPEN'}</span>`:''}<span style="display:inline-block;width:70px;height:8px;background:#333;border-radius:4px;overflow:hidden"><i style="display:block;height:100%;width:${W.hp}%;background:${W.hp>50?'#2fe39a':W.hp>25?'#f5b82e':'#e0242b'}"></i></span>`;}
function addStars(n,why){const before=W.stars;W.stars=Math.min(5,W.stars+n);if(W.stars>before){toast(`WANTED ${'★'.repeat(W.stars)} · ${why}`);if(W.stars>=W.shootAt&&before<W.shootAt){banner(`${W.shootAt}★ WANTED: police will shoot on sight!`,true);setTimeout(()=>banner(null),5000);}}drawGun();}
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
  if(W.stars<W.shootAt||locked)return;
  const F=(()=>{try{return typeof flags==='function'?flags():playerFlags();}catch(e){return {};}})();
  for(const g of G){if(g.down>0||g.dead||!g.g.visible||g.state!=='alert'||g.smell)continue;if(g.area&&S.area&&g.area!==S.area)continue;
    g.fireT=(g.fireT===undefined?rnd(.6,1.4):g.fireT)-dt;const d=canSee(g,P.pos.x,P.pos.z);if(!d||d>13){continue;}
    if(g.fireT>0)continue;g.fireT=rnd(1.3,2.2)-W.stars*.15;bang();tracer(g.pos,P.pos,0xff6a5a);
    let pHit=.38+(W.stars-3)*.1;if(P.running||F.running)pHit*=.65;if(F.crowd>=2)pHit*=.6;if(d>9)pHit*=.7;
    if(Math.random()<pHit){const dmg=ri(18,32);W.hp-=dmg;W.hitT=0;W.vig.style.opacity=1;setTimeout(()=>W.vig.style.opacity=0,260);vib([60,30,60]);drawGun();
      if(W.hp<=0){W.hp=0;drawGun();toast('You were shot...');setTimeout(()=>runEnd(false,null,`Shot by ${g.name}. At ${W.stars}★ the police don\'t ask questions.`),900);RT.dead=true;locked=true;P.g.rotation.x=-Math.PI/2;P.g.position.y=.25;return;}
      else toast(`Hit! Health ${Math.round(W.hp)}. Hide to recover.`);}}}
/* fair stops: a correct answer always lets you go, unless you were caught red-handed or still look exactly like the wanted photo */
async function judge(g,ok,redHanded){if(redHanded===undefined)redHanded=S.wanted===lookKey();
  if(!ok){await say(g.name,'Ye naam record se match nahi karta. Chalo!');return false;}
  if(redHanded){await say(g.name,'Naam sahi hoga, par tumhe abhi kuch galat karte dekha gaya hai. Chalo!');return false;}
  if(g.knows&&lookKey()===S.startLook){await say(g.name,'Naam to sahi hai… par ye chehra aur ye kapde photo wale hain. Chalo!');toast('Tip: pehle look badlo (shop / washroom). Photo wale guard tumhara purana hulia pehchaante hain.','info');return false;}
  return true;}
/* guards that are knocked out skip their normal update */
function runNoArrest(g){return !!(RT.on&&(W.stars>=W.shootAt||g.stunT>0||RT.dead));}
function isDown(g){if(g.stunT>0){if(g.icon)g.icon.sp.visible=true;return true;}if(!(g.down>0))return false;g.cone.piv.visible=false;if(g.icon)g.icon.sp.visible=false;return true;}
/* ---- strangers: a random contact offers a deal. Most are honest; some sell you out. Watch for the tell. ---- */
const DEALS=[
  {id:'id',pitch:'Nakli ID card. Naya naam, naya chehra record mein. Tumhari purani photo kisi kaam ki nahi rahegi.',label:'Fake ID',cost:30000,
   apply(){S.startLook='__none__';S.wanted=null;G.forEach(g=>{g.knows=false;if(g.state!=='alert'){g.sus=0;g.state='patrol';}});toast('Fake ID: guards no longer match your old photo.','good');}},
  {id:'ammo',pitch:'Teen goliyan. Saaf maal, koi number nahi.',label:'+3 bullets',cost:20000,apply(){RUN.ammo=(RUN.ammo||0)+3;drawDartBtn();toast('+3 bullets.','good');}},
  {id:'darts',pitch:'Do behoshi wale dart. Hospital ka maal hai.',label:'+2 darts',cost:20000,apply(){RUN.darts+=2;drawDartBtn();toast('+2 darts.','good');}},
  {id:'shift',pitch:'Guards ki shift badal rahi hai. Agle ek minute sab thake hue honge, door tak nahi dekhenge.',label:'Shift change tip',cost:15000,
   apply(){G.forEach(g=>{g._sr=g.range;g.range*=.7;});setTimeout(()=>G.forEach(g=>{if(g._sr)g.range=g._sr;}),60000);toast('Guards see less for 60 seconds.','good');}},
  {id:'wipe',pitch:'Mera bhai CCTV room mein hai. Tumhari do recordings delete ho jaayengi.',label:'Wipe 2 traces',cost:25000,apply(){S.traces.splice(0,2);S.photos.splice(0,2);toast('Two traces wiped.','good');}},
  {id:'heal',pitch:'First-aid kit. Patti, dard ki goli.',label:'Full health',cost:10000,apply(){W.hp=100;drawGun();toast('Health restored.','good');}}];
const CT={npc:null,used:false,traitor:false,deal:null};
function spawnContact(){if(!RT.on||CT.npc||RUN.leg<2||!P||Math.random()>.65)return;
  let x=P.pos.x,z=P.pos.z;for(let i=0;i<12;i++){const a=rnd(0,6.28),d=rnd(3,6);const q={x:P.pos.x+Math.sin(a)*d,z:P.pos.z+Math.cos(a)*d};const c={x:q.x,z:q.z};collide(c);if(Math.hypot(c.x-q.x,c.z-q.z)<.01&&!losBlocked(P.pos.x,P.pos.z,c.x,c.z)){x=c.x;z=c.z;break;}}
  const look={body:pick([0x3b3b3b,0x6b4f3a,0x2e4a3a]),legs:0x222222,skin:pick([0x8f5d3e,0xc68b5e,0x6b4428]),hair:0x111111,mustache:Math.random()<.6,cap:Math.random()<.5?0x111111:undefined,capPeak:0x111111};
  const n=chibi(look);n.pos.set(x,0,z);n.beh='idle';n.inArea=S.area;n.reg='hall';n.walk=1;n.wait=999;NPC.push(n);CT.npc=n;
  const mk=new T.Mesh(new T.OctahedronGeometry(.22),new T.MeshBasicMaterial({color:0x2fe39a,toneMapped:false}));mk.position.y=2.35;n.g.add(mk);CT.mk=mk;
  const tr=.25+Math.min(.2,HUNTER.runs*.02)+(RUN.mods||[]).includes('traitor')*.15;CT.traitor=Math.random()<tr;CT.deal=pick(DEALS.filter(d=>!(d.id==='heal'&&W.hp>=100)));
  inter({area:S.area,label:'Talk to the stranger',r:1.9,on:()=>!CT.used&&RT.on,pos:()=>[CT.npc.pos.x,CT.npc.pos.z],run:talkContact});
  toast('Someone is watching you… and waving you over (green marker).','info');}
async function talkContact(){if(CT.used)return;locked=true;const d=CT.deal;const who='Ajnabi';
  await say(who,'Psst. Idhar. Tumhari photo har radio pe hai. Main madad kar sakta hoon… kuch paison mein.');
  const tell=CT.traitor?Math.random()<.6:Math.random()<.15;
  if(tell)await say('',pick(['(Wo baar baar phone dekh raha hai.)','(Uski nazar ek guard pe jaa ke ruk jaati hai.)','(Uske haath kaanp rahe hain.)','(Wo bahut jaldi mein hai.)']),true);
  await say(who,d.pitch);
  const can=RUN.cash>=d.cost;
  let r=await choose([{label:`Deal: ${d.label} · cash`,sub:`${inr(d.cost)} from run cash (${inr(RUN.cash)})`,value:'yes',disabled:!can},{label:`Deal: ${d.label} · UPI`,sub:'No cash needed, but the bank keeps a record',value:'upi'},{label:'No thanks',sub:'Walk away',value:'no'},{label:'Who sent you?',sub:'Test him',value:'ask'}]);
  if(r==='upi'){upiPay(`Ajnabi (${d.label})`,d.cost);r='paid';}
  if(r==='ask'){await say(who,CT.traitor?pick(['Koi nahi! Matlab… Ismail bhai ne. Haan, Ismail bhai.','Sawaal mat karo. Lena hai ya nahi?']):pick(['Rana ka dushman tumhara dost. Bas itna samjho.','Kisi ne nahi. Main bhi kabhi bhaaga tha.']));
    const r2=await choose([{label:`Deal: ${d.label} · cash`,sub:inr(d.cost),value:'yes',disabled:!can},{label:`Deal: ${d.label} · UPI`,sub:'Bank record',value:'upi'},{label:'No thanks',value:'no'}]);if(r2==='upi'){upiPay(`Ajnabi (${d.label})`,d.cost);r='paid';}else if(r2!=='yes'){CT.used=true;closeDlg();locked=false;CT.mk.visible=false;return;}}
  else if(r!=='yes'&&r!=='paid'){CT.used=true;closeDlg();locked=false;CT.mk.visible=false;
    if(CT.traitor&&Math.random()<.4){toast('He walks off… straight to a guard.');setTimeout(betray,6000);}return;}
  CT.used=true;if(r!=='paid')RUN.cash-=d.cost;closeDlg();locked=false;CT.mk.visible=false;sfx.ok&&sfx.ok();
  if(CT.traitor){d.id==='id'||d.id==='wipe'||d.id==='shift'?toast('Deal done. (Did it work…?)','info'):d.apply();setTimeout(betray,rnd(8000,14000));}else d.apply();}
function betray(){if(!RT.on)return;S.wanted=lookKey();G.forEach(g=>{if(g.state!=='alert'){g.state='search';g.lastSeen=[P.pos.x+rnd(-4,4),P.pos.z+rnd(-4,4)];g.searchT=12;g.sus=Math.max(g.sus,60);}});
  sfx.alert();vib([80,40,80]);banner('BETRAYED! The stranger sold you out. Police know your look. Change it!',true);setTimeout(()=>{if(RT.on)banner(null);},6000);if(S.traces.length<12)trace('Ek ajnabi ne police ko tumhara hulia bataya');}
/* ---- the phone: handler chats, location (map vs. tower pings), unknown calls (help or police trap), silent mode, UPI log ---- */
const PH={el:null,btn:null,open:false,tab:'chats',msgs:[],unread:0,pingT:0,callAt:0,ring:null,ringT:0};
const TIPS={airport:['Departure board pe apni flight dekhte rehna. Gate badal sakta hai.','Saaf nikli to flight. Garbar hui to lockdown, phir sirf taxi.'],
  train:['TC aage (S1) se peeche aata hai. Berth pe baithi ho to kam shak karta hai.','Overbridge pe neeche wale guard tumhe nahi dekhte. Lift sabse chhupi hai.'],
  bus:['Naka pe police photo check karti hai. Dhabe pe dupatta-chashma ki dukaan hai.','Dhabe ke peeche Goa wala truck naka skip karta hai.'],
  port:['Sniffer kutte ~75 sec baad chhodte hain. Deewar ke peeche bhi soongh lete hain.','East quay pe speedboat hai. Shor hoga, par pass nahi chahiye.'],
  plane:['Air marshal peeche galley se aisle dekhta hai. ~45 sec baad lavatory jaata hai.','Aage galley mein crew jacket latki hai.']};
function phoneMsg(from,text,me){PH.msgs.push({from,text,me,t:clockS?clockS():''});if(!me&&!PH.open){PH.unread++;vib(30);if(!RUN.phone.silent)tone(1320,.08,'sine',.08);}drawPhone();}
function upiPay(to,amt){RUN.phone.upi=(RUN.phone.upi||[]).concat([{to,amt}]).slice(-8);RUN.lh.upi=(RUN.lh.upi||0)+1;if(S.traces.length<14)trace(`UPI: ${to} ko ${inr(amt)}`);toast(`UPI: ${inr(amt)} paid to ${to}. Bank record ban gaya.`,'info');}
function phoneUI(){if(PH.el||!RUN)return;RUN.phone=Object.assign({loc:true,silent:false,upi:[]},RUN.phone||{});
  const b=document.createElement('button');b.type='button';b.id='phoneBtn';b.style.cssText='position:fixed;left:16px;bottom:calc(250px + env(safe-area-inset-bottom));z-index:30;width:52px;height:52px;border-radius:14px;border:3px solid #111;background:#1d2340;color:#fff;font:700 22px/1 sans-serif;box-shadow:0 3px 0 #111;touch-action:manipulation';
  b.innerHTML='📱<span id="phBadge" style="position:absolute;top:-8px;right:-8px;min-width:20px;height:20px;border-radius:10px;background:#e0242b;color:#fff;font:700 12px/20px sans-serif;display:none">0</span>';
  b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();togglePhone();});document.body.appendChild(b);PH.btn=b;
  const el=document.createElement('div');el.id='phone';el.style.cssText='position:fixed;z-index:40;left:50%;top:50%;translate:-50% -50%;width:min(88vw,320px);height:min(78vh,540px);background:#0e1018;border:6px solid #111;border-radius:28px;box-shadow:0 10px 0 #111,0 0 0 2px #333;color:#eee;font:14px/1.35 "Space Grotesk",sans-serif;display:none;flex-direction:column;overflow:hidden';
  el.addEventListener('pointerdown',e=>e.stopPropagation());document.body.appendChild(el);PH.el=el;
  const st=document.createElement('style');st.textContent='body.talking #phoneBtn{display:none}#phone .tb{flex:1;padding:8px 0;background:none;border:0;color:#aaa;font:700 12px "Space Grotesk",sans-serif;border-bottom:3px solid transparent}#phone .tb.on{color:#fff;border-color:#2fe39a}#phone .msg{max-width:82%;padding:7px 10px;border-radius:12px;margin:6px 0;background:#1f2a44}#phone .msg.me{margin-left:auto;background:#0f5c3a}#phone .tg{display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid #222}#phone .sw{width:52px;height:28px;border-radius:14px;border:0;font:700 11px sans-serif}';document.head.appendChild(st);
  addEventListener('keydown',e=>{if(e.code==='KeyP')togglePhone();});
  phoneMsg('Handler',`Naya zone: ${ZONES[ZONE_ID].name}. ${pick(TIPS[ZONE_ID]||['Shaant raho.'])}`);
  if(RUN.phone.loc&&!RUN.phone.warned){RUN.phone.warned=true;setTimeout(()=>{if(RT.on)phoneMsg('Handler','Ek baat: tumhare phone ki LOCATION on hai. Rana tower se ping karta hai. Settings mein band kar do (par phir map nahi dikhega).');},5000);}
  PH.pingT=rnd(35,50);PH.callAt=Math.random()<.65?rnd(25,80):-1;applyLoc();}
function togglePhone(){if(!PH.el)return;PH.open=!PH.open;PH.el.style.display=PH.open?'flex':'none';if(PH.open){PH.unread=0;}drawPhone();}
function applyLoc(){const m=document.getElementById('map');if(m)m.style.visibility=RUN.phone.loc?'':'hidden';if(typeof trailMesh!=='undefined')trailMesh.visible=!!RUN.phone.loc;}
function drawPhone(){if(!PH.el)return;const bd=document.getElementById('phBadge');if(bd){bd.style.display=PH.unread?'block':'none';bd.textContent=PH.unread;}if(!PH.open)return;const ph=RUN.phone;
  const tabs=`<div style="display:flex;background:#151a28">${[['chats','Chats'],['set','Settings'],['upi','UPI']].map(([k,l])=>`<button class="tb ${PH.tab===k?'on':''}" data-t="${k}">${l}</button>`).join('')}</div>`;
  let body='';
  if(PH.tab==='chats')body=`<div style="flex:1;overflow:auto;padding:8px 12px">${PH.msgs.map(m=>`<div class="msg ${m.me?'me':''}"><b style="font-size:11px;color:#2fe39a">${esc(m.from)}</b><br>${esc(m.text)}</div>`).join('')||'<p style="opacity:.6">No messages.</p>'}</div>`;
  else if(PH.tab==='set')body=`<div style="flex:1;overflow:auto"><div class="tg"><div><b>Location</b><br><span style="font-size:12px;opacity:.7">ON: map + trail work, but Rana pings your phone. OFF: hidden, no map.</span></div><button class="sw" data-k="loc" style="background:${ph.loc?'#2fe39a':'#444'}">${ph.loc?'ON':'OFF'}</button></div>
    <div class="tg"><div><b>Silent</b><br><span style="font-size:12px;opacity:.7">Ringing phones make noise near guards. Silent = no ring, only vibration.</span></div><button class="sw" data-k="silent" style="background:${ph.silent?'#2fe39a':'#444'}">${ph.silent?'ON':'OFF'}</button></div></div>`;
  else body=`<div style="flex:1;overflow:auto;padding:12px"><p style="opacity:.7;font-size:12px">Har UPI payment bank mein record hota hai. Rana ye records padhta hai.</p>${(ph.upi||[]).map(u=>`<div class="tg"><span>${esc(u.to)}</span><b>−${inr(u.amt)}</b></div>`).join('')||'<p style="opacity:.6">No payments yet.</p>'}</div>`;
  PH.el.innerHTML=`<div style="display:flex;justify-content:space-between;padding:10px 16px 6px;font:700 12px sans-serif"><span>${clockS?clockS():''}</span><span>${ph.loc?'📍 ':''}4G ▮▮▮</span></div>${tabs}${body}<button type="button" id="phClose" style="margin:8px auto 12px;width:46px;height:6px;border-radius:3px;border:0;background:#888"></button>`;
  PH.el.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{PH.tab=b.dataset.t;drawPhone();});
  PH.el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ph[b.dataset.k]=!ph[b.dataset.k];saveRun(RUN);applyLoc();drawPhone();toast(b.dataset.k==='loc'?(ph.loc?'Location ON: map back, but Rana can ping you.':'Location OFF: no map, no pings.'):(ph.silent?'Silent mode on.':'Ringer on.'),'info');});
  PH.el.querySelector('#phClose').onclick=togglePhone;}
function phoneTick(dt){if(!PH.el||RT.dead)return;
  if(RUN.phone.loc){PH.pingT-=dt;if(PH.pingT<=0){PH.pingT=rnd(40,55)-(RUN.counters||[]).includes('upi')*12;const near=G.filter(g=>g.g.visible&&!g.down&&g.state!=='alert'&&(!g.area||g.area===S.area)).sort((a,b)=>Math.hypot(a.pos.x-P.pos.x,a.pos.z-P.pos.z)-Math.hypot(b.pos.x-P.pos.x,b.pos.z-P.pos.z)).slice(0,2);
    near.forEach(g=>{g.state='search';g.lastSeen=[P.pos.x+rnd(-4,4),P.pos.z+rnd(-4,4)];g.searchT=10;g.sus=Math.max(g.sus,40);});vib([40,30,40]);toast('📍 Rana pinged your phone! Guards are checking the area. (Phone → Settings → Location)');if(!PH.pinged){PH.pinged=true;if(S.traces.length<14)trace('Phone location: mobile tower ping');}}}
  if(PH.callAt>0&&playing()){PH.callAt-=dt;if(PH.callAt<=0){PH.callAt=-1;incoming();}}
  if(PH.ring){PH.ringT-=dt;if(!RUN.phone.silent){if((PH.rt=(PH.rt||0)-dt)<=0){PH.rt=1.1;tone(880,.25,'square',.06);tone(660,.25,'square',.06,.3);}
      for(const g of G){if(!g.g.visible||g.down>0||g.state==='alert'||g.area&&g.area!==S.area)continue;if(Math.hypot(g.pos.x-P.pos.x,g.pos.z-P.pos.z)<9){g.sus=Math.min(99,g.sus+18*dt);g.lastSeen=[P.pos.x,P.pos.z];if(g.state==='patrol'&&g.sus>35)g.state='sus';}}}
    if(PH.ringT<=0)endCall('missed');}}
function incoming(){const trap=Math.random()<.45;const who=trap?pick(['Unknown +91 98','Bank Helpline','Courier']):Math.random()<.7?'Handler':'Unknown +91 70';PH.ring={trap,who};PH.ringT=8;vib([200,100,200,100,200]);
  const d=document.createElement('div');d.id='callBar';d.style.cssText='position:fixed;z-index:41;left:50%;translate:-50% 0;top:calc(env(safe-area-inset-top,0px) + 12px);width:min(92vw,360px);background:#111;color:#fff;border-radius:18px;padding:10px 12px;display:flex;align-items:center;gap:10px;box-shadow:0 6px 0 #000;font:700 14px "Space Grotesk",sans-serif';
  d.innerHTML=`<span style="font-size:22px">📞</span><span style="flex:1">${esc(who)}<br><span style="font:500 11px sans-serif;opacity:.7">${RUN.phone.silent?'vibrating…':'ringing… guards nearby can hear it'}</span></span><button type="button" id="cAns" style="background:#2fe39a;border:0;border-radius:12px;padding:8px 10px;font-weight:700">Answer</button><button type="button" id="cDec" style="background:#e0242b;color:#fff;border:0;border-radius:12px;padding:8px 10px;font-weight:700">Decline</button>`;
  d.addEventListener('pointerdown',e=>e.stopPropagation());document.body.appendChild(d);d.querySelector('#cAns').onclick=()=>endCall('answer');d.querySelector('#cDec').onclick=()=>endCall('decline');}
function endCall(how){const c=PH.ring;PH.ring=null;const d=document.getElementById('callBar');if(d)d.remove();if(!c)return;
  if(how==='missed'){phoneMsg(c.who,c.trap?'Missed call.':'Missed call. "Phone uthao! Kaam ki khabar thi."');return;}
  if(how==='decline'){if(!c.trap)phoneMsg(c.who,'Call kaata? Theek hai. Dhyaan rakhna.');return;}
  if(c.trap){toast(`${c.who}: "Madam, aapka parcel… address confirm kar dijiye?" …click. Line dead.`);setTimeout(()=>{if(!RT.on)return;S.wanted=S.wanted||null;
      G.forEach(g=>{if(g.g.visible&&g.state!=='alert'&&(!g.area||g.area===S.area)){g.state='search';g.lastSeen=[P.pos.x+rnd(-3,3),P.pos.z+rnd(-3,3)];g.searchT=12;g.sus=Math.max(g.sus,55);}});
      banner('TRAP CALL! Police traced the call. Move, now!',true);setTimeout(()=>{if(RT.on)banner(null);},5000);if(S.traces.length<14)trace('Fake call: police ne call trace kiya');},1500);return;}
  const gift=pick(['shift','cams','darts']);
  if(gift==='shift'){G.forEach(g=>{g._sr2=g.range;g.range*=.7;});setTimeout(()=>G.forEach(g=>{if(g._sr2)g.range=g._sr2;}),45000);phoneMsg(c.who,'Guards ki shift badal rahi hai. Agle 45 second sab thake hain. Chalo!');}
  else if(gift==='cams'&&typeof CAMS!=='undefined'&&CAMS.length){const sv=CAMS.map(k=>k.range);CAMS.forEach(k=>k.range=.01);setTimeout(()=>CAMS.forEach((k,i)=>k.range=sv[i]),25000);phoneMsg(c.who,'Control room mein apna aadmi hai. 25 second camere band.');}
  else{RUN.darts+=2;drawDartBtn();phoneMsg(c.who,'Do dart tumhare bag mein daal diye the. Check karo.');}
  toast(`${c.who}: help received (see Chats).`,'good');}
/* ---- voices: vendors, coolies, conductors and announcements speak through the phone's own text-to-speech ---- */
const VOX={ok:typeof speechSynthesis!=='undefined',hi:null,en:null,last:0};
function pickVoices(){try{const vs=speechSynthesis.getVoices();VOX.hi=vs.find(v=>/^hi[-_]IN/i.test(v.lang))||null;VOX.en=vs.find(v=>/^en[-_]IN/i.test(v.lang))||null;}catch(e){}}
if(VOX.ok){pickVoices();try{speechSynthesis.onvoiceschanged=pickVoices;}catch(e){}
  addEventListener('pointerdown',()=>{try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);}catch(e){}},{once:true});}
const DEVA={'Chaai lo madam, garam chaai!':'चाय लो मैडम, गरम चाय!','Chaaai, garam chaai!':'चाय चाय! गरम चाय!','Chaai, garam samosa!':'चाय चाय! गरम समोसा!','Side do, side do!':'साइड दो, साइड दो!',
  'Arre mera thela! Pakdo koi!':'अरे मेरा ठेला! पकड़ो कोई!','Yatri kripya dhyaan dein, gaadi sankhya 12951…':'यात्री कृपया ध्यान दें। गाड़ी संख्या बारह नौ पाँच एक, प्लेटफ़ॉर्म पर खड़ी है।',
  'Chalo chalo! Bus nikal rahi hai!':'चलो चलो! बस निकल रही है!','Saari flights hold pe hain.':'सारी फ़्लाइट्स होल्ड पर हैं।'};
const VSTYLE={Chaiwala:[1.15,1.25],Coolie:[1.1,.8],Conductor:[1.2,.85],Thelewala:[1.25,1.1],Announcement:[.92,1],Radio:[1.1,.9],Contact:[1,1]};
function say2(text,rate=1,pitch=1){if(!VOX.ok||typeof AU!=='undefined'&&!AU.on)return;const now=performance.now();if(speechSynthesis.speaking&&now-VOX.last<2500)return;
  try{speechSynthesis.cancel();const deva=DEVA[text];const u=new SpeechSynthesisUtterance(deva||text);const v=deva?(VOX.hi||VOX.en):(VOX.en||VOX.hi);if(v){u.voice=v;u.lang=v.lang;}else u.lang=deva?'hi-IN':'en-IN';
    u.rate=rate;u.pitch=pitch;u.volume=1;speechSynthesis.speak(u);VOX.last=now;}catch(e){}}
function voiceFor(t){const m=/^(\w+)[^:]*:\s*"([^"]+)"/.exec(t)||/^(Announcement):\s*(.+)$/.exec(t);if(!m)return;const st=VSTYLE[m[1]];if(!st)return;say2(m[2].replace(/[“”]/g,''),st[0],st[1]);}
/* ---- news ---- */
function newsFlash(text,sec){const d=document.createElement('div');d.style.cssText='position:fixed;left:16px;right:16px;top:calc(180px + env(safe-area-inset-top));z-index:31;background:#f1ece1;color:#111;border:3px solid #111;box-shadow:5px 5px 0 #111;padding:10px 12px;font-family:var(--type,monospace);transform:rotate(-1.2deg);pointer-events:none;max-width:460px;margin:0 auto';
  d.innerHTML=`<div style="font:800 11px 'Space Grotesk',sans-serif;letter-spacing:2px;border-bottom:2px solid #111;padding-bottom:3px;margin-bottom:6px;display:flex;justify-content:space-between"><span>BREAKING NEWS</span><span style="color:#e0242b">SECURITY: ${SEC_NAMES[sec].toUpperCase()}</span></div>${text?`<div style="font:700 17px/1.2 'Space Grotesk',sans-serif">${esc(text)}</div>`:''}${sec?`<div style="font-size:12px;margin-top:5px">Guards here are sharper${sec>=2?' and faster':''}${sec>=3?'. Police shoot at 2★':''}.</div>`:''}`;
  document.body.appendChild(d);setTimeout(()=>{d.style.transition='opacity .5s';d.style.opacity=0;setTimeout(()=>d.remove(),600);},5200);}
function recordWorld(win){const z=ZONE_ID;const kills=W.kills,shots=W.shots;const delta=kills*3+(shots?1.5:0)+S.alerts*.8+(RT.body?1:0);
  if(delta<=0)return;WORLD.zones[z]=(WORLD.zones[z]||0)+delta;const place={airport:'Airport',train:'Night Express',bus:'Highway',port:'Docks',plane:'Flight'}[z];
  const t=kills?`${place} pe goli-baari: ${kills===1?'ek jawan maara gaya':kills+' jawan maare gaye'}, hamlawar mahila faraar`:shots?`${place} pe goli chali, kai ghante tak sab band`:RT.body?`${place} pe guard behosh mila, police ko sazish ka shak`:S.alerts>=2?`${place} pe sandigdh mahila CCTV mein, talaash jaari`:null;
  if(t){WORLD.news.push({zone:z,text:t,at:Date.now()});WORLD.news=WORLD.news.slice(-8);}wjson(WKEY,WORLD);}
/* ---- how you left a zone decides where you can go next ---- */
const EXITS={flight:{title:'Boarding! ✈',text:'Clean exit from the airport: wanted cleared, double cash, +1 dart. But the cabin has its own eyes.',cash:2,next:['plane'],via:{plane:'Board your flight →'}},
  landed:{title:'Landed',text:'Through immigration with a stamp and a straight face. New city, cold trail. +50% cash, wanted cleared.',cash:1.5,next:['train','bus','port','airport'],via:{train:'Metro to the station →',bus:'Cab to the bus stand →',port:'Taxi to the docks →',airport:'Another airport, another gate →'}},
  jump:{title:'Jumped the train!',text:'You roll into the dark fields by the highway. Ground route only.',cash:1,next:['bus','port'],via:{bus:'Hitch to the bus stand →',port:'Hitch a truck to the docks →'}},
  station:{title:'Walked out with the crowd',text:'Clean exit at the station. Nobody looked twice. +50% cash, wanted cleared.',cash:1.5,next:['airport','bus','port'],via:{airport:'Cab to the airport →',bus:'Walk to the bus stand →',port:'Local train to the docks →'}},
  truck:{title:'Hid in a truck',text:'You skipped the police checkpost in the back of a cargo truck. It is heading for the coast.',cash:.8,next:['port','train'],via:{port:'Ride to the docks →',train:'Jump off near a station →'}},
  city:{title:'Through the checkpost',text:'The bus rolls into the city. Clean pass: +50% cash, wanted cleared.',cash:1.5,next:['airport','train','port'],via:{airport:'Auto to the airport →',train:'Walk to the station →',port:'Bus to the docks →'}},
  ship:{title:'Aboard the cargo ship',text:'The ship slips out at 4 AM. You step off two days later on a quiet coast. +50% cash, wanted cleared.',cash:1.5,next:['airport','train','bus'],via:{airport:'Land in Kochi → airport',train:'Land in Kochi → station',bus:'Land in Kochi → bus stand'}},
  boat:{title:'Stole a speedboat!',text:'Loud, fast and messy. You beach it up the coast with the police boats far behind.',cash:.8,next:['bus','train'],via:{bus:'Run to the highway →',train:'Run to a small station →'}},
  taxi:{title:'Out by taxi',text:'The airport is behind you, but every flight is watched now. Ground route only.',cash:1,next:['train','bus'],via:{train:'Taxi to the station →',bus:'Taxi to the bus stand →'}}};
/* ---- end of a zone: next leg or run over ---- */
function runEnd(win,who,why){if(!RT.on)return false;RT.on=false;S.phase='over';locked=true;if(dartBtn){dartBtn.sw.remove();dartBtn.remove();}if(PH.ring)endCall('missed');['#wantedHud','#phoneBtn','#phone','#callBar'].forEach(q=>{const e=document.querySelector(q);if(e)e.remove();});RUN.wanted=Math.max(0,W.stars-1);RUN.kills=(RUN.kills||0)+W.kills;
  ['#hud','#pads','#joy','#map'].forEach(s=>{const e=$(s);if(e)e.hidden=true;});banner(null);
  const nCam=S.camsSeen?S.camsSeen.size:0;RUN.lh.cams+=nCam;recordWorld(win);
  const legScore=win?Math.round(100+RUN.leg*40+(S.alerts?0:60)+Math.max(0,S.timeLeft)|0):0;const cash=win?40000+RUN.leg*15000:0;
  RUN.legs.push({zone:ZONE_ID,win,traces:S.traces.length,alerts:S.alerts});
  const EX=RT.exit&&EXITS[RT.exit];if(EX&&win){RUN.cash+=cash*(EX.cash-1);if(RT.exit==='flight'){RUN.lh.flight++;W.stars=0;RUN.wanted=0;RUN.darts++;}if(RT.exit==='station'||RT.exit==='city'||RT.exit==='ship'||RT.exit==='landed'){W.stars=0;RUN.wanted=0;}}
  if(win){RUN.score+=legScore;RUN.cash+=cash;const opts=(EX?shuffle(EX.next).slice(0,2):nextZones(ZONE_ID)).map(z=>({z,mods:rollMods(RUN.leg+1)}));RUN.offer=opts;saveRun(RUN);
    const c=sheet(`<div class="eyebrow">ESCAPE · LEG ${RUN.leg} CLEARED</div><h2>${EX?EX.title:'Escaped!'}</h2>${EX?`<p>${EX.text}</p>`:''}
      <div class="stats"><div class="stat"><span>Score</span><b>${RUN.score}</b></div><div class="stat"><span>Run cash</span><b>${inr(RUN.cash)}</b></div><div class="stat"><span>Darts / Ammo</span><b>${RUN.darts} / ${RUN.ammo}</b></div></div>${RUN.wanted?`<p class="eyebrow" style="color:#ffd166">WANTED ${'★'.repeat(RUN.wanted)} carries into the next zone</p>`:''}
      <p>${RT.exit==='flight'?'Where to?':'Rana is right behind you. Pick your next route:'}</p>
      ${opts.map((o,i)=>`<button class="btn" type="button" data-i="${i}" style="background:${ZONES[o.z].col};text-align:left;line-height:1.25">${secLevel(o.z)?`<span style="float:right;font:700 11px 'Space Grotesk',sans-serif;background:#111;color:#ffd166;padding:2px 6px;border-radius:6px">SECURITY: ${SEC_NAMES[secLevel(o.z)].toUpperCase()}</span>`:''}${EX&&EX.via[o.z]?EX.via[o.z]:ZONES[o.z].name+' →'}<br><span style="font:500 12px var(--type,monospace);opacity:.9">${EX&&EX.via[o.z]?ZONES[o.z].name:ZONES[o.z].sub}${o.mods.length?' · ⚠ '+o.mods.map(k=>MODS[k].name).join(', '):' · no hazards'}</span></button>`).join('')}
      <button class="btn alt" type="button" id="bank">Lie low here (bank the cash)</button>`);
    c.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const o=opts[+b.dataset.i];RUN.leg++;RUN.zone=o.z;RUN.mods=o.mods;if(RUN.leg%3===0)RUN.darts++;RUN.ammo=(RUN.ammo||0)+2;saveRun(RUN);location.href=ZONES[o.z].url;if(o.z==='airport'&&ZONE_ID==='airport')location.reload();});
    c.querySelector('#bank').onclick=()=>runOver(true);}
  else{RUN.dead={who:who||null,why:why||null};caughtChoice();}
  return true;}
/* caught or shot: pay bail and keep the run (with a police record), or start over */
function caughtChoice(){const rec=RUN.records||0,left=2-rec,shot=/^Shot by/.test(RUN.dead.why||'');const bail=Math.round(RUN.cash*.5);
  if(left<=0)return runOver(false);
  const c=sheet(`<div class="eyebrow">ESCAPE · LEG ${RUN.leg}</div><h2 style="color:var(--red)">${shot?'Shot down':'Caught'}</h2>
    <p>${esc(RUN.dead.who?'Caught by '+RUN.dead.who+'.':RUN.dead.why||'')}</p>
    <div class="dossier"><h3>Police record</h3><p style="margin:4px 0 0;color:#1b1b1b">${shot?'Hospital, phir hawalaat.':'Thane mein raat guzri.'} Ek vakeel bail dila sakta hai, par record mein naam aa jaayega.</p>
    <dl><dt>Bail</dt><dd>${inr(bail)} (half the run cash)</dd><dt>Record</dt><dd>+1 (wanted ★★ carries on)</dd><dt>Chances left</dt><dd>${left} of 2</dd></dl><span class="stampx">FIR</span></div>
    <button class="btn" id="bail" type="button" style="background:#e0242b">Continue · pay bail, retry this zone</button>
    <button class="btn alt" id="give" type="button">End run</button>`);
  c.querySelector('#bail').onclick=()=>{RUN.records=rec+1;RUN.cash-=bail;RUN.wanted=Math.min(5,(RUN.wanted||0)+2);RUN.dead=null;RUN.active=true;saveRun(RUN);
    if(S.traces.length<12)trace('FIR darj: police record mein naam');location.href=ZONES[ZONE_ID].url;if(ZONE_ID==='airport')location.reload();};
  c.querySelector('#give').onclick=()=>runOver(false);}
function runOver(banked){const r=RUN;r.active=false;saveRun(r);
  for(const k in r.lh)HUNTER.habits[k]=(HUNTER.habits[k]||0)*.6+r.lh[k];HUNTER.runs++;
  const legsDone=r.legs.filter(l=>l.win).length;HUNTER.best=Math.max(HUNTER.best||0,legsDone);
  const top=Object.keys(habitNorm).map(k=>[k,(r.lh[k]||0)/habitNorm[k]]).sort((a,b)=>b[1]-a[1])[0];
  const learned=top&&top[1]>=.5?top[0]:null;wjson(HKEY,HUNTER);
  const kept=banked?r.cash:Math.round(r.cash*.25);CAREER.money+=kept;CAREER.bestRun=Math.max(CAREER.bestRun||0,legsDone);CAREER.missions=(CAREER.missions||0)+1;saveCareer();
  const c=sheet(`<div class="eyebrow">ESCAPE · RUN OVER</div><h2 style="color:${banked?'var(--good)':'var(--red)'}">${banked?'Vanished!':(r.dead&&/^Shot by/.test(r.dead.why||'')?'Shot down':'Caught')}</h2>
    <p>${banked?'You slipped out of the city. Rana came up empty.':esc(r.dead&&r.dead.who?'Caught by '+r.dead.who+'.':(r.dead&&r.dead.why)||'Rana wins. This time.')}</p>
    <div class="stats"><div class="stat"><span>Legs cleared</span><b>${legsDone}</b></div>${r.records?`<div class="stat"><span>Police record</span><b>${r.records}</b></div>`:''}<div class="stat"><span>Score</span><b>${r.score}</b></div><div class="stat"><span>Cash earned</span><b>${inr(kept)}</b></div></div>
    <p class="eyebrow">BEST RUN: ${HUNTER.best} LEGS · RANA HAS SEEN ${HUNTER.runs} RUNS</p>
    ${learned?`<div class="dossier"><h3>Inspector Rana's notes</h3><p style="margin:6px 0 0;color:#1b1b1b">"Wo ${HABITS[learned].t}. Agli baar taiyaar rahunga."</p><span class="stampx">NOTED</span></div>`:''}
    <ul class="traces">${r.legs.map((l,i)=>`<li class="${l.win?'ok':''}">Leg ${i+1} · ${ZONES[l.zone].name} · ${l.win?'cleared':'failed'} · ${l.traces} traces</li>`).join('')}</ul>
    <button class="btn" id="again" type="button" style="background:#e0242b">New run</button><a class="btn alt" href="index.html">Safehouse</a>`);
  c.querySelector('#again').onclick=startNewRun;}
window.__run={PH,incoming:()=>incoming(),endCall:a=>endCall(a),togglePhone:()=>togglePhone(),CT,spawnContact:()=>{RUN.leg=Math.max(RUN.leg,2);const o=Math.random;Math.random=()=>0;try{spawnContact();}finally{Math.random=o;}},W,WORLD,newsFlash:(t,s)=>newsFlash(t,s),gateOpen:()=>gateOpen(),switchWpn:()=>switchWpn(),shootGun:()=>shootGun(),addStars:(n)=>addStars(n,'test'),runEnd:(...a)=>runEnd(...a),shootDart:()=>shootDart(),get RUN(){return RUN;},HUNT,RT};
/*RUN-END*/
