import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {Pass,FullScreenQuad} from 'three/addons/postprocessing/Pass.js';

/* TRACE · Level 3 · Highway ki Bus (built by scripts/assemble-bus.py from src/train.js + src/bus-parts.js)
   Original header: TRACE · Level 2 · Raat ki Gaadi
   Part 1: night platform at Mumbai Terminus (reach your coach before departure).
   Part 2: inside the moving sleeper train (TC ticket checks, RPF boards at a station,
   hide on berths, do the job, then jump off while the train slows at a signal). */
const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.random()*(b-a), ri=(a,b)=>Math.floor(rnd(a,b+1)), pick=a=>a[Math.floor(Math.random()*a.length)], chance=p=>Math.random()<p;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const angDiff=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;};
const TIMEOUT=Symbol('t');
function vib(p){try{navigator.vibrate&&navigator.vibrate(p);}catch(e){}}

/* ---------------- career + cover story (shared with the airport) ---------------- */
const SAVE_KEY='trace_career_v1';
const CAREER=(()=>{try{const c=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(c&&typeof c.money==='number')return c;}catch(e){}return {money:150000,missions:0,wins:0,heat:0,best:0};})();
const saveCareer=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(CAREER));}catch(e){}};
/* ---------------- story campaign "Mumbai se Bhaago" (shared by every chapter page) ---------------- */
const CKEY='trace_campaign';
function getC(){try{return JSON.parse(localStorage.getItem(CKEY)||'null');}catch(e){return null;}}
function saveC(c){try{localStorage.setItem(CKEY,JSON.stringify(c));}catch(e){try{c.photos=(c.photos||[]).slice(-2);localStorage.setItem(CKEY,JSON.stringify(c));}catch(e2){}}}
function newStory(){saveC({active:true,ch:1,next:'cab.html',log:[],photos:[],al:{},alerts:0,started:Date.now()});}
function storyRecord(ch,traces,photos,alerts,label,next){const C=getC();if(!C||!C.active)return null;
  C.log=(C.log||[]).filter(x=>x.ch!==ch).concat(traces.map(t=>({ch,text:t.text})));
  C.photos=(C.photos||[]).filter(p=>p.ch!==ch).concat(photos.slice(0,1).map(p=>({ch,url:p.url,label:label+' '+p.id})));
  C.al=Object.assign({},C.al||{},{[ch]:alerts});C.alerts=Object.values(C.al).reduce((a,b)=>a+b,0);
  if(next){C.ch=ch+1;C.next=next;}saveC(C);return C;}
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
  night:{name:'Night',d:'Dark zone: guards see about a quarter less. Cameras still work.',good:true},
  peak:{name:'Rush hour',d:'Huge crowds everywhere: easy to blend in.',good:true},
  patrol:{name:'Rana on site',d:'Inspector Rana is patrolling this zone himself. He knows your old photo.'}};
const HABITS={run:{t:'bhaagti hai',c:'Guards now suspect runners instantly.'},crowd:{t:'bheed mein chhupti hai',c:'Guards now watch crowds closely.'},
  disguise:{t:'kapde badalti hai',c:'A new look reaches every radio in 30 seconds.'},dart:{t:'dart chalaati hai',c:'Darted guards wake up faster.'},
  cams:{t:'CCTV ke saamne aati hai',c:'Cameras see further.'},flight:{t:'hamesha flight pakadti hai',c:'Airports get extra eyes.'},upi:{t:'UPI se paise deti hai',c:'He reads bank records: phone pings come faster.'}};
function rjson(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
function wjson(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
const getRun=()=>rjson(RKEY),saveRun=r=>wjson(RKEY,r);
/* playable characters: each changes the loadout and how the world reacts */
const CHARS={agent:{name:'Meera',role:'Agent',emoji:'🕶️',look:{skin:0xc68b5e,hair:0x1a1a1a,longHair:true,scarf:0xe0242b},pros:['Balanced in everything','Starts every run with ₹50,000 cash for deals'],cons:['No special power']},
  hacker:{name:'Anjali',role:'Hacker',emoji:'💻',look:{skin:0xe2b48f,hair:0x3b2416,longHair:false,scarf:0x2fe39a},pros:['Phone pings come much slower','Fewer trap calls','Cameras see a bit less of her'],cons:['Only 1 dart and 4 bullets']},
  actress:{name:'Kavya',role:'Actress',emoji:'🎭',look:{skin:0x9a6644,hair:0x111111,longHair:true,scarf:0xff5fa2},pros:['A disguise bag in every zone','Half the time the police photo is too blurry to use'],cons:['Running looks very suspicious']},
  driver:{name:'Arjun',role:'Driver',emoji:'🚖',male:true,look:{skin:0x9a6644,hair:0x111111,longHair:false,mustache:true,scarf:0xf28b0f},pros:['Knows the roads: sees 3 routes instead of 2','30% more time in every zone'],cons:['Cameras spot him from further away']},
  conman:{name:'Kabir',role:'Con-man',emoji:'🧔',male:true,look:{skin:0xe2b48f,hair:0x3b2416,longHair:false,mustache:false,scarf:0x7a4bb0},pros:['Talks his way out: one wrong answer forgiven per zone','Always reads a stranger\'s tell','3 darts'],cons:['Never carries a gun']},
  soldier:{name:'Rani',role:'Ex-Army',emoji:'🪖',look:{skin:0x8f5d3e,hair:0x111111,longHair:false,scarf:0x6b7a4a},pros:['130 health, police bullets miss more','+1 dart, +4 bullets'],cons:['Memorable face: guards get suspicious faster']}};
/* text for male runners: only the lines about the player change (pakdi gayi → pakda gaya, rahi ho → rahe ho, madam → sir) */
const GTX=[[/rahi ho\b/g,'rahe ho'],[/Rahi ho\b/g,'Rahe ho'],[/\b(kar|bhaag|dhoondh) rahi thi\b/g,'$1 raha tha'],[/\b(\w+)ogi\b/g,'$1oge'],[/\bsakti ho\b/g,'sakte ho'],[/\b(keh|kar|aa|ja)ti ho\b/g,'$1te ho'],
  [/\bbaithi ho\b/g,'baithe ho'],[/\bchadhi ho\b/g,'chadhe ho'],[/\bnayi aayi ho\b/g,'naye aaye ho'],[/PAKDI GAYI/g,'PAKDA GAYA'],[/Pakdi gayi/g,'Pakda gaya'],[/pakdi gayi/g,'pakda gaya'],[/pakdi jaa/g,'pakde jaa'],[/pakdi jao/g,'pakde jao'],
  [/\b(bhaag|chhup|badal|chalaa|pakad|de|aa)ti hai\b/g,(m,a)=>a+'ta hai'],[/\b(Saaf|Bach) nikli\b/g,'$1 nikla'],[/\b(chhup|baith|so|bhatak) gayi\b/g,'$1 gaya'],[/\bmein chadhi\b/g,'mein chadha'],[/SE KOODI/g,'SE KOODA'],[/BHAR CHALI/g,'BHAR CHALA'],
  [/\bkhadi thi\b/g,'khada tha'],[/\bthak gayi\b/g,'thak gaya'],[/\bMadam\b/g,'Sir'],[/\bmadam\b/g,'sir'],[/\bmahila\b/g,'aadmi'],[/hamlawar aadmi/g,'hamlawar aadmi'],[/\bWo (\w+)ti hai\./g,'Wo $1ta hai.']];
function gtx(t){if(typeof t!=='string'||!isMale())return t;for(const [a,b] of GTX)t=t.replace(a,b);return t;}
const isMale=()=>!!(CHARS[charOf()]||{}).male;
/* every run has one cover name that fits the runner: female or male name pools for the "Naam kya hai?" questions */
const COVER_F=[['Ananya','Sethi'],['Kavya','Arora'],['Riya','Joshi'],['Meera','Khanna'],['Aditi','Rao'],['Sana','Mirza'],['Isha','Bhatt']];
const COVER_M=[['Arjun','Mehta'],['Rohan','Verma'],['Vikram','Nair'],['Aman','Gupta'],['Imran','Shaikh'],['Dev','Kulkarni'],['Karan','Sethi']];
function coverFix(l){if(!RUN||RUN.first||!l)return l;const pool=isMale()?COVER_M:COVER_F;if(typeof NAMES!=='undefined')NAMES.splice(0,NAMES.length,...pool);
  if(!RUN.cover||!pool.some(n=>n[0]===RUN.cover[0])){RUN.cover=pick(pool);saveRun(RUN);}l.given=RUN.cover[0];l.surname=RUN.cover[1];return l;}
const charOf=()=>{const r=getRun();return CHARS[r&&r.char]?r.char:'agent';};
function charLook(o){const c=CHARS[charOf()];if(!c)return o;o.skin=c.look.skin;o.hair=c.look.hair;if(!o.shawl)o.longHair=c.look.longHair;if(c.male){o.longHair=false;if(c.look.mustache)o.mustache=true;}if(o.scarf&&o.scarf===0xe0242b)o.scarf=c.look.scarf;return o;}
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
function newRun(ch){ch=CHARS[ch]?ch:'agent';const counters=pickCounters();for(const k in WORLD.zones)WORLD.zones[k]=+(WORLD.zones[k]*.75).toFixed(2);wjson(WKEY,WORLD);const z=pick(GROUND);const B=getBoard();const raid=B.strength>=100;
  const r={active:true,leg:1,zone:z,mods:raid?['patrol','alert']:[],raid,counters,char:ch,darts:(ch==='hacker'?1:ch==='soldier'||ch==='conman'?3:2)+(CAREER.dartUp||0),ammo:ch==='conman'?0:(ch==='hacker'?4:ch==='soldier'?10:6)+2*(CAREER.ammoUp||0),score:0,cash:ch==='agent'?50000:0,legs:[],lh:{run:0,crowd:0,disguise:0,dart:0,cams:0,flight:0},started:Date.now()};saveRun(r);return r;}
function startNewRun(){pickChar(ch=>{const r=newRun(ch);location.href=ZONES[r.zone].url;if(ZONE_ID==='airport'&&r.zone==='airport')location.reload();});}
function pickChar(cb){const c=sheet(`<div class="eyebrow">NEW GAME</div><h2>Choose your runner</h2>${Object.entries(CHARS).map(([k,v])=>`<button type="button" class="dossier" data-c="${k}" style="display:block;width:100%;text-align:left;margin:0;cursor:pointer">
    <h3>${v.emoji} ${v.name} · ${v.role}</h3><div style="color:#1b1b1b;font-size:13px;line-height:1.35">${v.pros.map(x=>`<div style="color:#1e7a4a">＋ ${esc(x)}</div>`).join('')}${v.cons.map(x=>`<div style="color:#b0281f">－ ${esc(x)}</div>`).join('')}</div></button>`).join('')}`);
  c.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>cb(b.dataset.c));}
/* ---- in-zone ---- */
const RT={on:false,lock:false,body:false,exit:null,lastLook:null,lookT:0,traitorAt:0,blackT:0,dark:false,saved:null};
function runStart(){if(!RUN)return;RT.on=true;RT.lastLook=lookKey();
  const mods=RUN.mods||[];
  const CH=RUN.char||'agent';
  if(CH==='hacker'&&typeof CAMS!=='undefined')CAMS.forEach(c=>{c.range*=.8;});
  if(CH==='actress')HUNT.run*=1.4;
  if(CH==='soldier'){HUNT.g*=1.12;W.max=130;W.hp=130;}
  if(CH==='driver'){S.timeLeft*=1.3;if(typeof CAMS!=='undefined')CAMS.forEach(c=>{c.range*=1.15;});}
  if(mods.includes('rush'))S.timeLeft*=.7;
  if(mods.includes('night')){G.forEach(g=>{g.range*=.75;});try{hemi.intensity*=.4;sun.intensity*=.25;scene.background=new T.Color(0x070a14);scene.fog=new T.Fog(0x070a14,14,70);}catch(e){}}
  if(mods.includes('peak'))rushHour();
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
  if(RUN.raid&&RUN.leg===1)setTimeout(()=>{if(!RT.on)return;sfx.alert();vib([200,100,200]);banner('RAID! Rana\'s task force is here. Survive this zone to wipe his case board.',true);setTimeout(()=>{if(RT.on)banner(null);},7000);},900);
  const lines=[`ESCAPE · LEG ${RUN.leg} · ${ZONES[ZONE_ID].name.toUpperCase()}`];
  mods.forEach(k=>lines.push('⚠ '+MODS[k].name+': '+MODS[k].d));
  (RUN.counters||[]).forEach(k=>lines.push('RANA: "Wo '+HABITS[k].t+'." → '+HABITS[k].c));
  lines.forEach((l,i)=>setTimeout(()=>{if(RT.on)toast(l,i===0?'info':'bad');},400+i*2600));
  setTimeout(spawnContact,rnd(15000,40000));setTimeout(spawnBag,rnd(6000,20000));setTimeout(()=>{if(RT.on)wantedCard();},2200);
  if(CROWDS[ZONE_ID]&&Math.random()<.55)CR.at=rnd(20,60);}
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
  updDarts(dt);updGun(dt);checkLock();phoneTick(dt);crowdTick(dt);disguiseTick(dt);seenTick();
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
function switchWpn(){if(!RT.on)return;if(RUN.char==='conman'){toast('Kabir never carries a gun.','info');return;}RUN.wmode=RUN.wmode==='gun'?'dart':'gun';tone(500,.05,'square',.08);drawDartBtn();}
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
const W={shootAt:3,max:100,hp:100,hitT:99,stars:0,shots:0,kills:0,cd:0,ui:null,fx:[]};
function gunUI(){if(W.ui||!RUN)return;if(RUN.ammo===undefined)RUN.ammo=6;W.stars=RUN.wanted||0;
  const h=document.createElement('div');h.id='wantedHud';h.style.cssText='position:fixed;right:16px;top:calc(140px + env(safe-area-inset-top));z-index:30;background:#111;color:#fff;border-radius:999px;padding:5px 12px;font:700 13px "Space Grotesk",sans-serif;display:flex;gap:10px;align-items:center;pointer-events:none';
  document.body.appendChild(h);W.ui=h;const v=document.createElement('div');v.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:29;box-shadow:inset 0 0 120px 40px rgba(224,36,43,.75);opacity:0;transition:opacity .25s';document.body.appendChild(v);W.vig=v;drawGun();}
function drawGun(){if(!W.ui)return;drawDartBtn();
  W.ui.innerHTML=`${DISG[S.look.outfit]?`<span>${DISG[S.look.outfit].emoji}</span>`:''}<span style="color:#ffd166;letter-spacing:1px">${'★'.repeat(W.stars)}<span style="opacity:.3">${'★'.repeat(5-W.stars)}</span></span>${ZONE_ID==='airport'?`<span style="color:${RT.lock?'#ff6a5a':'#2fe39a'}">✈ ${RT.lock?'LOCKED':'OPEN'}</span>`:''}<span style="display:inline-block;width:70px;height:8px;background:#333;border-radius:4px;overflow:hidden"><i style="display:block;height:100%;width:${W.hp/W.max*100}%;background:${W.hp>W.max/2?'#2fe39a':W.hp>25?'#f5b82e':'#e0242b'}"></i></span>`;}
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
  if(W.hitT>6&&W.hp<W.max){W.hp=Math.min(W.max,W.hp+4*dt);if((W.hitT*10|0)%10===0)drawGun();}
  const fs=S.alerts>=3?1:0;if(fs&&W.stars<1)addStars(1,'repeated alerts');
  if(W.stars<W.shootAt||locked)return;
  const F=(()=>{try{return typeof flags==='function'?flags():playerFlags();}catch(e){return {};}})();
  for(const g of G){if(g.down>0||g.dead||!g.g.visible||g.state!=='alert'||g.smell)continue;if(g.area&&S.area&&g.area!==S.area)continue;
    g.fireT=(g.fireT===undefined?rnd(.6,1.4):g.fireT)-dt;const d=canSee(g,P.pos.x,P.pos.z);if(!d||d>13){continue;}
    if(g.fireT>0)continue;g.fireT=rnd(1.3,2.2)-W.stars*.15;bang();tracer(g.pos,P.pos,0xff6a5a);
    let pHit=(.38+(W.stars-3)*.1)*((RUN.char==='soldier')?.7:1);if(P.running||F.running)pHit*=.65;if(F.crowd>=2)pHit*=.6;if(d>9)pHit*=.7;
    if(Math.random()<pHit){const dmg=ri(18,32);W.hp-=dmg;W.hitT=0;W.vig.style.opacity=1;setTimeout(()=>W.vig.style.opacity=0,260);vib([60,30,60]);drawGun();
      if(W.hp<=0){W.hp=0;drawGun();toast('You were shot...');setTimeout(()=>runEnd(false,null,`Shot by ${g.name}. At ${W.stars}★ the police don\'t ask questions.`),900);RT.dead=true;locked=true;P.g.rotation.x=-Math.PI/2;P.g.position.y=.25;return;}
      else toast(`Hit! Health ${Math.round(W.hp)}. Hide to recover.`);}}}
/* fair stops: a correct answer always lets you go, unless you were caught red-handed or still look exactly like the wanted photo */
async function judge(g,ok,redHanded){if(redHanded===undefined)redHanded=S.wanted===lookKey();
  if(!ok&&RUN&&RUN.char==='conman'&&!RT.conUsed){RT.conUsed=true;await say('','(Kabir muskura ke baat ghuma deta hai)',true);await say('Kabir','Arre sahab, neend mein galat naam bol diya. Ye lijiye, ID dekh lijiye.');ok=true;}
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
  {id:'disg',pitch:'Ek set kapde hain. Bhes badlo, chehra badlo. Sab kuch theek se.',label:'Disguise set',cost:25000,apply(){const o=Object.keys(DISG).filter(canWear);wearDisguise(pick(o));}},
  {id:'heal',pitch:'First-aid kit. Patti, dard ki goli.',label:'Full health',cost:10000,apply(){W.hp=100;drawGun();toast('Health restored.','good');}}];
const CT={npc:null,used:false,traitor:false,deal:null};
function spawnContact(){if(!RT.on||CT.npc||RUN.leg<2||!P||Math.random()>.65)return;
  let x=P.pos.x,z=P.pos.z;for(let i=0;i<12;i++){const a=rnd(0,6.28),d=rnd(3,6);const q={x:P.pos.x+Math.sin(a)*d,z:P.pos.z+Math.cos(a)*d};const c={x:q.x,z:q.z};collide(c);if(Math.hypot(c.x-q.x,c.z-q.z)<.01&&segClear(P.pos.x,P.pos.z,c.x,c.z)){x=c.x;z=c.z;break;}}
  const look={body:pick([0x3b3b3b,0x6b4f3a,0x2e4a3a]),legs:0x222222,skin:pick([0x8f5d3e,0xc68b5e,0x6b4428]),hair:0x111111,mustache:Math.random()<.6,cap:Math.random()<.5?0x111111:undefined,capPeak:0x111111};
  const n=chibi(look);n.pos.set(x,0,z);n.beh='idle';n.inArea=S.area;n.reg='hall';n.walk=1;n.wait=999;NPC.push(n);CT.npc=n;
  const mk=new T.Mesh(new T.OctahedronGeometry(.22),new T.MeshBasicMaterial({color:0x2fe39a,toneMapped:false}));mk.position.y=2.35;n.g.add(mk);CT.mk=mk;
  const tr=.25+Math.min(.2,HUNTER.runs*.02)+(RUN.mods||[]).includes('traitor')*.15;CT.traitor=Math.random()<tr;CT.deal=pick(DEALS.filter(d=>!(d.id==='heal'&&W.hp>=100)));
  inter({area:S.area,label:'Talk to the stranger',r:1.9,on:()=>!CT.used&&RT.on,pos:()=>[CT.npc.pos.x,CT.npc.pos.z],run:talkContact});
  toast('Someone is watching you… and waving you over (green marker).','info');}
async function talkContact(){if(CT.used)return;locked=true;const d=CT.deal;const who='Ajnabi';
  await say(who,'Psst. Idhar. Tumhari photo har radio pe hai. Main madad kar sakta hoon… kuch paison mein.');
  const tell=CT.traitor?(RUN.char==='conman'||Math.random()<.6):Math.random()<.15;
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
  PH.pingT=rnd(35,50)*(RUN.char==='hacker'?1.6:1);PH.callAt=Math.random()<.65?rnd(25,80):-1;applyLoc();}
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
  if(RUN.phone.loc){PH.pingT-=dt;if(PH.pingT<=0){PH.pingT=(rnd(40,55)-(RUN.counters||[]).includes('upi')*12)*(RUN.char==='hacker'?1.6:1);const near=G.filter(g=>g.g.visible&&!g.down&&g.state!=='alert'&&(!g.area||g.area===S.area)).sort((a,b)=>Math.hypot(a.pos.x-P.pos.x,a.pos.z-P.pos.z)-Math.hypot(b.pos.x-P.pos.x,b.pos.z-P.pos.z)).slice(0,2);
    near.forEach(g=>{g.state='search';g.lastSeen=[P.pos.x+rnd(-4,4),P.pos.z+rnd(-4,4)];g.searchT=10;g.sus=Math.max(g.sus,40);});vib([40,30,40]);toast('📍 Rana pinged your phone! Guards are checking the area. (Phone → Settings → Location)');if(!PH.pinged){PH.pinged=true;if(S.traces.length<14)trace('Phone location: mobile tower ping');}}}
  if(PH.callAt>0&&playing()){PH.callAt-=dt;if(PH.callAt<=0){PH.callAt=-1;incoming();}}
  if(PH.ring){PH.ringT-=dt;if(!RUN.phone.silent){if((PH.rt=(PH.rt||0)-dt)<=0){PH.rt=1.1;tone(880,.25,'square',.06);tone(660,.25,'square',.06,.3);}
      for(const g of G){if(!g.g.visible||g.down>0||g.state==='alert'||g.area&&g.area!==S.area)continue;if(Math.hypot(g.pos.x-P.pos.x,g.pos.z-P.pos.z)<9){g.sus=Math.min(99,g.sus+18*dt);g.lastSeen=[P.pos.x,P.pos.z];if(g.state==='patrol'&&g.sus>35)g.state='sus';}}}
    if(PH.ringT<=0)endCall('missed');}}
function incoming(){const trap=Math.random()<(RUN.char==='hacker'?.2:.45);const who=trap?pick(['Unknown +91 98','Bank Helpline','Courier']):Math.random()<.7?'Handler':'Unknown +91 70';PH.ring={trap,who};PH.ringT=8;vib([200,100,200,100,200]);
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
const VSTYLE={Crowd:[1.2,1.1],Chaiwala:[1.15,1.25],Coolie:[1.1,.8],Conductor:[1.2,.85],Thelewala:[1.25,1.1],Announcement:[.92,1],Radio:[1.1,.9],Contact:[1,1]};
function say2(text,rate=1,pitch=1){if(!VOX.ok||typeof AU!=='undefined'&&!AU.on)return;const now=performance.now();if(speechSynthesis.speaking&&now-VOX.last<2500)return;
  try{speechSynthesis.cancel();const deva=DEVA[text];const u=new SpeechSynthesisUtterance(deva||text);const v=deva?(VOX.hi||VOX.en):(VOX.en||VOX.hi);if(v){u.voice=v;u.lang=v.lang;}else u.lang=deva?'hi-IN':'en-IN';
    u.rate=rate;u.pitch=pitch;u.volume=1;speechSynthesis.speak(u);VOX.last=now;}catch(e){}}
function voiceFor(t){const m=/^(\w+)[^:]*:\s*"([^"]+)"/.exec(t)||/^(Announcement):\s*(.+)$/.exec(t);if(!m)return;const st=VSTYLE[m[1]];if(!st)return;say2(m[2].replace(/[“”]/g,''),st[0],st[1]);}
/* ---- Rana's case board: every leg pins evidence; at 100% the next run opens with a raid ---- */
const BKEY='trace_board';
const getBoard=()=>Object.assign({strength:0,photos:[],notes:[],cleared:0},rjson(BKEY)||{});
function addEvidence(win){const B=getBoard();const ph=(S.photos||[])[0];if(ph&&ph.url){B.photos=B.photos.concat([{url:ph.url,zone:ZONE_ID}]).slice(-6);}
  const notes=(S.traces||[]).slice(-2).map(t=>({zone:ZONE_ID,text:t.text}));B.notes=B.notes.concat(notes).slice(-10);
  const add=(S.traces||[]).length*2+S.alerts*4+W.kills*12+W.shots*2+(win?0:8)+((RUN.lh.upi||0)?3:0)+(ph?4:0);
  B.strength=Math.min(100,Math.round(B.strength+add));wjson(BKEY,B);}
function boardHTML(){const B=getBoard();const items=[];
  B.photos.forEach((p,i)=>items.push(`<div class="cb-item" style="--r:${(i%2?3:-4)}deg"><img alt="CCTV still" src="${p.url}"><b>${esc(ZONES[p.zone]?ZONES[p.zone].name:p.zone)} CCTV</b></div>`));
  B.notes.forEach((n,i)=>items.push(`<div class="cb-note" style="--r:${(i%3-1)*3}deg">${esc(n.text)}<i>${esc(ZONES[n.zone]?ZONES[n.zone].name:'')}</i></div>`));
  const H=getHunter();const top=Object.keys(habitNorm).map(k=>[k,(H.habits[k]||0)/habitNorm[k]]).filter(x=>x[1]>=.6).sort((a,b)=>b[1]-a[1]).slice(0,3);
  top.forEach(([k])=>items.push(`<div class="cb-note hab">"Wo ${esc(HABITS[k].t)}."<i>pattern</i></div>`));
  return `<style>.cb{position:relative;background:#8a5a3a;background-image:radial-gradient(rgba(0,0,0,.15) 1px,transparent 1px);background-size:6px 6px;border:6px solid #4a2f1c;padding:14px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;min-height:200px}
    .cb-item{background:#f1ece1;padding:6px 6px 4px;width:120px;rotate:var(--r);box-shadow:0 4px 0 rgba(0,0,0,.4);position:relative}.cb-item img{width:100%;display:block;filter:grayscale(1) contrast(1.2)}.cb-item b{font:700 10px monospace;color:#111}
    .cb-note{background:#f5e6a8;color:#111;width:130px;padding:8px;font:600 12px/1.25 'Special Elite',monospace;rotate:var(--r);box-shadow:0 4px 0 rgba(0,0,0,.4);position:relative}.cb-note i{display:block;margin-top:4px;font:700 10px sans-serif;color:#8a1f1f}.cb-note.hab{background:#ffd0c8}
    .cb-item::before,.cb-note::before{content:'';position:absolute;top:-6px;left:50%;width:12px;height:12px;border-radius:50%;background:#e0242b;box-shadow:0 2px 0 #600;translate:-50% 0}
    .cb svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}</style>
    <div class="eyebrow">CASE #TR-${String(41+(B.cleared||0)).padStart(3,'0')} · INSPECTOR RANA</div><h2>Case board</h2>
    <p>Case strength: <b style="color:${B.strength>=100?'var(--red)':B.strength>=60?'#ffb627':'var(--good)'}">${B.strength}%</b>${B.strength>=100?' · <b style="color:var(--red)">RAID READY: your next run opens against Rana\'s task force. Survive the first zone to wipe the board.</b>':' · at 100% Rana leads a raid.'}</p>
    <div class="heat"><i style="width:${B.strength}%"></i></div>
    <div class="cb">${items.length?items.join(''):'<p style="color:#f1ece1">Board is empty. Rana has nothing on you… yet.</p>'}<svg viewBox="0 0 100 100" preserveAspectRatio="none">${items.length>1?Array.from({length:Math.min(items.length,8)},(_,i)=>`<line x1="${10+(i*37)%80}" y1="${8+(i*23)%80}" x2="${15+(i*53)%75}" y2="${12+(i*41)%78}" stroke="#d11" stroke-width=".5"/>`).join(''):''}</svg></div>
    ${B.cleared?`<p class="eyebrow">Cases you have beaten: ${B.cleared}</p>`:''}`;}
function showBoard(back){const c=sheet(boardHTML()+`<button class="btn" id="bk" type="button">Back</button>`);c.querySelector('#bk').onclick=back;}
/* ---- crowd events: a baraat, cricket fans or a shift change sweeps through. Great cover, but pockets get picked ---- */
const CROWDS={airport:{name:'Cricket fans',path:[[-28,17],[26,17],[26,9],[-26,9]],look:()=>({body:pick([0x2b6fd6,0x1f4f9a,0xf28b0f]),legs:0xf1ece1,skin:pick(SKINS),hair:0x111111}),flag:true,
    say:'Announcement: "India team airport pe! Fans ki bheed T2 hall mein."',chant:'India! India!'},
  train:{name:'Baraat',path:[[-56,1.6],[46,1.6]],look:()=>({body:pick([0xff5fa2,0xf5d000,0xf28b0f,0xe0242b,0x9b59b6]),legs:pick([0xf1ece1,0x2c2c36]),skin:pick(SKINS),hair:0x111111,turban:chance(.4)?pick([0xf5d000,0xe0242b,0xff5fa2]):undefined}),dhol:true,
    say:'Announcement: "Platform 4 pe ek baraat aa rahi hai. Kripya rasta dein."',chant:'Baraat aayi!'},
  bus:{name:'Baraat',path:[[38,4],[-38,4]],look:()=>({body:pick([0xff5fa2,0xf5d000,0xf28b0f,0xe0242b,0x9b59b6]),legs:pick([0xf1ece1,0x2c2c36]),skin:pick(SKINS),hair:0x111111,turban:chance(.4)?pick([0xf5d000,0xe0242b]):undefined}),dhol:true,
    say:'Conductor: "Arre baraat aa gayi! Side do, side do!"',chant:'Baraat aayi!'},
  port:{name:'Shift change',path:[[8,-28],[8,24],[-12,24],[-12,-28]],look:()=>({body:0xf28b0f,legs:0x2c3150,skin:pick(SKINS),hair:0x111111,cap:0xf5d000,capPeak:0xd9b000}),
    say:'Radio: "Shift change! Naye workers gate se andar aa rahe hain."',chant:''}};
const CR={on:false,members:[],u:0,len:0,inT:0,picked:false,beatT:0};
function crowdStart(){const C=CROWDS[ZONE_ID];if(!C||!RT.on)return;const segs=[];let L=0;for(let i=0;i<C.path.length-1;i++){const a=C.path[i],b=C.path[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push({a,b,l,s:L});L+=l;}CR.segs=segs;CR.len=L;CR.u=0;
  for(let i=0;i<14;i++){const o=C.look();const ox=rnd(-2.6,2.6),oz=rnd(-1.4,1.4);const a=C.path[0];const n=ZONE_ID==='airport'?npc(o,a[0]+ox,a[1]+oz,'HALL'):npc(o,a[0]+ox,a[1]+oz,'platform','wander');n.beh='wander';n.walk=1.6;n.wait=0;n.crowdOff=[ox,oz];
    if(C.dhol&&i<2){const d=new T.Mesh(new T.CylinderGeometry(.25,.25,.5,12),new T.MeshStandardMaterial({color:0xd35400}));d.rotation.z=Math.PI/2;d.position.set(0,.85,.35);n.g.add(d);}
    if(C.flag&&i%4===0){const f=new T.Mesh(new T.PlaneGeometry(.6,.4),new T.MeshBasicMaterial({map:canvasTex(60,40,(g,w,h)=>{g.fillStyle='#ff9933';g.fillRect(0,0,w,h/3);g.fillStyle='#fff';g.fillRect(0,h/3,w,h/3);g.fillStyle='#138808';g.fillRect(0,2*h/3,w,h/3);}),side:T.DoubleSide,toneMapped:false}));f.position.set(.3,2.3,0);n.g.add(f);}
    CR.members.push(n);}
  CR.on=true;toast(C.say,'info');banner(`${C.name}! Get inside the crowd: guards can barely see you there. Watch your pockets.`);setTimeout(()=>{if(RT.on)banner(null);},6000);}
function crowdAt(u){for(const sg of CR.segs){if(u<=sg.s+sg.l){const f=(u-sg.s)/sg.l;return [lerp(sg.a[0],sg.b[0],f),lerp(sg.a[1],sg.b[1],f)];}}const l=CR.segs[CR.segs.length-1];return l.b;}
function crowdTick(dt){if(CR.at>0){CR.at-=dt;if(CR.at<=0)crowdStart();}if(!CR.on)return;CR.u+=dt*1.25;const c=crowdAt(CR.u);
  for(const n of CR.members){n.target=[c[0]+n.crowdOff[0],c[1]+n.crowdOff[1]];}
  const d=Math.hypot(P.pos.x-c[0],P.pos.z-c[1]);const C=CROWDS[ZONE_ID];
  if(C.dhol&&d<22&&(CR.beatT-=dt)<=0){CR.beatT=.36;const k=(CR.bt=(CR.bt||0)+1)%4;burst(.09,k%2?260:150,k===0?.55:.35);if(k===0)tone(80,.18,'sine',.12);}
  if(C.chant&&d<14&&(CR.chT=(CR.chT||0)-dt)<=0){CR.chT=9;voiceFor(`Crowd: "${C.chant}"`);}
  const inside=CR.members.filter(n=>Math.hypot(n.pos.x-P.pos.x,n.pos.z-P.pos.z)<2.2).length>=3;
  if(inside){CR.inT+=dt;for(const g of G){if(g.state!=='alert'&&g.sus>0)g.sus=Math.max(0,g.sus-12*dt);}
    if(CR.inT>5&&!CR.picked){CR.picked=true;if(Math.random()<.35){if(RUN.darts>0){RUN.darts--;drawDartBtn();toast('Jeb kat gayi! A pickpocket in the crowd took a dart.');}else{RUN.cash=Math.max(0,RUN.cash-10000);toast('Jeb kat gayi! −₹10,000 run cash.');}}}}
  if(CR.u>=CR.len+4){CR.on=false;for(const n of CR.members){n.g.visible=false;const i=NPC.indexOf(n);if(i>=0)NPC.splice(i,1);scene.remove(n.g);}CR.members=[];toast(`The ${CROWDS[ZONE_ID].name.toLowerCase()} has passed.`,'info');}}
/* ---- disguises with rules: each changes how guards read you ---- */
const DISG={burqa:{name:'Burqa',emoji:'🧕',zones:null,rule:'Face hidden: photo guards cannot match you. But running in a burqa turns heads.',
    look:{body:0x15151c,legs:0x15151c,shawl:0x15151c,skin:0xc68b5e,hair:0x15151c,longHair:true}},
  coolie:{name:'Coolie',emoji:'🧳',zones:['train','bus'],rule:'Coolies go everywhere on a platform: guards mostly ignore you. The luggage slows you down.',
    look:{body:0xc0392b,legs:0x2c2c36,skin:0xc68b5e,hair:0x1a1a1a,band:true}},
  delivery:{name:'Delivery rider',emoji:'📦',zones:null,rule:'Keep moving and nobody looks twice. Stand still for long and you look out of place.',
    look:{body:0xe0242b,legs:0x2c2c36,skin:0xc68b5e,hair:0x1a1a1a,cap:0xe0242b,capPeak:0x7a1f1f}}};
const SADHU={name:'Sadhu',emoji:'🧘',rule:'Saffron robes, ash and a big beard: photo guards cannot match you. But a sadhu sprinting turns heads.',look:{body:0xf28b0f,legs:0xf28b0f,shawl:0xe07a1f,turban:0xf28b0f,hair:0x111111}};
const DZ={stillT:0};
function canWear(k){const d=DISG[k];return d&&(!d.zones||d.zones.includes(ZONE_ID));}
function wearDisguise(k){if(!canWear(k))return;S.look={outfit:k,hat:false};S.wanted=null;G.forEach(g=>{if(g.state!=='alert'){g.sus=Math.min(g.sus,10);g.state='patrol';}});dressPlayer();RUN.lh.disguise=(RUN.lh.disguise||0)+1;
  const dd=k==='burqa'&&isMale()?SADHU:DISG[k];toast(`${dd.emoji} ${dd.name}: ${dd.rule}`,'good');drawGun();}
function dressPlayer(){const k=S.look.outfit;let d=DISG[k];if(!d||!P)return;if(k==='burqa'&&isMale())d=SADHU;const pos=P.pos.clone(),yaw=P.yaw,sc=P.seat;scene.remove(P.g);
  P=chibi(charLook(Object.assign({shadow:true},d.look)));P.pos.copy(pos);P.yaw=yaw;P.g.rotation.y=yaw;P.dz=k;
  const ring=new T.Mesh(new T.RingGeometry(.5,.62,28),new T.MeshBasicMaterial({color:0xf5b82e,transparent:true,opacity:.85,toneMapped:false,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.04;P.g.add(ring);P.ring=ring;
  if(k==='burqa'&&isMale()&&P.head){const bd=new T.Mesh(new T.ConeGeometry(.32,.6,10),new T.MeshStandardMaterial({color:0x2b2b2b}));bd.rotation.x=Math.PI;bd.position.set(0,-.45,.25);P.head.add(bd);}
  else if(k==='burqa'&&P.head){const v=new T.Mesh(new T.SphereGeometry(.53,16,12,0,Math.PI*2,0,Math.PI*.75),new T.MeshStandardMaterial({color:0x15151c,side:T.DoubleSide}));v.rotation.x=-.25;P.head.add(v);const slit=new T.Mesh(new T.BoxGeometry(.5,.08,.05),new T.MeshBasicMaterial({color:0xc68b5e}));slit.position.set(0,.08,.5);P.head.add(slit);}
  if(k==='coolie'){const l=new T.Mesh(new T.BoxGeometry(.7,.45,.5),new T.MeshStandardMaterial({color:0x6a5a3a}));l.position.set(0,1.95,0);P.g.add(l);}
  if(k==='delivery'){const bx=new T.Mesh(new T.BoxGeometry(.55,.55,.4),new T.MeshStandardMaterial({color:0xe0242b}));bx.position.set(0,1.05,-.42);P.g.add(bx);}}
function disguiseTick(dt){if(HUNT.gBase===undefined)HUNT.gBase=HUNT.g;const k=S.look.outfit;if(DISG[k]&&P&&P.dz!==k)dressPlayer();
  let mult=1;P.slow=1;const moving=P.speed>.1,running=input.run||input.keys.ShiftLeft||input.keys.ShiftRight;
  if(k==='burqa')mult=moving&&running?1.6:.85;
  else if(k==='coolie'){mult=S.area==='train'?1.3:.45;P.slow=.85;}
  else if(k==='delivery'){DZ.stillT=moving?0:DZ.stillT+dt;mult=DZ.stillT>4?1.8:.5;}
  HUNT.g=HUNT.gBase*mult;}
/* walkable straight line: no wall or edge of any height between two points (current level only) */
function segClear(ax,az,bx,bz){const dx=bx-ax,dz=bz-az;for(const c of COL){if(!c.on)continue;if(c.area&&S.area&&((S.area==='bridge')!==(c.area==='bridge')))continue;let t0=0,t1=1,hit=true;
  for(const [p0,d,lo,hi] of [[ax,dx,c.x0-.3,c.x1+.3],[az,dz,c.z0-.3,c.z1+.3]]){if(Math.abs(d)<1e-6){if(p0<lo||p0>hi){hit=false;break;}}else{let a1=(lo-p0)/d,b1=(hi-p0)/d;if(a1>b1)[a1,b1]=[b1,a1];t0=Math.max(t0,a1);t1=Math.min(t1,b1);if(t0>t1){hit=false;break;}}}
  if(hit&&t0<=t1&&t0<1&&t1>0)return false;}return true;}
/* an abandoned bag with a disguise inside appears in most zones */
const BAG={mesh:null,used:false,kind:null};
function spawnBag(){if(!RT.on||BAG.mesh||!P||RUN.char!=='actress'&&Math.random()>.7)return;const opts=Object.keys(DISG).filter(canWear);if(!opts.length)return;BAG.kind=pick(opts);
  let x=P.pos.x,z=P.pos.z;for(let i=0;i<16;i++){const a=rnd(0,6.28),d=rnd(6,14),q={x:P.pos.x+Math.sin(a)*d,z:P.pos.z+Math.cos(a)*d};const c={x:q.x,z:q.z};collide(c);if(Math.hypot(c.x-q.x,c.z-q.z)<.01&&segClear(P.pos.x,P.pos.z,c.x,c.z)){x=c.x;z=c.z;break;}}
  const g=new T.Group();g.position.set(x,P.pos.y>1?P.pos.y:0,z);scene.add(g);new T.Mesh();const bag=new T.Mesh(new T.BoxGeometry(.7,.45,.4),new T.MeshStandardMaterial({color:0x3a6b8a}));bag.position.y=.23;g.add(bag);
  const mk=new T.Mesh(new T.OctahedronGeometry(.2),new T.MeshBasicMaterial({color:0xffd166,toneMapped:false}));mk.position.y=1.1;g.add(mk);BAG.mesh=g;BAG.mk=mk;const area=S.area;
  inter({area,label:()=>`Abandoned bag: wear the ${(BAG.kind==='burqa'&&isMale()?SADHU:DISG[BAG.kind]).name.toLowerCase()} disguise`,r:1.6,on:()=>!BAG.used&&RT.on,pos:()=>[g.position.x,g.position.z],run:async()=>{const ok=await hold('Bag khol ke kapde badal rahi ho…',2.2,true);if(!ok)return;BAG.used=true;scene.remove(g);wearDisguise(BAG.kind);}});
  toast(`Someone left a bag nearby (yellow marker). Might be useful…`,'info');}
/* ---- burned looks: the last look a camera or an alert caught follows you to the next zone ---- */
const LOOKNAME={coath:'trench coat + hat',coat:'trench coat',staff:'staff uniform',staffh:'staff uniform',shawlh:'shawl + topi',shawl:'shawl',caph:'cap + sunglasses',cap:'cap',dupatta:'red dupatta + glasses',workerh:'dock worker jacket',worker:'dock worker jacket',crew:'crew jacket',burqa:'burqa',coolie:'coolie shirt + luggage',delivery:'delivery rider'};
const lookName=k=>LOOKNAME[k]||k;
const SEEN={alerts:0,photos:0};
function seenTick(){const a=S.alerts||0,ph=(S.photos||[]).length;if(a>SEEN.alerts||ph>SEEN.photos){SEEN.alerts=a;SEEN.photos=ph;if(RUN.seen!==lookKey()){RUN.seen=lookKey();RUN.seenZone=ZONE_ID;saveRun(RUN);}}}
function wantedCard(){if(!RUN.seen||RUN.seenZone===ZONE_ID&&RUN.legs.length===0)return;if(RUN.char==='actress'&&Math.random()<.5){toast('🎭 The police photo of you is too blurry to use. Lucky.','good');return;}S.startLook=RUN.seen;G.forEach(g=>{if(g.knows===undefined)g.knows=false;});
  const same=lookKey()===RUN.seen;const d=document.createElement('div');d.style.cssText='position:fixed;right:16px;top:calc(190px + env(safe-area-inset-top));z-index:31;width:150px;background:#efe4c8;color:#111;border:3px solid #111;box-shadow:4px 4px 0 #111;padding:8px;text-align:center;rotate:2deg;pointer-events:none';
  d.innerHTML=`<div style="font:400 26px 'Bangers',Impact,sans-serif;letter-spacing:1px">WANTED</div><div style="font:700 12px 'Space Grotesk',sans-serif;margin:4px 0">Last seen at the ${esc(ZONES[RUN.seenZone]?ZONES[RUN.seenZone].name:'last zone')} in:</div><div style="font:700 15px 'Space Grotesk',sans-serif;color:#8a1f1f">${esc(lookName(RUN.seen))}</div>
    <div style="font:600 11px sans-serif;margin-top:5px;color:${same?'#c0392b':'#1e7a4a'}">${same?'You still look like this. Change it!':'You look different now.'}</div>`;
  document.body.appendChild(d);setTimeout(()=>{d.style.transition='opacity .6s';d.style.opacity=0;setTimeout(()=>d.remove(),700);},7000);}
/* rush hour: extra passengers flood the zone */
function rushHour(){const n=18;for(let i=0;i<n;i++){let c=null;
  if(ZONE_ID==='airport'){const [x,z]=randIn('HALL');c=npc(paxOpts(),x,z,'HALL');}
  else if(ZONE_ID==='train'){c=npc(paxOpts(),rnd(-55,50),rnd(-2,3.8),'platform');}
  else if(ZONE_ID==='bus'){c=npc(paxOpts(),rnd(-36,36),rnd(-3,10),'platform');}
  else if(ZONE_ID==='port'){c=npc({body:0xf28b0f,legs:0x2c3150,skin:pick(SKINS),hair:0x111111,cap:0xf5d000,capPeak:0xd9b000},pick([-31,-12,8,27])+rnd(-1,1),rnd(-26,22),'platform');c.worker=true;}
  if(c)c.walk=rnd(.9,1.2);}
  toast('Rush hour! The place is packed. Blend in.','info');}
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
  const nCam=S.camsSeen?S.camsSeen.size:0;RUN.lh.cams+=nCam;recordWorld(win);addEvidence(win);
  const legScore=win?Math.round(100+RUN.leg*40+(S.alerts?0:60)+Math.max(0,S.timeLeft)|0):0;const cash=win?40000+RUN.leg*15000:0;
  RUN.legs.push({zone:ZONE_ID,win,traces:S.traces.length,alerts:S.alerts});
  const EX=RT.exit&&EXITS[RT.exit];if(EX&&win){RUN.cash+=cash*(EX.cash-1);if(RT.exit==='flight'){RUN.lh.flight++;W.stars=0;RUN.wanted=0;RUN.darts++;}if(RT.exit==='station'||RT.exit==='city'||RT.exit==='ship'||RT.exit==='landed'){W.stars=0;RUN.wanted=0;}}
  if(win&&RUN.raid&&RUN.leg===1){RUN.raid=false;const B=getBoard();B.strength=0;B.photos=[];B.notes=[];B.cleared=(B.cleared||0)+1;wjson(BKEY,B);RUN.cash+=500000;
    WORLD.news.push({zone:ZONE_ID,text:'Inspector Rana ka case gira: saboot nakaafi, suspect faraar',at:Date.now()});wjson(WKEY,WORLD);toast('RAID SURVIVED! Rana\'s case board is wiped. +₹5,00,000','good');}
  if(win){RUN.score+=legScore;RUN.cash+=cash;const nOpt=RUN.char==='driver'?3:2;const opts=(EX?shuffle(EX.next).slice(0,nOpt):shuffle(GROUND.filter(z=>z!==ZONE_ID)).slice(0,nOpt)).map(z=>({z,mods:rollMods(RUN.leg+1)}));RUN.offer=opts;saveRun(RUN);
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
function caughtChoice(){const rec=RUN.records||0,left=2+(CAREER.bailUp||0)-rec,shot=/^Shot by/.test(RUN.dead.why||'');const bail=Math.round(RUN.cash*.5);
  if(left<=0)return runOver(false);
  const c=sheet(`<div class="eyebrow">ESCAPE · LEG ${RUN.leg}</div><h2 style="color:var(--red)">${shot?'Shot down':'Caught'}</h2>
    <p>${esc(RUN.dead.who?'Caught by '+RUN.dead.who+'.':RUN.dead.why||'')}</p>
    <div class="dossier"><h3>Police record</h3><p style="margin:4px 0 0;color:#1b1b1b">${shot?'Hospital, phir hawalaat.':'Thane mein raat guzri.'} Ek vakeel bail dila sakta hai, par record mein naam aa jaayega.</p>
    <dl><dt>Bail</dt><dd>${inr(bail)} (half the run cash)</dd><dt>Record</dt><dd>+1 (wanted ★★ carries on)</dd><dt>Chances left</dt><dd>${left} of ${2+(CAREER.bailUp||0)}</dd></dl><span class="stampx">FIR</span></div>
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
    <button class="btn" id="board" type="button" style="background:#8a5a3a">Rana's case board · ${getBoard().strength}%</button>
    <button class="btn" id="again" type="button" style="background:#e0242b">New run</button><a class="btn alt" href="index.html">Safehouse</a>`);
  c.querySelector('#again').onclick=startNewRun;c.querySelector('#board').onclick=()=>showBoard(()=>runOver(banked));}
window.__run={gtx:t=>gtx(t),wantedCard:()=>wantedCard(),rushHour:()=>rushHour(),wearDisguise:k=>wearDisguise(k),spawnBag:()=>{const o=Math.random;Math.random=()=>0;try{spawnBag();}finally{Math.random=o;}},BAG,HUNT2:HUNT,CR,crowdStart:()=>crowdStart(),PH,incoming:()=>incoming(),endCall:a=>endCall(a),togglePhone:()=>togglePhone(),CT,spawnContact:()=>{RUN.leg=Math.max(RUN.leg,2);const o=Math.random;Math.random=()=>0;try{spawnContact();}finally{Math.random=o;}},W,WORLD,newsFlash:(t,s)=>newsFlash(t,s),gateOpen:()=>gateOpen(),switchWpn:()=>switchWpn(),shootGun:()=>shootGun(),addStars:(n)=>addStars(n,'test'),runEnd:(...a)=>runEnd(...a),shootDart:()=>shootDart(),get RUN(){return RUN;},HUNT,RT};
/*RUN-END*/
const NAMES=[['Ananya','Sethi'],['Kavya','Arora'],['Riya','Joshi'],['Meera','Khanna'],['Aditi','Rao'],['Sana','Mirza'],['Isha','Bhatt']];
const CITIES=['Indore','Pune','Lucknow','Jaipur','Surat','Nagpur','Bhopal'];
const JOBS=['Sales manager','Software tester','Purchase executive','Logistics coordinator','Fashion buyer'];
const L=coverFix((()=>{try{const c=JSON.parse(localStorage.getItem('trace_cover')||'null');if(c&&c.given)return {given:c.given,surname:c.surname,city:c.city,job:c.job};}catch(e){}const n=pick(NAMES);return {given:n[0],surname:n[1],city:pick(CITIES),job:pick(JOBS)};})());
const TRACKS={A:6.5,B:19};let TRK=chance(.5)?'A':'B';const PFN=()=>TRK==='A'?4:6;const DOOR_Z=()=>TRACKS[TRK]-2.4;let trainG=null,decoyG=null;
const DESTS=['JAIPUR','AJMER','AGRA','KOTA','UDAIPUR'];
const MY_BUS=ri(1,3);            // which parked bus is ours
const MY_DEST=DESTS[MY_BUS];
const JOB='pickup';
const S={phase:'title',t:0,timeLeft:180,traces:[],camsSeen:new Set(),alerts:0,wanted:null,photos:[],look:{outfit:'coat',hat:true},startLook:'coath',
  hold:null,done:false,escape:0,seat:null,covered:false,checkDone:false,stage:'drive1',stageT:0,paid:false};
const lookKey=()=>S.look.outfit+(S.look.hat?'h':'');
function toast(t,k='bad'){t=gtx(t);try{voiceFor(t);}catch(e){}const d=document.createElement('div');d.className='toast'+(k==='info'?' info':k==='good'?' good':'');d.textContent=t;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),4200);while($('#toasts').children.length>3)$('#toasts').firstChild.remove();}
const clockS=()=>{const m=Math.max(0,Math.ceil(S.timeLeft));return `${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}`;};
function trace(t){S.traces.push({t:clockS(),text:t});toast('Trace: '+t);}
function banner(text,danger){const b=$('#banner');if(!text){b.hidden=true;document.body.classList.remove('banner');return;}text=gtx(text);b.textContent=text;b.className=danger?'danger':'';b.hidden=false;document.body.classList.add('banner');}

/* ---------------- audio ---------------- */
const AU={ctx:null,on:true};
function auInit(){if(AU.ctx)return;try{const C=window.AudioContext||window.webkitAudioContext;AU.ctx=new C();AU.m=AU.ctx.createGain();AU.m.gain.value=.8;AU.m.connect(AU.ctx.destination);
  const len=AU.ctx.sampleRate*3,b=AU.ctx.createBuffer(1,len,AU.ctx.sampleRate),c=b.getChannelData(0);let l=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;l=(l+.02*w)/1.02;c[i]=l*3.5;}AU.noise=b;
  const s=AU.ctx.createBufferSource();s.buffer=b;s.loop=true;AU.f=AU.ctx.createBiquadFilter();AU.f.type='lowpass';AU.f.frequency.value=600;AU.amb=AU.ctx.createGain();AU.amb.gain.value=.08;s.connect(AU.f).connect(AU.amb).connect(AU.m);s.start();
  AU.tens=AU.ctx.createGain();AU.tens.gain.value=0;for(const fr of [55,58.3]){const o=AU.ctx.createOscillator();o.type='sawtooth';o.frequency.value=fr;const lp=AU.ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=300;o.connect(lp).connect(AU.tens);o.start();}AU.tens.connect(AU.m);
}catch(e){AU.ctx=null;}}
function tone(f,d,type='sine',v=.2,w=0){if(!AU.ctx||!AU.on)return;const t=AU.ctx.currentTime+w,o=AU.ctx.createOscillator(),g=AU.ctx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(AU.m);o.start(t);o.stop(t+d+.05);}
function burst(d,f,v=.5,type='lowpass',w=0){if(!AU.ctx||!AU.on)return;const t=AU.ctx.currentTime+w,s=AU.ctx.createBufferSource(),fl=AU.ctx.createBiquadFilter(),g=AU.ctx.createGain();s.buffer=AU.noise;fl.type=type;fl.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl).connect(g).connect(AU.m);s.start(t,Math.random());s.stop(t+d+.05);}
const sfx={chime(){tone(784,1.2,'sine',.12);tone(659,1.2,'sine',.12,.35);tone(523,1.4,'sine',.12,.7);},step(){burst(.05,420,.1);},q(){tone(520,.12,'triangle',.12);tone(700,.14,'triangle',.1,.1);},
  alert(){tone(110,.9,'sawtooth',.12);tone(165,.9,'sawtooth',.08);burst(.4,900,.6);},thak(){burst(.14,800,.9);tone(70,.25,'sine',.5);},ok(){tone(660,.1,'triangle',.12);tone(990,.18,'triangle',.12,.1);},
  shutter(){burst(.05,5000,.5,'highpass');burst(.08,2500,.35,'bandpass');},tick(){tone(1800,.03,'square',.03);},
  horn(){tone(311,1.1,'sawtooth',.06);tone(392,1.1,'sawtooth',.05);tone(311,1.4,'sawtooth',.06,1.2);tone(392,1.4,'sawtooth',.05,1.2);},
  clack(v=.35){burst(.07,260,v);burst(.07,260,v*.8,'lowpass',.13);}};

/* ---------------- renderer ---------------- */
const canvas=$('#gl');
const COMIC=/look=comic/.test(location.search);
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();scene.background=new T.Color(0x141936);scene.fog=new T.Fog(0x141936,40,120);
const camera=new T.PerspectiveCamera(55,1,.1,300);
let composer;
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?66:50;camera.updateProjectionMatrix();composer&&composer.setSize(w,h);}
addEventListener('resize',resize);resize();
composer=new EffectComposer(renderer,new T.WebGLRenderTarget(innerWidth,innerHeight,{type:T.HalfFloatType,samples:COMIC?0:Math.min(4,renderer.capabilities.maxSamples||0)}));
composer.setPixelRatio(renderer.getPixelRatio());
/* comic ink: the scene is rendered into its own target with a depth texture, then inked (black outlines where depth jumps) */
class InkPass extends Pass{constructor(){super();this.rt=new T.WebGLRenderTarget(4,4,{type:T.HalfFloatType});this.rt.depthTexture=new T.DepthTexture(4,4);
  this.mat=new T.ShaderMaterial({uniforms:{tDiffuse:{value:null},tDepth:{value:null},res:{value:new T.Vector2(4,4)},near:{value:.1},far:{value:300}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
    fragmentShader:`uniform sampler2D tDiffuse,tDepth;uniform vec2 res;uniform float near,far;varying vec2 vUv;
      float lin(vec2 uv){float z=texture2D(tDepth,uv).x*2.0-1.0;return 2.0*near*far/(far+near-z*(far-near));}
      void main(){vec4 c=texture2D(tDiffuse,vUv);vec2 px=2.2/res;float d=lin(vUv);float e=0.0;
        e=max(e,abs(lin(vUv+vec2(px.x,0.0))-d));e=max(e,abs(lin(vUv-vec2(px.x,0.0))-d));e=max(e,abs(lin(vUv+vec2(0.0,px.y))-d));e=max(e,abs(lin(vUv-vec2(0.0,px.y))-d));
        e/=max(d*.045,.12);float ink=smoothstep(.25,.7,e);vec3 col=c.rgb;float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,1.15);
        gl_FragColor=vec4(mix(col,vec3(.03,.02,.04),ink*.92),1.0);}`});this.quad=new FullScreenQuad(this.mat);}
  setSize(w,h){this.rt.setSize(w,h);this.mat.uniforms.res.value.set(w,h);}
  render(r,write){r.setRenderTarget(this.rt);r.clear();r.render(scene,camera);this.mat.uniforms.tDiffuse.value=this.rt.texture;this.mat.uniforms.tDepth.value=this.rt.depthTexture;
    this.mat.uniforms.near.value=camera.near;this.mat.uniforms.far.value=camera.far;r.setRenderTarget(this.renderToScreen?null:write);this.quad.render(r);}}
composer.addPass(COMIC?new InkPass():new RenderPass(scene,camera));
composer.addPass(new UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),.45,.45,.85));composer.addPass(new OutputPass());resize();
const hemi=new T.HemisphereLight(0xfff0dc,0x40406a,1.25);scene.add(hemi);
const sun=new T.DirectionalLight(0xffe2b8,1.3);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:70});sun.shadow.bias=-.0006;scene.add(sun,sun.target);

/* ---------------- helpers ---------------- */
const TOON_G=(()=>{const d=new Uint8Array([70,70,70,255,150,150,150,255,255,255,255,255]);const t=new T.DataTexture(d,3,1);t.minFilter=t.magFilter=T.NearestFilter;t.needsUpdate=true;return t;})();
const mats={};const m=(c,o={})=>{const k=c+JSON.stringify(o);if(mats[k])return mats[k];
  if(COMIC){const q={color:c,gradientMap:TOON_G};for(const a of ['map','side','transparent','opacity','depthWrite','emissive','emissiveIntensity'])if(o[a]!==undefined)q[a]=o[a];return mats[k]=new T.MeshToonMaterial(q);}
  return mats[k]=new T.MeshStandardMaterial(Object.assign({color:c,roughness:.75,metalness:0},o));};
const glow=(c,i=2)=>{const k='g'+c+i;if(!mats[k]){mats[k]=new T.MeshBasicMaterial({color:c,toneMapped:false});mats[k].color.multiplyScalar(i);}return mats[k];};
const RB={};const rb=(w,h,d,r=.12)=>{const k=[w,h,d,r].join();return RB[k]||(RB[k]=new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/2-.001,h/2-.001,d/2-.001)));};
function mesh(geo,mat,x=0,y=0,z=0,parent=scene,o={}){const me=new T.Mesh(geo,mat);me.position.set(x,y,z);me.castShadow=o.cast??false;me.receiveShadow=o.recv??true;parent.add(me);return me;}
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;t._g=g;return t;}
function signTex(text,bg,fg,w=512,h=128,font="700 64px 'Space Grotesk', sans-serif"){return canvasTex(w,h,g=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.fillStyle=fg;g.font=font;g.textAlign='center';g.textBaseline='middle';g.fillText(text,w/2,h/2+4);});}
function sign(text,x,y,z,ry=0,w=6,h=1.1,bg='#f5d000',fg='#111',parent=scene){const p=mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:signTex(text,bg,fg,Math.round(256*w/h),256,"700 118px 'Space Grotesk', sans-serif"),toneMapped:false}),x,y,z,parent);p.rotation.y=ry;return p;}
const COL=[];
function box(x0,x1,z0,z1,h,mat,o={}){const xa=Math.min(x0,x1),xb=Math.max(x0,x1),za=Math.min(z0,z1),zb=Math.max(z0,z1);
  const me=mesh(rb(xb-xa,h,zb-za,Math.min(.12,(xb-xa)/2,(zb-za)/2)),mat,(xa+xb)/2,(o.y0||0)+h/2,(za+zb)/2,o.parent||scene,{cast:o.cast||false});
  let c=null;if(o.collide!==false){c={x0:xa,x1:xb,z0:za,z1:zb,on:true,tall:o.tall??h>1.6};COL.push(c);}return {me,c};}
function losBlocked(ax,az,bx,bz){const dx=bx-ax,dz=bz-az;for(const c of COL){if(!c.on||!c.tall)continue;if((S.area==='bridge')!==(c.area==='bridge'))continue;let t0=0,t1=1;
  for(const [p,d,lo,hi] of [[ax,dx,c.x0,c.x1],[az,dz,c.z0,c.z1]]){if(Math.abs(d)<1e-6){if(p<lo||p>hi){t0=2;break;}}else{let a=(lo-p)/d,b=(hi-p)/d;if(a>b)[a,b]=[b,a];t0=Math.max(t0,a);t1=Math.min(t1,b);if(t0>t1)break;}}
  if(t0<=t1&&t0<1&&t1>0)return true;}return false;}
function collide(p,r=.3){for(const c of COL){if(!c.on)continue;if((S.area==='bridge')!==(c.area==='bridge'))continue;const cx=clamp(p.x,c.x0,c.x1),cz=clamp(p.z,c.z0,c.z1);const dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;
  if(d2<r*r){if(d2>1e-8){const d=Math.sqrt(d2);p.x=cx+dx/d*r;p.z=cz+dz/d*r;}else{const l=p.x-c.x0,rr=c.x1-p.x,f=p.z-c.z0,b=c.z1-p.z,mn=Math.min(l,rr,f,b);if(mn===l)p.x=c.x0-r;else if(mn===rr)p.x=c.x1+r;else if(mn===f)p.z=c.z0-r;else p.z=c.z1+r;}}}}

/* ---------------- chibi characters ---------------- */
function chibi(o){const g=new T.Group();const root=new T.Group();root.scale.setScalar(o.scale||.62);g.add(root);
  const pivot=(x,y)=>{const p=new T.Group();p.position.set(x,y,0);root.add(p);return p;};
  const legL=pivot(-.18,.55),legR=pivot(.18,.55);
  for(const Lg of [legL,legR]){mesh(new T.CapsuleGeometry(.13,.26,4,8),m(o.legs||0x2c3150),0,-.27,0,Lg,{cast:o.shadow});mesh(rb(.26,.14,.36,.06),m(o.shoes||0x1b1b24),0,-.5,.06,Lg);}
  if(o.coat){mesh(new T.CylinderGeometry(.4,.56,.95,18),m(o.body),0,.98,0,root,{cast:o.shadow});mesh(new T.SphereGeometry(.42,16,10,0,Math.PI*2,0,Math.PI/2),m(o.body),0,1.42,0,root);mesh(new T.TorusGeometry(.47,.05,6,20),m(0x6b4a2f),0,.86,0,root).rotation.x=Math.PI/2;}
  else mesh(new T.CapsuleGeometry(.42,.5,6,14),m(o.body),0,.98,0,root,{cast:o.shadow});
  if(o.shawl){const sh=mesh(new T.CylinderGeometry(.5,.52,.55,18,1,true),m(o.shawl,{side:T.DoubleSide}),0,1.2,0,root);}
  const armL=pivot(-.5,1.32),armR=pivot(.5,1.32);
  for(const A of [armL,armR]){mesh(new T.CapsuleGeometry(.11,.34,4,8),m(o.shawl||o.body),0,-.25,0,A);mesh(new T.SphereGeometry(.12,8,6),m(o.skin),0,-.5,0,A);}
  if(o.band)mesh(new T.CylinderGeometry(.13,.13,.12,10),m(0xe0242b),0,-.15,0,armL);
  const head=new T.Group();head.position.y=1.98;root.add(head);
  mesh(new T.SphereGeometry(.5,20,14),m(o.skin,{roughness:.6}),0,0,0,head,{cast:o.shadow});
  if(COMIC){for(const sx of [-1,1]){const e=mesh(new T.SphereGeometry(.075,10,8),m(0x111111),sx*.17,.04,.45,head);e.scale.set(1,1.35,.6);mesh(new T.SphereGeometry(.025,6,4),glow(0xffffff,1),sx*.17+.02,.08,.5,head);const b=mesh(new T.BoxGeometry(.16,.035,.04),m(0x1a1210),sx*.17,.19,.46,head);b.rotation.z=sx*-.18;}}
  if(!o.bald){const hr=mesh(new T.SphereGeometry(.53,20,14,0,Math.PI*2,0,Math.PI*(o.longHair?.62:.52)),m(o.hair),0,.05,-.02,head);hr.rotation.x=-.3;}
  if(o.longHair)mesh(new T.CapsuleGeometry(.36,.4,4,10),m(o.hair),0,-.32,-.22,head);
  for(const s of [-1,1])mesh(new T.SphereGeometry(.07,8,6),m(0x1b1b28),s*.18,.02,.46,head);
  if(o.mustache)mesh(rb(.3,.07,.08,.03),m(0x1b1410),0,-.17,.47,head);
  if(o.glasses){for(const s of [-1,1])mesh(new T.TorusGeometry(.11,.025,6,14),m(0x111111),s*.18,.03,.5,head);}
  if(o.cap){mesh(new T.CylinderGeometry(.5,.56,.26,20),m(o.cap),0,.4,0,head);mesh(new T.CylinderGeometry(.5,.5,.05,20,1,false,-Math.PI/2.2,Math.PI/1.1),m(o.capPeak||0x15183a),0,.3,.18,head);}
  if(o.topi)mesh(new T.CylinderGeometry(.42,.46,.3,20),m(o.topi),0,.42,0,head);
  if(o.turban){const tb=mesh(new T.SphereGeometry(.56,18,12,0,Math.PI*2,0,Math.PI*.55),m(o.turban),0,.12,0,head);tb.scale.y=1.15;}
  if(o.hat){mesh(new T.CylinderGeometry(.82,.82,.06,24),m(o.hat),0,.42,0,head);mesh(new T.CylinderGeometry(.46,.52,.42,20),m(o.hat),0,.64,0,head);mesh(new T.CylinderGeometry(.525,.525,.1,20),m(0xe0242b),0,.5,0,head);}
  if(o.scarf){const sc=mesh(new T.TorusGeometry(.33,.1,8,20),m(o.scarf),0,1.47,0,root);sc.rotation.x=Math.PI/2;}
  if(o.load){mesh(rb(.8,.45,.6,.08),m(o.load),0,.75,0,head);}           // coolie's luggage on the head
  if(o.kettle){mesh(new T.CylinderGeometry(.16,.2,.4,12),m(0xb8bec6,{metalness:.7,roughness:.3}),0,-.6,.12,armR);}
  if(o.board){mesh(new T.BoxGeometry(.06,.5,.38),m(0x3a2a1a),0,-.55,.18,armR);}
  let bag=null;if(o.bag){bag=new T.Group();mesh(rb(.5,.66,.3,.08),m(o.bag,{roughness:.4}),0,.42,0,bag,{cast:o.shadow});bag.position.set(.82,0,.05);root.add(bag);}
  scene.add(g);return {g,root,legL,legR,armL,armR,head,bag,ph:rnd(0,6),pos:g.position,yaw:0,speed:0,opts:o};}
function anim(c,dt,speed,t){if(c.pose==='sit'){c.legL.rotation.x=c.legR.rotation.x=-1.45;c.root.position.y=0;return;}if(c.pose==='lie'){return;}
  c.ph+=dt*(3+speed*3);const s=Math.min(1,speed/1.6),a=Math.sin(c.ph)*.7*s;c.legL.rotation.x=a;c.legR.rotation.x=-a;c.armL.rotation.x=-a*.9;c.armR.rotation.x=(c.bag||c.opts.kettle||c.opts.board)?0:a*.9;c.root.position.y=Math.abs(Math.sin(c.ph))*.06*s;}
function faceTo(c,yaw,dt,k=10){c.yaw+=angDiff(yaw,c.yaw)*Math.min(1,dt*k);c.g.rotation.y=c.yaw;}
function stepTo(c,tx,tz,dt,spd){const dx=tx-c.pos.x,dz=tz-c.pos.z,d=Math.hypot(dx,dz);if(d<.08){c.speed=0;return true;}const v=Math.min(spd,d/dt);c.pos.x+=dx/d*v*dt;c.pos.z+=dz/d*v*dt;c.speed=v;faceTo(c,Math.atan2(dx,dz),dt);return d<.2;}
function sitPose(c,y){c.pose='sit';c.g.position.y=y;}
function liePose(c,y){c.pose='lie';c.g.position.y=y;c.root.rotation.z=Math.PI/2;c.root.position.y=.3;}
const SKINS=[0xe2b48f,0xc68b5e,0x9a6644,0x8f5d3e,0xf0c4a0],HAIRS=[0x111111,0x2a1d14,0x3b2416],SHIRTS=[0x8c6fd1,0x4bb38a,0xf28b82,0x3d6fd6,0xf5d17a,0xd9c3a0,0x9ab6f0,0xe07a4f,0xcdb2ee,0xffffff];
const paxOpts=()=>({body:pick(SHIRTS),skin:pick(SKINS),hair:pick(HAIRS),longHair:chance(.45),bag:chance(.5)?pick([0xff9f43,0x2b2f3a,0x3d6fd6,0x7a1f2a]):null,legs:pick([0x2c3150,0x3a3530,0x55504a]),mustache:chance(.25),turban:chance(.08)?pick([0xe07a4f,0xf5d17a]):null,shawl:chance(.15)?pick([0x8a5a3a,0x6b3a5a]):null});

/* ---------------- guards (RPF) ---------------- */
const G=[];
function coneMesh(range,fov){const geo=new T.CircleGeometry(range,24,-fov,fov*2);const me=new T.Mesh(geo,new T.MeshBasicMaterial({color:0xffd166,transparent:true,opacity:.16,depthWrite:false,toneMapped:false}));me.rotation.x=-Math.PI/2;const piv=new T.Group();piv.add(me);piv.position.y=.03;scene.add(piv);return {piv,me};}
function iconSprite(){const c=document.createElement('canvas');c.width=c.height=128;const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const sp=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:false,toneMapped:false}));sp.scale.set(.9,.9,1);sp.renderOrder=10;scene.add(sp);return {sp,g:c.getContext('2d'),tex,last:''};}
function drawIcon(ic,state,sus){const key=state+Math.round(sus/5);if(ic.last===key)return;ic.last=key;const g=ic.g;g.clearRect(0,0,128,128);if(sus<8&&state==='patrol'){ic.sp.visible=false;return;}ic.sp.visible=true;
  g.lineWidth=10;g.strokeStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(64,64,48,0,7);g.stroke();const col=state==='alert'?'#e0242b':state==='search'?'#ff9f1c':'#ffd166';g.strokeStyle=col;g.beginPath();g.arc(64,64,48,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,sus/100));g.stroke();
  g.fillStyle=col;g.font="700 72px 'Bangers', Impact, sans-serif";g.textAlign='center';g.textBaseline='middle';g.fillText(state==='alert'?'!':'?',64,68);ic.tex.needsUpdate=true;}
const RPF={body:0xb8a06a,legs:0xa08a5a,skin:0x9a6644,hair:0x111111,cap:0x2b3a7a,capPeak:0x1a2240,mustache:true,shadow:true};
function guard(o){const c=chibi(Object.assign({},RPF,o.look||{}));c.pos.set(o.route[0][0],o.y||0,o.route[0][1]);Object.assign(c,{route:o.route,ri:0,state:'patrol',sus:0,range:o.range||9,fov:o.fov||.72,name:o.name||'RPF jawan',lastSeen:null,lost:0,searchT:0,walk:o.walk||1.1,knows:!!o.knows,staticYaw:o.yaw,area:o.area,glance:0});
  c.cone=coneMesh(c.range,c.fov);c.icon=iconSprite();if(o.yaw!==undefined){c.yaw=o.yaw;c.g.rotation.y=o.yaw;}G.push(c);return c;}
function canSee(g,x,z){const dx=x-g.pos.x,dz=z-g.pos.z,d=Math.hypot(dx,dz);if(d<1.8)return losBlocked(g.pos.x,g.pos.z,x,z)?0:Math.max(d,.01);if(d>g.range)return 0;if(Math.abs(angDiff(Math.atan2(dx,dz),g.yaw))>g.fov)return 0;return losBlocked(g.pos.x,g.pos.z,x,z)?0:d;}
let worst='calm';
function goAlert(g,why){if(g.state==='alert')return;g.state='alert';g.sus=100;g.lost=0;S.alerts++;S.wanted=lookKey();sfx.alert();slowmo();vib([90,50,90]);
  toast(`${g.name}: "RUKO!" ${why?'('+why+')':''}`);for(const o of G){if(o!==g&&o.area===g.area&&o.state!=='alert'){o.sus=Math.max(o.sus,62);o.state='search';o.lastSeen=[P.pos.x,P.pos.z];o.searchT=10;}}
  if(S.alerts===1)trace(`${g.name} ne pehchaana, walkie-talkie pe bataya`);}
function flags(){let crowd=0;for(const n of NPC){if(!n.inArea||n.inArea!==S.area)continue;if(Math.hypot(n.pos.x-P.pos.x,n.pos.z-P.pos.z)<2)crowd++;}
  return {running:P.running,action:!!(S.hold&&S.hold.illegal),wanted:S.wanted===lookKey(),crowd,seated:S.seat&&S.seat.kind==='sit',lying:S.seat&&S.seat.kind==='lie'};}
function updGuards(dt,t){const F=flags();worst='calm';
  const station=a=>a==='platform'||a==='bridge';
  for(const g of G){if(isDown(g))continue;if(g.area!==S.area&&!(station(g.area)&&station(S.area))||!g.g.visible){g.cone.piv.visible=false;g.icon.sp.visible=false;continue;}g.cone.piv.visible=true;
    const d=locked&&!S.hold||g.area!==S.area?0:canSee(g,P.pos.x,P.pos.z);let gain=0,why='';
    if(d){const near=clamp(1.25-d/g.range,.35,1.25);
      if(F.running){gain+=30*HUNT.run;why='bhaag rahi thi';}if(F.action){gain+=85;why='kuch kar rahi thi';}if(F.wanted){gain+=40;why='wahi hulia';}
      if(g.knows&&lookKey()===S.startLook){gain+=26;why='photo se match';}
      if(S.area==='train'&&!S.seat&&!F.running)gain+=4;
      gain*=near*(1+(CAREER.heat||0)/160)*HUNT.g;
      if(F.lying)gain*=d<1.6?.4:0;else if(F.seated)gain*=S.covered?.1:.25;else if(!F.action&&!F.running&&F.crowd>=2)gain*=HUNT.crowd;}
    if(gain>0){g.sus=Math.min(100,g.sus+gain*dt);g.lastSeen=[P.pos.x,P.pos.z];g.lost=0;}else if(g.state!=='alert')g.sus=Math.max(0,g.sus-(d?6:9)*dt);
    if(g.state!=='alert'&&g.sus>=100)goAlert(g,why);else if(g.state==='patrol'&&g.sus>=35){g.state='sus';sfx.q();}
    if(g.state==='sus'&&g.sus<25)g.state='patrol';
    let mv=0;
    if(g.state==='alert'){if(d){g.lastSeen=[P.pos.x,P.pos.z];g.lost=0;}else g.lost+=dt;
      if(g.lost>5){g.state='search';g.searchT=8;g.sus=70;}else{stepTo(g,g.lastSeen[0],g.lastSeen[1],dt,3.7);mv=g.speed;if(Math.hypot(P.pos.x-g.pos.x,P.pos.z-g.pos.z)<1.05&&!locked&&g.area===S.area)caught(g);}}
    else if(g.state==='search'){g.searchT-=dt;if(g.lastSeen&&Math.hypot(g.lastSeen[0]-g.pos.x,g.lastSeen[1]-g.pos.z)>1){stepTo(g,g.lastSeen[0],g.lastSeen[1],dt,1.9);mv=g.speed;}else faceTo(g,g.yaw+dt*1.6,1,1);if(g.searchT<=0){g.state='patrol';g.sus=Math.min(g.sus,30);}}
    else if(g.state==='sus'){if(d)faceTo(g,Math.atan2(P.pos.x-g.pos.x,P.pos.z-g.pos.z),dt,5);}
    else{if(g.route.length===1){if(Math.hypot(g.route[0][0]-g.pos.x,g.route[0][1]-g.pos.z)>.3){stepTo(g,g.route[0][0],g.route[0][1],dt,g.walk);mv=g.speed;}else{g.yaw+=angDiff(g.staticYaw+Math.sin(t*.45)*.6,g.yaw)*Math.min(1,dt*2);g.g.rotation.y=g.yaw;}}
      else{const r=g.route[g.ri];if(g.glance>0){g.glance-=dt;}else{if(stepTo(g,r[0],r[1],dt,g.walk))g.ri=(g.ri+1)%g.route.length;mv=g.speed;
        if(S.area==='train'&&chance(dt*.35)){g.glance=1.1;g.yaw=Math.PI;g.g.rotation.y=g.yaw;}}}}
    anim(g,dt,mv,t);
    g.cone.piv.position.set(g.pos.x,(g.pos.y||0)+.03,g.pos.z);g.cone.piv.rotation.y=g.yaw-Math.PI/2;g.cone.me.material.color.set(g.state==='alert'?0xff3030:g.state==='patrol'?0xffe08a:0xff9f1c);g.cone.me.material.opacity=g.state==='patrol'?.13:.24;
    g.icon.sp.position.set(g.pos.x,(g.pos.y||0)+2.3,g.pos.z);drawIcon(g.icon,g.state,g.sus);
    if(g.state==='alert')worst='alert';else if((g.state==='sus'||g.state==='search')&&worst!=='alert')worst='sus';}}
let slowT=0;function slowmo(){slowT=.7;$('#vig').style.opacity=1;setTimeout(()=>$('#vig').style.opacity=0,900);}

/* ---------------- NPCs ---------------- */
const NPC=[];
function npc(o,x,z,area,beh='wander'){const c=chibi(o);c.pos.set(x,0,z);c.inArea=area;c.beh=beh;c.walk=rnd(1,1.35);c.wait=rnd(0,4);NPC.push(c);return c;}

/* =================================================================================
   PART 1 · INTERSTATE BUS ADDA AT DAWN  (x along the yard, buses parked at z=-8 with doors facing +z)
   ================================================================================= */
const BUS_X=k=>-32+k*16;
const COACH_X=BUS_X;
let fruitCart=null;
function busExterior(x,z,dest,col){const g=new T.Group();g.position.set(x,0,z);scene.add(g);
  mesh(rb(12,3.1,2.9,.35),m(col,{roughness:.5}),0,1.75,0,g,{cast:true});mesh(new T.BoxGeometry(12.02,.25,2.92),m(0xf1ece1),0,1.25,0,g);
  for(let i=0;i<6;i++)mesh(new T.PlaneGeometry(1.4,.8),chance(.4)?glow(0xffe0a8,.8):m(0x15202e),-4.6+i*1.7,2.4,1.46,g);
  mesh(new T.PlaneGeometry(.9,2.2),m(0x0b0f18),4.6,1.3,1.46,g);
  mesh(new T.PlaneGeometry(2.8,.55),new T.MeshBasicMaterial({map:signTex(dest,'#111','#ff9a2a',512,110,"700 80px monospace"),toneMapped:false}),-1,3.05,1.46,g);
  mesh(new T.PlaneGeometry(.55,2.4),new T.MeshBasicMaterial({map:signTex(dest,'#111','#ff9a2a',512,110,"700 80px monospace"),toneMapped:false}),6.02,2.4,0,g).rotation.y=Math.PI/2;
  for(const wx of [-4,4])for(const wz of [-1.3,1.3]){const w=mesh(new T.CylinderGeometry(.5,.5,.3,16),m(0x15151a),wx,.5,wz,g);w.rotation.x=Math.PI/2;}
  COL.push({x0:x-6,x1:x+6,z0:z-1.45,z1:z+1.45,on:true,tall:true});return g;}
function buildPlatform(){
  scene.background=new T.Color(0xf2a971);scene.fog=new T.Fog(0xf2a971,40,120);hemi.color.set(0xffe2c4);hemi.groundColor.set(0x8a6a50);sun.color.set(0xffc58a);
  const yardTex=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#b9a88c';g.fillRect(0,0,w,h);for(let i=0;i<2600;i++){g.fillStyle=pick(['rgba(90,70,50,.25)','rgba(255,255,255,.25)','rgba(60,50,40,.2)']);g.fillRect(rnd(0,w),rnd(0,h),rnd(1,4),rnd(1,4));}});
  yardTex.wrapS=yardTex.wrapT=T.RepeatWrapping;yardTex.repeat.set(10,4);
  const fl=mesh(new T.PlaneGeometry(90,28),m(0xffffff,{map:yardTex,roughness:.95}),0,0,0);fl.rotation.x=-Math.PI/2;
  for(let k=0;k<6;k++){const x=BUS_X(k)-8;mesh(new T.BoxGeometry(.15,.02,7),m(0xf1ece1),x,.02,-8);}
  box(-44,44,-12.5,-13.2,6,m(0xd9b98a),{tall:true});box(-44,-43,-13,14,4,m(0xd9b98a));box(43,44,-13,14,4,m(0xd9b98a));box(-44,-6,13.4,14,1.2,m(0xd9b98a));box(6,44,13.4,14,1.2,m(0xd9b98a));
  mesh(new T.BoxGeometry(88,.3,9),m(0x6b5a4a),0,5.2,-8.5);for(let k=0;k<=5;k++)box(BUS_X(k)-8.2,BUS_X(k)-7.8,-4.4,-4,5.2,m(0x7a6b5a),{tall:true,cast:true});
  sign('INTERSTATE BUS ADDA · अंतरराज्यीय बस अड्डा',0,6.2,-12.4,0,16,1.2,'#f5d000','#111');
  for(let k=0;k<5;k++)busExterior(BUS_X(k),-8,DESTS[k],[0xd35400,0x2b6fd6,0x2f9e6a,0xc8302b,0x7a4bb0][k]);
  // ticket counter, chai stall, fruit cart, benches
  box(-40,-34,4,7,2.4,m(0x2b6fd6),{cast:true});sign('TICKET · टिकट',-37,2.9,7.05,0,4,.7,'#1d2340','#ffffff');
  box(-16,-12,8.5,10,1.1,m(0x2f7a46),{cast:true});sign('CHAI · SAMOSA',-14,2.6,10.05,0,3.6,.6,'#1d2340','#ffffff');mesh(new T.BoxGeometry(4.4,.1,2),m(0xe0242b),-14,2.3,9.2);
  box(10,14,8.5,10,1.1,m(0xb5652a),{cast:true});sign('CHASHMA · TOPI',12,2.6,10.05,0,3.6,.6,'#1d2340','#ffffff');mesh(new T.BoxGeometry(4.4,.1,2),m(0xf5d000),12,2.3,9.2);
  fruitCart=new T.Group();fruitCart.position.set(18,0,2);scene.add(fruitCart);mesh(rb(2.4,.5,1.2,.08),m(0x8a5a3a),0,.95,0,fruitCart,{cast:true});
  for(let i=0;i<22;i++)mesh(new T.SphereGeometry(.13,8,6),m(pick([0xf28b0f,0x6abf3a,0xd62b2b,0xf5d000])),rnd(-1,1),1.28+rnd(0,.15),rnd(-.45,.45),fruitCart);
  for(const s of [-1,1]){const w=mesh(new T.CylinderGeometry(.35,.35,.08,14),m(0x222222),s*.8,.35,.65,fruitCart);w.rotation.x=Math.PI/2;}
  COL.push({x0:16.8,x1:19.2,z0:1.4,z1:2.6,on:true,tall:false});
  for(const x of [-26,-4,26])box(x-1.6,x+1.6,11.2,11.8,.45,m(0x6d7ff0),{tall:false});
  // wanted poster with a sketch of the trench coat
  mesh(new T.PlaneGeometry(1.4,1.9),new T.MeshBasicMaterial({map:canvasTex(256,340,(g,w,h)=>{g.fillStyle='#efe4c8';g.fillRect(0,0,w,h);g.fillStyle='#111';g.font="700 46px 'Bangers', Impact";g.textAlign='center';g.fillText('WANTED',w/2,52);
    g.beginPath();g.arc(w/2,140,38,0,7);g.fill();g.fillRect(w/2-60,92,120,12);g.fillRect(w/2-28,72,56,24);g.beginPath();g.moveTo(w/2-58,190);g.lineTo(w/2+58,190);g.lineTo(w/2+72,300);g.lineTo(w/2-72,300);g.fill();g.fillStyle='#e0242b';g.fillRect(w/2-40,186,80,14);
    g.fillStyle='#111';g.font="600 20px monospace";g.fillText('INAAM ₹50,000',w/2,330);})}),42.9,2.2,4).rotation.y=-Math.PI/2;
}
let platformGuards=[],coachDoorGuard=null;
function setupPlatform(){
  buildPlatform();
  for(let i=0;i<24;i++)npc(paxOpts(),rnd(-38,38),rnd(-3,10),'platform');
  for(let k=0;k<5;k++){const c=npc({body:0x9a8a6a,legs:0x3a3530,skin:pick(SKINS),hair:0x111111,mustache:true,board:true},BUS_X(k)+4.6,-5.6,'platform','static');c.yaw=0;c.g.rotation.y=0;c.isConductor=true;c.dest=DESTS[k];}
  const chai=npc({body:0xf1ece1,legs:0x5a5240,skin:0x8f5d3e,hair:0x111111,kettle:true,mustache:true},-10,6,'platform');chai.isChai=true;chai.walk=.9;
  platformGuards.push(guard({route:[[-36,1],[36,1]],area:'platform',knows:true,name:'Police (photo)',look:{band:true}}));
  platformGuards.push(guard({route:[[30,7],[-30,7]],area:'platform',name:'Police hawaldar'}));
  coachDoorGuard=guard({route:[[BUS_X(MY_BUS)+4.6,-5.4]],yaw:0,range:7,area:'platform',name:'Police inspector'});coachDoorGuard.pos.set(60,0,0);coachDoorGuard.g.visible=false;
}
const CAMS=[];
function cctv(id,x,z,yaw,sweep,range,fov=.42){const g=new T.Group();g.position.set(x,4.8,z);scene.add(g);const head=new T.Group();g.add(head);mesh(rb(.3,.24,.6,.06),m(0xf1f3f6),0,0,.2,head,{cast:true});mesh(new T.SphereGeometry(.05,8,6),glow(0xff2d2d,2),0,.08,.5,head);head.rotation.x=.55;
  const cone=coneMesh(range,fov);cone.me.material.color.set(0xff4040);cone.me.material.opacity=.12;cone.piv.position.set(x,.025,z);CAMS.push({id,x,z,base:yaw,yaw,sweep,range,fov,head,cone,ph:rnd(0,6)});}
function camSees(c,x,z){const dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz);if(d>c.range)return false;if(Math.abs(angDiff(Math.atan2(dx,dz),c.yaw))>c.fov)return false;return !losBlocked(c.x,c.z,x,z);}
function updCams(dt){for(const c of CAMS){c.ph+=dt*.3;c.yaw=c.base+Math.sin(c.ph)*c.sweep;c.head.rotation.y=c.yaw;c.cone.piv.rotation.y=c.yaw-Math.PI/2;c.cone.piv.visible=S.area==='platform';
  const seen=S.area==='platform'&&!locked&&camSees(c,P.pos.x,P.pos.z);c.cone.me.material.opacity=seen?.26:.1;if(seen&&!S.camsSeen.has(c.id)){S.camsSeen.add(c.id);snapshot(c);}}}

/* =================================================================================
   PART 2 · INSIDE THE BUS (at z=TZ, x along the bus, front at +x). The near side (+z) is cut away;
   the door, the dhaba and the toll naka are on that side.
   ================================================================================= */
const TZ=-300;
const CO=k=>6;                 // kept for shared code (single vehicle)
const SEATS=[];
const outside=[];
let tc=null,contact=null,grabBag=null,dhaba=null,naka=null,roadTex=null,doorCol=null,dhabaCop=null,driver=null;
function buildTrain(){
  const wallM=m(0xd9c3a0,{roughness:.7}),seatM=m(0x2b6fd6,{roughness:.8}),frameM=m(0x7a6b5a);
  mesh(new T.BoxGeometry(12.4,.2,3),m(0x55504a),0,-.1,TZ);
  box(-6.2,6.2,TZ-1.5,TZ-1.4,1.0,wallM,{tall:true});box(-6.2,6.2,TZ-1.5,TZ-1.4,.6,wallM,{y0:2.2,collide:false});
  for(let x=-5.6;x<=5.6;x+=1.6)box(x-.08,x+.08,TZ-1.5,TZ-1.4,1.2,wallM,{y0:1.0,collide:false});
  box(-6.2,3.9,TZ+1.4,TZ+1.5,.7,wallM,{tall:true});box(5.1,6.2,TZ+1.4,TZ+1.5,.7,wallM,{tall:true});
  doorCol={x0:3.9,x1:5.1,z0:TZ+1.38,z1:TZ+1.52,on:true,tall:false};COL.push(doorCol);
  box(-6.3,-6.2,TZ-1.5,TZ+1.5,2.8,frameM,{tall:true});box(6.2,6.3,TZ-1.5,TZ+1.5,1.0,frameM,{tall:true});
  mesh(new T.PlaneGeometry(2.9,1.4),new T.MeshStandardMaterial({color:0x9fc3e6,transparent:true,opacity:.25,roughness:.05}),6.25,1.9,TZ).rotation.y=-Math.PI/2;
  // seats: 2+2, passengers face the front (+x)
  for(let r=0;r<9;r++){const x=-5.2+r*1.05;
    for(const z of [TZ-1.05,TZ-.55,TZ+.55,TZ+1.05]){mesh(rb(.5,.12,.46,.05),seatM,x,.45,z);mesh(rb(.1,.6,.46,.05),seatM,x-.24,.8,z);
      SEATS.push({kind:'sit',x,z,y:.42,yaw:Math.PI/2,taken:false,row:r});}
    COL.push({x0:x-.3,x1:x+.26,z0:TZ-1.3,z1:TZ-.3,on:true,tall:false});COL.push({x0:x-.3,x1:x+.26,z0:TZ+.3,z1:TZ+1.3,on:true,tall:false});}
  for(const s of SEATS){if(chance(.6)){s.taken=true;const c=npc(paxOpts(),s.x,s.z,'train','static');sitPose(c,s.y);c.yaw=s.yaw;c.g.rotation.y=s.yaw;}}
  driver=npc({body:0x9a8a6a,legs:0x3a3530,skin:0x8f5d3e,hair:0x111111,mustache:true},5.6,TZ-.6,'train','static');sitPose(driver,.42);driver.yaw=Math.PI/2;driver.g.rotation.y=Math.PI/2;
  const sw=mesh(new T.TorusGeometry(.25,.04,8,20),m(0x111111),5.95,1.1,TZ-.6);sw.rotation.y=Math.PI/2;sw.rotation.x=.5;
  mesh(new T.BoxGeometry(.2,.06,.6),glow(0xff7a2a,1.4),6.1,1.5,TZ+.4);                                   // little dashboard idol lamp
  const pl=new T.PointLight(0xffe2b8,12,14,1.4);pl.position.set(0,2.6,TZ);scene.add(pl);
  // road on the near side (scrolls while moving), fields and trees on the far side
  roadTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#3a3d44';g.fillRect(0,0,w,h);for(let i=0;i<600;i++){g.fillStyle=`rgba(255,255,255,${rnd(0,.05)})`;g.fillRect(rnd(0,w),rnd(0,h),2,2);}g.fillStyle='#f1ece1';g.fillRect(0,h*.62,w*.5,8);});
  roadTex.wrapS=roadTex.wrapT=T.RepeatWrapping;roadTex.repeat.set(12,1);
  const road=mesh(new T.PlaneGeometry(140,14),m(0xffffff,{map:roadTex,roughness:.9}),0,-.25,TZ+5);road.rotation.x=-Math.PI/2;
  const field=mesh(new T.PlaneGeometry(200,60),m(0xb9a35a,{roughness:1}),0,-.3,TZ-32);field.rotation.x=-Math.PI/2;
  for(let i=0;i<24;i++){const g=new T.Group();const kind=pick(['tree','tree','khejri','hut','pole']);
    if(kind==='tree'||kind==='khejri'){mesh(new T.CylinderGeometry(.18,.25,2.2,6),m(0x5a3e28),0,1.1,0,g);const cn=mesh(new T.IcosahedronGeometry(kind==='tree'?1.6:1.2,0),m(kind==='tree'?0x4f7a2f:0x7a8a3a,{flatShading:true}),0,2.6,0,g);cn.scale.y=.8;}
    else if(kind==='hut'){mesh(rb(3,2,2.4,.2),m(0xd9b98a),0,1,0,g);mesh(new T.ConeGeometry(2.2,1.2,4),m(0x8a5a3a),0,2.6,0,g).rotation.y=Math.PI/4;}
    else{mesh(new T.CylinderGeometry(.06,.08,5,6),m(0x777777),0,2.5,0,g);}
    g.position.set(rnd(-90,90),-.3,TZ-rnd(5,24));scene.add(g);outside.push(g);}
  // dhaba (shown at the stop)
  dhaba=new T.Group();dhaba.visible=false;scene.add(dhaba);
  mesh(new T.PlaneGeometry(26,9),m(0xc9a978,{roughness:1}),0,-.22,TZ+6.5,dhaba).rotation.x=-Math.PI/2;
  mesh(rb(4,2.6,4,.2),m(0xf2c230),10.5,1.3,TZ+6,dhaba,{cast:true});const ds=mesh(new T.PlaneGeometry(5.6,.9),new T.MeshBasicMaterial({map:signTex('HIGHWAY DHABA · 24 GHANTE','#c0392b','#fff',1024,160,"700 86px 'Space Grotesk', sans-serif"),toneMapped:false}),-2,.35,TZ+9.4,dhaba);ds.rotation.x=-1.05;
  for(const [x,z] of [[0,TZ+5.2],[3.6,TZ+6.2],[-4.5,TZ+6.4]]){mesh(rb(1.9,.12,1,.04),m(0xd9c3a0),x,.45,z,dhaba);for(const dx of [-.85,.85])for(const dz of [-.42,.42])mesh(new T.CylinderGeometry(.05,.05,.45,6),m(0x5a3e28),x+dx,.22,z+dz,dhaba);}
  mesh(new T.CylinderGeometry(.5,.6,.9,14),m(0x8a5a3a),5.8,.45,TZ+8.5,dhaba);mesh(new T.CylinderGeometry(.35,.35,.05,14),glow(0xff7a2a,2),5.8,.92,TZ+8.5,dhaba);
  box(-8,-5.6,TZ+4.6,TZ+5.8,1,m(0x7a4bb0),{collide:false,parent:dhaba});mesh(new T.PlaneGeometry(2.4,.5),new T.MeshBasicMaterial({map:signTex('DUPATTA · CHASHMA','#1d2340','#fff',512,110,"700 60px 'Space Grotesk', sans-serif"),toneMapped:false}),-6.8,1.7,TZ+5.82,dhaba);
  for(let i=0;i<14;i++)mesh(new T.SphereGeometry(.06,6,4),glow(pick([0xffd166,0xff5a5a,0x6fe0a0]),2),-8+i*1.2,2.9+Math.sin(i)*.15,TZ+9.2,dhaba);
  contact=npc({body:0x2b6fd6,legs:0x2c2c36,skin:0x8f5d3e,hair:0x111111,turban:0x2b6fd6,mustache:true},3.6,TZ+6.2,'dhaba','static');sitPose(contact,.42);contact.yaw=-Math.PI/2;contact.g.rotation.y=contact.yaw;contact.g.visible=false;
  for(let i=0;i<3;i++){const c=npc(paxOpts(),rnd(-6,6),TZ+rnd(4.5,8),'dhaba','static');c.g.visible=false;}
  // toll naka (shown at the checkpoint)
  naka=new T.Group();naka.visible=false;scene.add(naka);
  for(const x of [-4,4]){mesh(rb(1.6,2.2,1.4,.15),m(0xf1ece1),x,1.1,TZ+3.6,naka,{cast:true});mesh(new T.BoxGeometry(1.7,.2,1.5),m(0xf5d000),x,2.3,TZ+3.6,naka);}
  mesh(new T.PlaneGeometry(9,1.2),new T.MeshBasicMaterial({map:signTex('TOLL PLAZA · POLICE NAKA','#1d2340','#f5d000',1024,136,"700 70px 'Space Grotesk', sans-serif"),toneMapped:false}),0,3.4,TZ-4.5,naka);
  for(const x of [-4.4,4.4])mesh(new T.CylinderGeometry(.12,.12,3.4,8),m(0x9aa3ad),x,1.7,TZ-4.6,naka);
  mesh(new T.BoxGeometry(5,.12,.12),m(0xe0242b),8.5,1.1,TZ+3,naka);mesh(rb(3.6,1.4,1.8,.2),m(0xf1ece1),-8,.9,TZ+7,naka);mesh(new T.BoxGeometry(.6,.15,.3),glow(0x3d6fff,3),-8,1.7,TZ+7,naka);
  // conductor (re-uses the "tc" walker): collects fares row by row from the front
  tc=chibi({body:0x9a8a6a,legs:0x3a3530,skin:0x9a6644,hair:0x111111,mustache:true,board:true,shadow:true});tc.pos.set(5,0,TZ);tc.yaw=-Math.PI/2;tc.inArea='train';tc.bay=0;tc.icon=iconSprite();tc.sus=0;
}
/* ---------------- player ---------------- */
let P;
function buildPlayer(pos,yaw){if(P)scene.remove(P.g);let o;
  if(S.look.outfit==='cap')o={body:0x3d6fd6,legs:0x2c3150,cap:0xf5f5f5,capPeak:0x222222,glasses:true};
  else if(S.look.outfit==='dupatta')o={body:0xc0392b,legs:0x2c2c36,scarf:0xff5fa2,shawl:0xc0392b,glasses:true};
  else o={body:0xd9c3a0,coat:true,scarf:0xe0242b,legs:0x2c2c36,hat:0x2b2b35};
  Object.assign(o,{skin:0xc68b5e,hair:0x1a1a1a,longHair:true,shadow:true,bag:0x2b2f3a});charLook(o);P=chibi(o);P.pos.copy(pos);P.yaw=yaw;P.g.rotation.y=yaw;
  const ring=new T.Mesh(new T.RingGeometry(.5,.62,28),new T.MeshBasicMaterial({color:0xf5b82e,transparent:true,opacity:.85,toneMapped:false,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.04;P.g.add(ring);P.ring=ring;
  coverMesh=mesh(new T.SphereGeometry(.57,16,12,0,Math.PI*2,0,Math.PI*.72),m(0xff5fa2,{side:T.DoubleSide}),0,.04,0,P.head);coverMesh.visible=S.covered;}
const input={x:0,y:0,run:false,keys:{}};let locked=true;const tv=new T.Vector3();
function updPlayer(dt,t){if(S.seat){anim(P,dt,0,t);return;}
  let ix=input.x,iy=input.y;if(input.keys.KeyW||input.keys.ArrowUp)iy+=1;if(input.keys.KeyS||input.keys.ArrowDown)iy-=1;if(input.keys.KeyA||input.keys.ArrowLeft)ix-=1;if(input.keys.KeyD||input.keys.ArrowRight)ix+=1;
  const mag=Math.min(1,Math.hypot(ix,iy));if(locked||S.hold||S.climbing||mag<.08){P.speed=0;P.running=false;anim(P,dt,S.climbing?2.2:0,t);return;}
  const run=input.run||input.keys.ShiftLeft||input.keys.ShiftRight;const spd=(run?4.6:2.3)*mag*(S.area==='train'?.85:1)*(P.slow||1);
  camera.getWorldDirection(tv);const cy=Math.atan2(tv.x,tv.z);const fx=Math.sin(cy),fz=Math.cos(cy),rx=-Math.cos(cy),rz=Math.sin(cy);let vx=fx*iy+rx*ix,vz=fz*iy+rz*ix;const l=Math.hypot(vx,vz);vx/=l;vz/=l;
  P.pos.x+=vx*spd*dt;P.pos.z+=vz*spd*dt;collide(P.pos);
  for(const n of NPC.concat(G,tc?[tc]:[])){if(n.inArea&&n.inArea!==S.area||n.area&&n.area!==S.area)continue;if(n.pose||n.ghost)continue;const dx=P.pos.x-n.pos.x,dz=P.pos.z-n.pos.z,d=Math.hypot(dx,dz);if(d<.55&&d>1e-4){P.pos.x=n.pos.x+dx/d*.55;P.pos.z=n.pos.z+dz/d*.55;}}
  faceTo(P,Math.atan2(vx,vz),dt,12);P.speed=spd;P.running=run&&mag>.5;anim(P,dt,spd,t);P.stepT=(P.stepT||0)-dt*spd;if(P.stepT<=0){sfx.step();P.stepT=1.3;}}

/* ---------------- dialogue / comic / sheets ---------------- */
let advance=null;const dlg=$('#dlg'),whoEl=$('#who'),lineEl=$('#line'),nextEl=$('#next'),chEl=$('#choices'),tmEl=$('#timer');
$('#dbox').addEventListener('pointerdown',e=>{e.stopPropagation();advance&&advance();});
function say(who,text,narr=false){text=gtx(text);dlg.hidden=false;document.body.classList.add('talking');chEl.innerHTML='';tmEl.hidden=true;whoEl.textContent=who||'';whoEl.className=narr?'narr':'';lineEl.className=narr?'narr':'';lineEl.textContent='';nextEl.hidden=true;
  return new Promise(res=>{let i=0,typing=true;const iv=setInterval(()=>{i+=2;lineEl.textContent=text.slice(0,i);if(i>=text.length){clearInterval(iv);typing=false;nextEl.hidden=false;}},16);
    advance=()=>{if(typing){clearInterval(iv);lineEl.textContent=text;typing=false;nextEl.hidden=false;return;}advance=null;nextEl.hidden=true;res();};});}
function choose(opts,{timer=0}={}){dlg.hidden=false;document.body.classList.add('talking');nextEl.hidden=true;advance=null;chEl.innerHTML='';
  return new Promise(res=>{let to,tk,done=false;const fin=v=>{if(done)return;done=true;clearTimeout(to);clearInterval(tk);tmEl.hidden=true;chEl.innerHTML='';res(v);};
    opts.forEach(o=>{const b=document.createElement('button');b.type='button';b.className='choice';b.disabled=!!o.disabled;b.innerHTML=`<span class="lab">${esc(gtx(o.label))}</span>${o.tag?`<span class="tag">${esc(o.tag)}</span>`:''}${o.sub?`<span class="sub">${esc(o.sub)}</span>`:''}`;b.onclick=()=>fin(o.value??o.label);chEl.appendChild(b);});
    if(timer){tmEl.hidden=false;const bar=tmEl.firstElementChild,t0=performance.now();tk=setInterval(()=>{const p=1-(performance.now()-t0)/timer;bar.style.transform=`scaleX(${Math.max(0,p)})`;if(p<.35)sfx.tick();},200);to=setTimeout(()=>fin(TIMEOUT),timer);}});}
const closeDlg=()=>{dlg.hidden=true;document.body.classList.remove('talking');advance=null;chEl.innerHTML='';};
const NOIR=`<defs><pattern id="h1" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.3" fill="#111"/></pattern><pattern id="h2" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="2.4" fill="#111"/></pattern><pattern id="hr" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="4.5" cy="4.5" r="2.2" fill="#e0242b"/></pattern></defs>`;
const capb=(x,y,w,lines,size=17)=>`<g><rect x="${x}" y="${y}" width="${w}" height="${lines.length*size*1.35+16}" fill="#f5e9b8" stroke="#111" stroke-width="3"/>${lines.map((l,i)=>`<text x="${x+12}" y="${y+12+size+i*size*1.35}" class="typ" font-size="${size}" fill="#111">${esc(l)}</text>`).join('')}</g>`;
const agent=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="#111"><path d="M-30 0 L30 0 L22 -8 L-22 -8Z"/><path d="M-15 -8 Q0 -30 15 -8Z"/><circle cx="0" cy="10" r="14"/><path d="M-26 28 Q0 16 26 28 L36 126 L4 122 L0 60 L-4 122 L-36 126Z"/><path d="M-14 26 Q0 34 14 26 L18 34 Q0 44 -18 34Z" fill="#e0242b"/><rect x="-20" y="122" width="12" height="40"/><rect x="8" y="122" width="12" height="40"/></g>`;
const PANELS={
  start:()=>`<svg viewBox="0 0 900 420">${NOIR}<rect width="900" height="420" fill="#0d0d0d"/><g><clipPath id="s1"><rect x="14" y="14" width="872" height="392"/></clipPath><g clip-path="url(#s1)"><rect x="14" y="14" width="872" height="392" fill="#f1ece1"/><rect x="14" y="14" width="872" height="200" fill="url(#h1)" opacity=".4"/>
    <circle cx="760" cy="120" r="60" fill="#e0242b" opacity=".85"/><rect x="14" y="250" width="872" height="160" fill="url(#h2)" opacity=".7"/>
    <g fill="#111"><rect x="420" y="170" width="440" height="140" rx="16"/><rect x="440" y="186" width="70" height="44" fill="#f1ece1" opacity=".25"/><rect x="520" y="186" width="70" height="44" fill="#f1ece1" opacity=".25"/><rect x="600" y="186" width="70" height="44" fill="#f1ece1" opacity=".25"/><circle cx="500" cy="312" r="26"/><circle cx="780" cy="312" r="26"/></g>
    <rect x="690" y="150" width="150" height="34" fill="#111"/><text x="765" y="176" text-anchor="middle" class="sfx" font-size="26" fill="#ff9a2a">${esc(MY_DEST)}</text>${agent(240,170,1.15)}
    ${capb(30,40,330,['TRAIN SE KOODI. RAAT BHAR CHALI.','SUBAH 6 BAJE. BUS ADDA.'])}<text x="560" y="140" class="sfx" font-size="40" fill="#e0242b" transform="rotate(-6 560 140)">POM POM!</text></g></g><rect x="14" y="14" width="872" height="392" fill="none" stroke="#f1ece1" stroke-width="5"/></svg>`,
  jump:()=>`<svg viewBox="0 0 900 420">${NOIR}<rect width="900" height="420" fill="#0d0d0d"/><g><clipPath id="j1"><rect x="14" y="14" width="872" height="392"/></clipPath><g clip-path="url(#j1)"><rect x="14" y="14" width="872" height="392" fill="#f1ece1"/><rect x="14" y="14" width="872" height="392" fill="url(#h1)" opacity=".35"/>
    <rect x="14" y="290" width="872" height="120" fill="#111"/><rect x="560" y="120" width="300" height="170" fill="#111"/><rect x="580" y="140" width="80" height="50" fill="#f1ece1" opacity=".3"/>
    <rect x="80" y="120" width="40" height="170" fill="#111"/><rect x="120" y="200" width="300" height="16" fill="#e0242b" transform="rotate(-35 120 208)"/>
    <text x="40" y="100" class="sfx" font-size="92" fill="#2fa37a" stroke="#111" stroke-width="4">NAKA PAAR!</text>${capb(520,330,350,['Police ne chehra dekha.','Pehchaana nahi.'])}</g></g><rect x="14" y="14" width="872" height="392" fill="none" stroke="#f1ece1" stroke-width="5"/></svg>`,
  caught:who=>`<svg viewBox="0 0 900 420">${NOIR}<rect width="900" height="420" fill="#0d0d0d"/><g><clipPath id="c1"><rect x="14" y="14" width="872" height="392"/></clipPath><g clip-path="url(#c1)"><rect x="14" y="14" width="872" height="392" fill="#f1ece1"/><rect x="14" y="14" width="872" height="392" fill="url(#hr)" opacity=".35"/>
    ${agent(330,170,1.2)}<g fill="#111"><circle cx="560" cy="160" r="40"/><path d="M500 210 Q560 180 620 210 L650 406 L470 406Z"/><path d="M510 128 h100 l-8 -24 h-84z"/><path d="M500 240 L380 200 L384 186 L506 222Z"/></g>
    <text x="450" y="90" text-anchor="middle" class="sfx" font-size="92" fill="#e0242b" stroke="#111" stroke-width="4">PAKDI GAYI!</text>${capb(560,330,310,[esc(who)+' ne pakad liya.'])}</g></g><rect x="14" y="14" width="872" height="392" fill="none" stroke="#f1ece1" stroke-width="5"/></svg>`};
const CROPS={start:['14 14 450 392','420 14 466 392'],jump:['14 14 560 392'],caught:['14 14 872 392']};
function comic(name,arg){return new Promise(res=>{const c=$('#comic');const full=gtx(PANELS[name](arg));const portrait=innerHeight>innerWidth*1.15;const views=portrait?CROPS[name]:[null];let k=0;
  const show=()=>{const vb=views[k];c.innerHTML=`<div class="pop">${vb?full.replace(/viewBox="[^"]*"/,`viewBox="${vb}"`):full}</div><div class="tap">${k<views.length-1?'tap: agla panel ▸':'tap karo ▸'}</div>`;sfx.thak();};
  c.hidden=false;show();let ready=false;setTimeout(()=>ready=true,500);const go=()=>{if(!ready)return;k++;if(k<views.length){ready=false;show();setTimeout(()=>ready=true,450);return;}c.removeEventListener('pointerdown',go);c.hidden=true;res();};c.addEventListener('pointerdown',go);});}
function sheet(html){html=gtx(html);const s=$('#sheet');s.innerHTML=`<div class="card">${html}</div>`;s.hidden=false;return s.firstElementChild;}
const closeSheet=()=>{$('#sheet').hidden=true;$('#sheet').innerHTML='';};
$('#bMute').onclick=()=>{AU.on=!AU.on;if(AU.m)AU.m.gain.value=AU.on?.8:0;$('#bMute').textContent=AU.on?'Mute':'Unmute';};

/* ---------------- CCTV snapshot polaroids (platform) ---------------- */
const snapRT=new T.WebGLRenderTarget(256,192),snapCam=new T.PerspectiveCamera(46,4/3,.1,90);
function snapshot(c){try{snapCam.position.set(c.x,5.4,c.z);snapCam.lookAt(P.pos.x,1.1,P.pos.z);snapCam.updateMatrixWorld();const hid=[];const hide=o=>{if(o.visible){o.visible=false;hid.push(o);}};CAMS.forEach(k=>hide(k.cone.piv));G.forEach(g=>{hide(g.cone.piv);hide(g.icon.sp);});
  renderer.setRenderTarget(snapRT);renderer.render(scene,snapCam);renderer.setRenderTarget(null);hid.forEach(o=>o.visible=true);
  const W=256,H=192,px=new Uint8Array(W*H*4);renderer.readRenderTargetPixels(snapRT,0,0,W,H,px);const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g2=cv.getContext('2d');const img=g2.createImageData(W,H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const si=((H-1-y)*W+x)*4,di=(y*W+x)*4;const l=(px[si]*.3+px[si+1]*.59+px[si+2]*.11)/255;let v=Math.pow(Math.min(1,l*1.2),1/2.2)*255;v=v*(y%3?1:.86)+(Math.random()*16-8);img.data[di]=v*.9;img.data[di+1]=v;img.data[di+2]=v*.88;img.data[di+3]=255;}
  g2.putImageData(img,0,0);tv.set(P.pos.x,1.1,P.pos.z).project(snapCam);const bx=(tv.x+1)/2*W,by=(1-tv.y)/2*H;g2.strokeStyle='#ff3b30';g2.lineWidth=2;g2.strokeRect(bx-18,by-32,36,54);
  g2.font='bold 12px monospace';g2.fillStyle='#fff';g2.fillText('ADDA CAM '+c.id,8,17);const ts='06:'+String(11+Math.floor((180-S.timeLeft)/60)).padStart(2,'0')+':'+String(Math.floor(180-S.timeLeft)%60).padStart(2,'0');g2.fillText(ts,W-8-g2.measureText(ts).width,17);g2.fillStyle='#ff3b30';g2.fillText('● REC',8,H-10);
  const url=cv.toDataURL('image/jpeg',.78);S.photos.push({url,id:c.id,t:ts});
  const f=$('#flash');f.style.transition='none';f.style.opacity=.85;requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transition='opacity .45s';f.style.opacity=0;}));sfx.shutter();vib(35);slowT=Math.max(slowT,.3);
  const el=document.createElement('div');el.className='snap big';el.innerHTML=`<img alt="CCTV cam ${c.id}" src="${url}"><b>ADDA CAM ${c.id} · ${ts}</b>`;document.body.appendChild(el);
  setTimeout(()=>{el.classList.remove('big');const box=$('#snaps');box.innerHTML='';box.appendChild(el);if(S.photos.length>1){const cc=document.createElement('div');cc.className='count';cc.textContent='CCTV '+S.photos.length;box.appendChild(cc);}},1150);}catch(e){console.warn('snapshot failed',e);}}

/* ---------------- interactions & hold actions ---------------- */
const INTER=[];let current=null;
function updAct(){if(locked||S.hold||!(S.phase==='platform'||S.phase==='train')){$('#act').hidden=true;current=null;return;}let best=null,bd=1e9;
  for(const it of INTER){if(it.area&&it.area!==S.area)continue;if(it.on&&!it.on())continue;const [x,z]=it.pos();const d=Math.hypot(P.pos.x-x,P.pos.z-z);if(d<(it.r||1.4)&&d<bd){bd=d;best=it;}}
  current=best;const a=$('#act');a.hidden=!best;if(best){const l=typeof best.label==='function'?best.label():best.label;if(a.textContent!==l)a.textContent=l;}}
async function doAct(){if(!current||locked||S.hold)return;try{await current.run();}catch(e){console.error(e);}}
$('#act').addEventListener('click',e=>{e.stopPropagation();doAct();});
function hold(label,secs,illegal,check){return new Promise(res=>{S.hold={t:0,secs,illegal,check,res};$('#prog').hidden=false;$('#progText').textContent=label;});}
function updHold(dt){const h=S.hold;if(!h)return;h.t+=dt;$('#prog').classList.toggle('seen',G.some(g=>g.area===S.area&&canSee(g,P.pos.x,P.pos.z)));$('#prog .bar i').style.width=Math.min(100,h.t/h.secs*100)+'%';
  const fail=h.check&&h.check();if(fail||worst==='alert'){S.hold=null;$('#prog').hidden=true;h.res(false);if(fail)toast(fail,'info');return;}if(h.t>=h.secs){S.hold=null;$('#prog').hidden=true;h.res(true);}}

/* ---- adda interactions ---- */
function inter(o){INTER.push(o);}
inter({area:'platform',label:'Chashma + topi kharido · ₹400',r:2.4,on:()=>S.look.outfit!=='cap',pos:()=>[12,7.6],run:async()=>{locked=true;await say('Dukaandaar','Dhoop ka chashma, cricket wali topi! Sab ₹400.');
  const r=await choose([{label:'Le lo',tag:'₹400 cash',sub:'Look badal jaayega',value:1},{label:'Nahi chahiye',value:0}]);closeDlg();
  if(r){CAREER.money-=400;S.look={outfit:'cap',hat:true};buildPlayer(P.pos.clone(),P.yaw);clearWanted();sfx.ok();toast('Naya look: topi + chashma.','good');}locked=false;}});
inter({area:'platform',label:'Thela palat do (hungama)',r:2,on:()=>!S.ruckus,pos:()=>[18,3.4],run:async()=>{const ok=await hold('Thele ka pahiya kheench rahi ho…',1.2,true);if(!ok)return;S.ruckus=true;
  fruitCart.rotation.z=.9;fruitCart.position.y=.3;sfx.thak();burst(.6,600,.5);vib(80);toast('Thelewala: "Arre mera thela! Pakdo koi!" Sab udhar dekh rahe hain.','info');
  for(const g of G){if(g.area==='platform'&&g.state!=='alert'){g.state='search';g.lastSeen=[18,3];g.searchT=18;g.sus=Math.max(g.sus,35);}}
  for(const n of NPC){if(n.inArea==='platform'&&n.beh==='wander'&&Math.hypot(n.pos.x-18,n.pos.z-3)<16)n.target=[18+rnd(-2.5,2.5),3+rnd(-2,2.5)];}}});
inter({area:'platform',label:()=>`${MY_DEST} wali bus mein chadho`,r:1.8,pos:()=>[BUS_X(MY_BUS)+4.6,-5.6],run:async()=>board()});
for(let k=0;k<5;k++)if(k!==MY_BUS)inter({area:'platform',label:'Ye tumhari bus nahi',r:1.4,pos:()=>[BUS_X(k)+4.6,-5.6],run:async()=>toast(`Ye ${DESTS[k]} ki bus hai. Tumhe ${MY_DEST} wali chahiye: board pe naam dekho.`,'info')});
function clearWanted(){if(S.wanted&&S.wanted!==lookKey()){S.wanted=null;G.forEach(g=>{if(g.state!=='alert'){g.sus=Math.min(g.sus,15);g.state='patrol';}});}}
/* ---- bus interactions ---- */
function seatNear(){let best=null,bd=1.4;for(const s of SEATS){if(s.taken)continue;const d=Math.hypot(P.pos.x-s.x,P.pos.z-s.z);if(d<bd){bd=d;best=s;}}return best;}
inter({area:'train',label:'Seat pe baitho',r:3,on:()=>!S.seat&&!!seatNear()&&P.pos.z<TZ+1.4,pos:()=>{const s=seatNear();return s?[s.x,s.z]:[1e9,0];},run:async()=>{const s=seatNear();if(!s)return;s.taken=true;S.seat={kind:'sit',ref:s,back:P.pos.clone()};P.pos.set(s.x,s.y,s.z);P.yaw=s.yaw;P.g.rotation.y=s.yaw;sitPose(P,s.y);P.ring.visible=false;}});
inter({area:'train',label:()=>S.covered?'Chehra kholo':'Dupatte se chehra dhako',r:99,on:()=>!!S.seat,pos:()=>[P.pos.x+.01,P.pos.z],run:async()=>{S.covered=!S.covered;coverMesh.visible=S.covered;toast(S.covered?'Chehra dhak liya. Kam dikhogi, par police hataane ko bol sakti hai.':'Chehra khol diya.','info');}});
inter({area:'train',label:'Seat se utho',r:99,on:()=>!!S.seat,pos:()=>[P.pos.x,P.pos.z],run:async()=>standUp()});
function standUp(){if(!S.seat)return;S.seat.ref.taken=false;const b=S.seat.back;S.seat=null;S.covered=false;coverMesh.visible=false;P.pose=null;P.root.rotation.z=0;P.root.position.y=0;P.g.position.set(b.x,0,b.z);P.ring.visible=true;}
inter({area:'train',label:'Contact se passport lo',r:1.7,on:()=>S.stage==='dhaba'&&!S.done&&!S.seat,pos:()=>[contact.pos.x,contact.pos.z],run:async()=>{const ok=await hold('Akhbaar ke andar se passport le rahi ho…',3,true,()=>S.stage!=='dhaba'?'Bus chalne wali hai!':null);if(ok){S.done=true;sfx.ok();setTimeout(()=>{if(S.stage!=='dhaba')return;banner('Aage POLICE NAKA hai! Photo wala look badlo: DUPATTA · CHASHMA stall (dhabe ke left side)',true);toast('Contact: "Aage naka pe police chehre check kar rahi hai. Wo trench coat aur hat waali photo dikha rahe hain. Dhabe ki dupatta-chashma dukaan (left side) se look badlo, warna naka pe pakdi jaogi."','info');setTimeout(()=>{if(S.stage==='dhaba')banner(null);},7000);},2500);toast('Naya passport mil gaya! Ab bus mein wapas chadho.','good');}}});
inter({area:'train',label:'Dupatta + chashma kharido · ₹300',r:2,on:()=>S.stage==='dhaba'&&S.look.outfit!=='dupatta',pos:()=>[-6.8,TZ+6.4],run:async()=>{CAREER.money-=300;S.look={outfit:'dupatta',hat:false};buildPlayer(P.pos.clone(),P.yaw);clearWanted();sfx.ok();toast('Naya look: laal dupatta + chashma.','good');}});
/* ---------------- flow ---------------- */
const ui=on=>['#hud','#pads','#joy','#map'].forEach(s=>$(s).hidden=!on);
function setObj(t){t=gtx(t);if($('#objText').textContent!==t)$('#objText').textContent=t;}
let coverMesh=null;
async function title(){
  $('#loading').hidden=true;
  await new Promise(res=>{const c=sheet(`<div class="eyebrow">${RUN?"ESCAPE · LEG "+RUN.leg:"TRACE · LEVEL 3"}</div><h2>Highway Bus</h2>
    <div class="dossier"><h3>Raasta · ${esc(MY_DEST)}</h3><dl><dt>Naam</dt><dd>${esc(L.given)} ${esc(L.surname)}</dd><dt>Bus</dt><dd><b>${esc(MY_DEST)}</b> wali, adde se subah 6:20</dd>
    <dt>Kaam</dt><dd>Raaste ke dhabe pe <b>neeli pagdi</b> wala contact naya passport dega. Bus sirf 70 second rukegi.</dd><dt>Khatra</dt><dd>Toll naka pe police chehre check karti hai. Adde pe tumhara <b>WANTED</b> poster laga hai.</dd></dl><span class="stampx">TOP SECRET</span></div>
    <p class="eyebrow">Look badalna is level ki chaabi hai. Heat ${Math.round(CAREER.heat||0)}/100 saath hai.</p>
    <button class="btn" id="go" type="button">Enter the bus stand</button><a class="btn alt" href="index.html">Safehouse</a>`);
    c.querySelector('#go').onclick=()=>{auInit();AU.ctx&&AU.ctx.resume();closeSheet();res();};});
  await comic('start');startPlatform();}
function startPlatform(){S.phase='platform';S.area='platform';S.timeLeft=180;buildPlayer(new T.Vector3(0,0,12),Math.PI);ui(true);locked=false;sfx.horn();runStart();
  toast(`Neeche-left gole se chalo. ${MY_DEST} likhi bus dhoondho.`,'info');}
async function board(){if(S.phase!=='platform')return;locked=true;S.phase='boarding';sfx.horn();vib(40);ui(false);await sleep(500);trace(`Bus adda: ${MY_DEST} wali bus mein chadhi (CCTV ${S.camsSeen.size} camere)`);startTrain();}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function startTrain(){S.phase='train';S.area='train';S.timeLeft=330;S.trainT=0;S.stage='drive1';S.stageT=0;
  buildPlayer(new T.Vector3(4.5,0,TZ+.1),Math.PI);
  scene.background.set(0xf2c9a0);scene.fog=new T.Fog(0xf2c9a0,30,110);
  ui(true);$('#map').hidden=true;locked=false;banner('Koi khaali seat dhoondh ke baith jao');setTimeout(()=>banner(null),5000);
  toast('Conductor kiraya lene aa raha hai.','info');}
function jobDone(){}
async function jump(){if(S.phase!=='train')return;S.phase='over';locked=true;banner(null);ui(false);if(RT.on&&!RT.exit)RT.exit=runClean()?'city':'naka';await comic('jump');finish(true);}
/* escape mode: a cargo truck behind the dhaba skips the police checkpost */
let truck=null;function addTruck(){if(truck||!RT.on)return;truck=new T.Group();truck.position.set(-13.4,0,TZ+3.8);dhaba.add(truck);
  mesh(rb(2.4,2.6,5.4,.2),m(0x2f5d8a),0,1.7,-.6,truck,{cast:true});mesh(rb(2.4,1.8,1.8,.2),m(0xd97a1f),0,1.3,2.6,truck,{cast:true});for(const x of [-1.15,1.15])for(const z of [-2,1,2.8])mesh(new T.CylinderGeometry(.42,.42,.3,12),m(0x111111),x,.42,z,truck).rotation.z=Math.PI/2;
  sign('GOA · CARGO',-12.1,2.4,TZ+3.8,Math.PI/2,2.4,.45,'#f5d000','#111',dhaba);}
inter({area:'train',label:'Hide in the cargo truck (skip the checkpost)',r:2.2,on:()=>RT.on&&S.stage==='dhaba'&&S.done&&!S.seat,pos:()=>[-10.6,TZ+3.3],run:async()=>{const ok=await hold('Tarpaulin ke neeche chhup rahi ho…',2.5,true);if(!ok)return;RT.exit='truck';S.phase='over';locked=true;banner(null);ui(false);finish(true);}});
function failMission(why){if(S.phase!=='train'&&S.phase!=='platform')return;S.phase='over';locked=true;banner(null);sfx.alert();finish(false,null,why);}
async function caught(g){if(runNoArrest(g))return;if(S.phase!=='platform'&&S.phase!=='train')return;const ph=S.phase;locked=true;S.phase='talk';if(S.seat)standUp();
  await say(g.name,'Ruko! Naam batao. ID dikhao.');const ok=await nameQ(g.name);
  if(await judge(g,ok)){await say(g.name,'Hmm. Theek hai, jaao.');closeDlg();CAREER.heat=Math.min(100,(CAREER.heat||0)+5);trace(`${g.name} ne roka, naam likha`);G.forEach(o=>{if(o.area===S.area){o.state='patrol';o.sus=20;}});S.phase=ph;locked=false;return;}
  closeDlg();S.phase='over';ui(false);await comic('caught',g.name);finish(false,g.name);}
async function nameQ(who){await say(who,'Naam kya hai?');const ans=`${L.given} ${L.surname}`;const opts=shuffle([ans,...shuffle(NAMES.map(n=>n[0]+' '+n[1]).filter(x=>x!==ans)).slice(0,2)]);
  const r=await choose(opts.map(o=>({label:o})),{timer:7000});return r===ans;}
function finish(win,who,why){if(runEnd(win,who,why))return;S.phase='over';locked=true;ui(false);const nCam=S.camsSeen.size;let stars=0,reward=0;
  if(win){stars=1;if(S.alerts===0)stars++;if(S.traces.length<=3&&nCam<=2)stars++;reward=[0,90000,160000,250000][stars];}
  const heatAdd=Math.min(40,S.traces.length*3+S.alerts*8+nCam);const before=CAREER.heat||0;CAREER.heat=Math.min(100,before+heatAdd);CAREER.missions=(CAREER.missions||0)+1;if(win){CAREER.wins=(CAREER.wins||0)+1;CAREER.money+=reward;CAREER.best=Math.max(CAREER.best||0,stars);CAREER.busDone=true;}saveCareer();
  const C=win?storyRecord(3,S.traces,S.photos,S.alerts,'Adda cam','port.html'):getC();const story=!!(C&&C.active);
  const c=sheet(`<div class="eyebrow">${story?'CHAPTER 3':'LEVEL 3'} · HIGHWAY BUS</div><h2>${win?['','Escaped','Clean job','Ghost'][stars]:'Mission fail'}</h2>
    ${win?`<p style="font-family:var(--sfx);font-size:30px;color:var(--accent)">${'★'.repeat(stars)}<span style="opacity:.3">${'★'.repeat(3-stars)}</span></p>`:`<p>${who?esc(who)+' ne pakad liya.':esc(why||'Bus chhoot gayi.')}</p>`}
    <div class="stats"><div class="stat"><span>Reward</span><b>${inr(reward)}</b></div><div class="stat"><span>Alerts</span><b>${S.alerts}</b></div><div class="stat"><span>Cameras</span><b>${nCam}/${CAMS.length}</b></div></div>
    <p class="eyebrow">HEAT: ${Math.round(before)} → ${Math.round(CAREER.heat)}</p><div class="heat"><i style="width:${CAREER.heat}%"></i></div>
    ${S.photos.length?`<p class="eyebrow">CCTV CAPTURED THESE</p><div class="gallery">${S.photos.map(p=>`<div class="snap"><img alt="CCTV cam ${p.id}" src="${p.url}"><b>ADDA CAM ${p.id} · ${esc(p.t)}</b></div>`).join('')}</div>`:''}
    <p class="eyebrow">YOUR DIGITAL FOOTPRINT</p><ul class="traces">${S.traces.length?S.traces.map(t=>`<li>${esc(t.text)}</li>`).join(''):'<li class="ok">No traces.</li>'}</ul>
    ${win?(story?`<a class="btn" href="port.html" style="background:#2fa37a">Chapter 4 (final): Docks →</a>`:`<a class="btn" href="port.html" style="background:#2fa37a">Next level: Docks →</a>`):''}<button class="btn" id="again" type="button">${story?'Replay chapter':'Play again'}</button><a class="btn alt" href="index.html">Safehouse</a>`);
  c.querySelector('#again').onclick=()=>location.reload();}

/* ---------------- per-phase logic ---------------- */
let annT=0,clackT=0;
function platformTick(dt,t){
  S.timeLeft-=dt;if(S.timeLeft<=0)return failMission(`${MY_DEST} wali bus tumhare bina nikal gayi.`);
  const el=180-S.timeLeft;
  if(el>50&&!S.checkDone){S.checkDone=true;coachDoorGuard.g.visible=true;coachDoorGuard.pos.set(BUS_X(MY_BUS)+1,0,-3);
    sfx.chime();toast(`Announcement: "${MY_DEST} jaane wali bus mein police checking."`,'info');banner('Police tumhari bus ke darwaze pe! Hungama karo ya look badlo',true);setTimeout(()=>{if(S.phase==='platform')banner(null);},6000);}
  if(S.ruckus&&coachDoorGuard.g.visible&&coachDoorGuard.state==='patrol'&&!S.ruckusDone){S.ruckusDone=true;}
  if(S.timeLeft<40&&!S.lastCall){S.lastCall=true;sfx.horn();toast(`Conductor: "${MY_DEST}! ${MY_DEST}! Chalo chalo, bus nikal rahi hai!"`,'info');}
  setObj(`${MY_DEST} likhi bus mein chadho (bus ke upar orange board)`);
  if((annT+=dt)>24){annT=0;const k=ri(0,4);toast(`Conductor: "${DESTS[k]}! ${DESTS[k]}! Aakhri seat!"`,'info');}
}
function trainTick(dt,t){
  S.trainT+=dt;S.stageT+=dt;S.timeLeft-=dt;
  if(P.pos.z>TZ+1.45){P.pos.x=clamp(P.pos.x,-11,11);P.pos.z=Math.min(P.pos.z,TZ+9.8);}
  const moving=S.stage==='drive1'||S.stage==='drive2'||S.stage==='drive3';
  // stage machine: drive → dhaba stop (70 s) → drive → police naka → drive → win
  if(S.stage==='drive1'&&S.stageT>32){S.stage='dhaba';S.stageT=0;dhaba.visible=true;NPC.forEach(n=>{if(n.inArea==='dhaba')n.g.visible=true;});doorCol.on=false;sfx.horn();
    S.dhabaCop=guard({route:[[-1.5,TZ+8.6]],yaw:0,area:'train',range:7.5,name:'Highway patrol'});addTruck();if(RT.on&&truck)toast('A cargo truck to Goa is parked behind the dhaba. Could skip the checkpost…','info');banner('Dhaba stop 70 sec! Contact se passport lo →',true);setTimeout(()=>{if(S.stage==='dhaba')banner(null);},6000);}
  if(S.stage==='dhaba'){const left=70-S.stageT;S.timeLeft=left;if(left<15&&!S.honk){S.honk=true;sfx.horn();toast('Conductor: "Chalo chalo! Bus nikal rahi hai!"','info');}
    if(left<=0){if(P.pos.z>TZ+1.45)return failMission('Bus tumhe dhabe pe chhod ke nikal gayi.');if(!S.done)return failMission('Contact se passport nahi mila. Bina passport aage ka raasta band.');
      S.stage='drive2';S.stageT=0;dhaba.visible=false;NPC.forEach(n=>{if(n.inArea==='dhaba')n.g.visible=false;});doorCol.on=true;S.dhabaCop.g.visible=false;S.dhabaCop.area='gone';S.timeLeft=200;toast(lookKey()===S.startLook?'Bus chal padi. Naka aa raha hai aur tum abhi bhi photo wale look (coat + hat) mein ho! Police pehchaan legi.':'Bus phir chal padi. Aage toll naka hai. Seat pe shaant baitho.','info');}}
  if(S.stage==='drive2'&&S.stageT>22){S.stage='naka';S.stageT=0;naka.visible=true;sfx.horn();banner('Police naka! Seat pe baitho, chehra dhako',true);setTimeout(()=>{if(S.stage==='naka')banner(null);},6000);
    S.cops=[guard({route:[[5,TZ],[-5.6,TZ],[5,TZ]],area:'train',range:6,fov:.8,walk:.8,knows:true,name:'Naka police'})];S.cops[0].pos.set(5.6,0,TZ+.2);S.checked=false;}
  if(S.stage==='naka'){const cop=S.cops[0];
    if(!S.checked&&cop.state!=='alert'&&Math.abs(cop.pos.x-P.pos.x)<.9&&Math.abs(cop.pos.z-P.pos.z)<1.8){S.checked=true;faceCheck(cop);}
    if(S.stageT>34&&!locked){cop.g.visible=false;cop.area='gone';S.stage='drive3';S.stageT=0;naka.visible=false;toast('Police utar gayi. Bus naka paar kar rahi hai…','good');}}
  if(S.stage==='drive3'&&S.stageT>6)return jump();
  if(S.timeLeft<=0&&moving)return failMission('Bus pahunch gayi, par kaam adhoora reh gaya.');
  // conductor collects fares
  updTC(dt,t);
  // outside: road and fields move while driving
  const v=moving?16:0;roadTex.offset.x+=v*dt/12;for(const o of outside){o.position.x-=v*dt;if(o.position.x<-95)o.position.x+=190;}
  clackT-=dt;if(clackT<=0){clackT=.35;if(moving)burst(.3,140,.25);}
  setObj(S.stage==='drive1'?'Seat pe baitho. Agla stop: dhaba':S.stage==='dhaba'?(S.done?'Bus mein wapas chadho! (darwaza aage, right side)':'Bus se utro, neeli pagdi wale contact se passport lo'):S.stage==='drive2'?'Toll naka aa raha hai. Taiyaar raho: look badla hai?':S.stage==='naka'?'Police chehre check kar rahi hai. Shaant raho.':'Naka paar…');
}
async function faceCheck(cop){if(locked)return;locked=true;S.phase='talk';
  if(S.covered){await say(cop.name,'Madam, dupatta hatao. Chehra dikhao.');S.covered=false;coverMesh.visible=false;}
  else await say(cop.name,'(tumhe aur haath mein li photo ko dhyaan se dekhta hai)');
  if(lookKey()===S.startLook||S.wanted===lookKey()){await say(cop.name,'Ye to wahi hai! Photo wali!');closeDlg();S.phase='train';locked=false;goAlert(cop,'photo se match');cop.state='alert';return;}
  if(!S.seat){await say(cop.name,'Khade kyun ho? Baitho apni seat pe.');cop.sus=50;}
  else await say(cop.name,'Hmm. Theek hai.');
  closeDlg();S.phase='train';locked=false;trace('Police naka: chehra check, photo se match nahi hua');}
function updTC(dt,t){if(!tc||S.stage!=='drive1'&&S.stage!=='drive2')return;
  if(tc.checking){tc.checking-=dt;tc.speed=0;}
  else{const target=5-tc.bay*1.05;if(stepTo(tc,target,TZ,dt,.9)){tc.checking=2.2;tc.yaw=Math.PI;tc.g.rotation.y=tc.yaw;
      if(!S.paid&&Math.abs(P.pos.x-target)<1&&P.pos.z<TZ+1.4)fareCheck();tc.bay=(tc.bay+1)%10;if(tc.bay===0)tc.pos.set(5,0,TZ);}}
  anim(tc,dt,tc.speed,t);tc.icon.sp.visible=false;}
async function fareCheck(){if(locked)return;locked=true;S.phase='talk';
  await say('Conductor','Kahan jaana hai? Kiraya do.');
  const r=await choose(shuffle([MY_DEST,...shuffle(DESTS.filter(d=>d!==MY_DEST)).slice(0,2)]).map(d=>({label:d,value:d})),{timer:7000});
  if(r===MY_DEST){const pay=await choose([{label:'Cash do',tag:'₹250',sub:'Koi record nahi',value:'cash'},{label:'UPI se do',tag:'₹250',sub:'Bank record banega',value:'upi'}]);CAREER.money-=250;if(pay==='upi')trace('UPI: bus conductor ko payment');await say('Conductor','Theek hai. Ye lo ticket.');S.paid=true;}
  else{await say('Conductor','Ye bus to '+MY_DEST+' jaa rahi hai! Kahan baith gayi aap? Police ko bataun kya?');S.wanted=S.wanted||null;trace('Conductor: galat destination bola, usse yaad reh gaya');S.paid=true;}
  closeDlg();S.phase='train';locked=false;}
/* ---------------- NPC update ---------------- */
function updNPC(dt,t){for(const n of NPC){if(!(n.inArea===S.area||(S.area==='train'&&n.inArea==='dhaba'&&n.g.visible)))continue;let mv=false;
  if(n.beh==='wander'){if(!n.target){n.wait-=dt;if(n.wait<=0)n.target=[clamp(n.pos.x+rnd(-12,12),-38,38),rnd(-3,10)];}if(n.target){if(stepTo(n,n.target[0],n.target[1],dt,n.walk)){n.target=null;n.wait=rnd(1,5);}else mv=true;}
    if(n.isChai&&Math.hypot(n.pos.x-P.pos.x,n.pos.z-P.pos.z)<6&&!n.said){n.said=true;toast('Chaiwala: "Chaai, garam samosa!"','info');setTimeout(()=>n.said=false,15000);}}
  anim(n,dt,mv?n.speed:0,t);}}
/* ---------------- input ---------------- */
const joy=$('#joy'),knob=joy.firstElementChild;let joyId=null,joyO=null,lookId=null,lookLast=null;
canvas.addEventListener('pointerdown',e=>{if(!(S.phase==='platform'||S.phase==='train'))return;if(e.clientX<innerWidth*.5&&e.clientY>innerHeight*.35&&joyId===null&&e.pointerType!=='mouse'){joyId=e.pointerId;joyO=[e.clientX,e.clientY];joy.style.left=e.clientX+'px';joy.style.top=e.clientY+'px';knob.style.transform='';canvas.setPointerCapture(e.pointerId);}
  else if(lookId===null){lookId=e.pointerId;lookLast=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);}});
canvas.addEventListener('pointermove',e=>{if(e.pointerId===lookId){camYaw-=(e.clientX-lookLast[0])*.006;camPitch=clamp(camPitch+(e.clientY-lookLast[1])*.004,.3,1.25);lookLast=[e.clientX,e.clientY];return;}if(e.pointerId!==joyId)return;let dx=e.clientX-joyO[0],dy=e.clientY-joyO[1];const d=Math.hypot(dx,dy);if(d>50){dx=dx/d*50;dy=dy/d*50;}knob.style.transform=`translate(${dx}px,${dy}px)`;input.x=dx/50;input.y=-dy/50;});
const endP=e=>{if(e.pointerId===lookId)lookId=null;if(e.pointerId===joyId){joyId=null;joy.style.left=joy.style.top='';knob.style.transform='';input.x=input.y=0;}};
canvas.addEventListener('pointerup',endP);canvas.addEventListener('pointercancel',endP);
canvas.addEventListener('wheel',e=>{camDist=clamp(camDist+e.deltaY*.01,8,22);},{passive:true});
addEventListener('keydown',e=>{input.keys[e.code]=true;if(e.code==='KeyE')doAct();if((e.code==='Space'||e.code==='Enter')&&advance){e.preventDefault();advance();}});
addEventListener('keyup',e=>input.keys[e.code]=false);
$('#run').addEventListener('click',e=>{e.stopPropagation();input.run=!input.run;$('#run').classList.toggle('on',input.run);});

/* ---------------- minimap (platform) ---------------- */
const mc=$('#map'),mg=mc.getContext('2d');const mx=x=>(x+44)/88*236,mz=z=>(z+14)/28*168;
function drawMap(){mg.clearRect(0,0,236,168);mg.fillStyle='rgba(255,255,255,.18)';mg.fillRect(mx(-43),mz(-12.5),mx(43)-mx(-43),mz(13.4)-mz(-12.5));
  for(let k=0;k<5;k++){mg.fillStyle=k===MY_BUS?'#ff9a2a':'#3a4a6a';mg.fillRect(mx(BUS_X(k)-6),mz(-9.5),mx(BUS_X(k)+6)-mx(BUS_X(k)-6),mz(-6.5)-mz(-9.5));}
  for(const g of G){if(g.area!=='platform'||!g.g.visible)continue;mg.fillStyle=g.state==='alert'?'#ff3030':g.state==='patrol'?'#ffd166':'#ff9f1c';mg.beginPath();mg.arc(mx(g.pos.x),mz(g.pos.z),5,0,7);mg.fill();}
  mg.fillStyle='#fff';mg.beginPath();mg.arc(mx(P.pos.x),mz(P.pos.z),6,0,7);mg.fill();}
/* ---------------- camera & loop ---------------- */
/* orbit camera outside the vehicles: drag the right side to look around. CAMY0 = default heading, CAMB = optional bounds */
let CAMY0=Math.atan2(-7,11),CAMB=null,camYaw=0,camPitch=.63,camDist=16;
function updCam(dt){const tx=P.pos.x,tz=P.pos.z;let pos,look;
  if(S.area==='train'){const port=innerHeight>innerWidth,zc=Math.max(tz,TZ);pos=new T.Vector3(tx,port?7.6:6.2,zc+(port?9.6:8.2));look=new T.Vector3(tx,.7,zc-.5);const sh=S.escape>0?.01:.03;pos.y+=Math.sin(clk.elapsedTime*13)*sh;pos.x+=Math.sin(clk.elapsedTime*7)*sh;}
  else{const cy=CAMY0+camYaw,py=P.pos.y>1?P.pos.y:0;let d=camDist;for(;d>4;d-=.5){const r0=d*Math.cos(camPitch),cx=tx+Math.sin(cy)*r0,cz=tz+Math.cos(cy)*r0;if((!CAMB||cx>CAMB[0]&&cx<CAMB[1]&&cz>CAMB[2]&&cz<CAMB[3])&&!losBlocked(tx,tz,cx,cz))break;}
    const rr=d*Math.cos(camPitch);pos=new T.Vector3(tx+Math.sin(cy)*rr,d*Math.sin(camPitch),tz+Math.cos(cy)*rr);look=new T.Vector3(tx,.8,tz);}
  if(S.area!=='train'&&P.pos.y>1){pos.y+=P.pos.y;look.y+=P.pos.y;}
  if(S.area==='train'&&camYaw){camYaw=clamp(camYaw,-.8,.8);const c=Math.cos(camYaw),sn=Math.sin(camYaw),dx=pos.x-look.x,dz=pos.z-look.z;pos.x=look.x+dx*c+dz*sn;pos.z=look.z-dx*sn+dz*c;}
  camera.position.lerp(pos,Math.min(1,dt*6));camera.lookAt(look);sun.position.set(tx+8,22,tz+10);sun.target.position.set(tx,0,tz);}
const clk=new T.Clock();let frames=0;
function frame(){let dt=Math.min(window.__dtcap||.05,clk.getDelta());if(slowT>0){slowT-=dt;dt*=.3;}const t=clk.elapsedTime;
  if(S.phase==='platform'||S.phase==='train'||S.phase==='talk'){
    if(S.phase==='platform'||S.phase==='train'){updPlayer(dt,t);updHold(dt);runTick(dt);if(S.area!=='train')platformTick(dt,t);else trainTick(dt,t);}
    updNPC(dt,t);updGuards(dt,t);updCams(dt);updAct();
    $('#clock').textContent=clockS();$('#clock').classList.toggle('warn',S.timeLeft<30);
    const st=$('#state');st.className='chip '+worst;st.textContent=worst==='alert'?'ALERT!':worst==='sus'?'Suspicious':'Calm';
    if(AU.tens)AU.tens.gain.setTargetAtTime(worst==='alert'?.05:worst==='sus'?.02:0,AU.ctx.currentTime,.4);
    if(S.area!=='train'&&(frames++)%3===0)drawMap();
  }
  if(P)updCam(dt);else{camera.position.set(-40+Math.sin(t*.1)*10,12,16);camera.lookAt(0,0,0);}
  composer.render();requestAnimationFrame(frame);}

/* ---------------- boot ---------------- */
setupPlatform();
setupCams();
function setupCams(){cctv(1,-38,-4,Math.PI*.6,.5,14);cctv(2,0,-4,Math.PI*.05,.7,13);cctv(3,38,-4,-Math.PI*.6,.5,14);}
buildTrain();
window.__ready=true;
window.__trace={S,G,NPC,SEATS,BUS_X,MY_BUS,MY_DEST,get P(){return P;},get tc(){return tc;},get contact(){return contact;},get cur(){return current&&(typeof current.label==='function'?current.label():current.label);},doAct:()=>doAct(),tp:(x,z)=>{P.pos.set(x,0,z);},board};
frame();
title();
