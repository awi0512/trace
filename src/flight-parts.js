//@@CONST
const ROWS=12;
const MY_ROW=ri(3,10);            // the row whose overhead bin holds the drive
const FLIGHT=RUN&&RUN.fcode?`${RUN.fcode} · ${RUN.dest}`:pick(['AI 863 · DELHI','6E 512 · DELHI','UK 944 · DELHI']);
const DEST=FLIGHT.split(' · ')[1].charAt(0)+FLIGHT.split(' · ')[1].slice(1).toLowerCase();
const JOB='swap';
const S={phase:'title',t:0,timeLeft:120,traces:[],camsSeen:new Set(),alerts:0,wanted:null,photos:[],look:{outfit:'coat',hat:true},startLook:'coath',
  hold:null,done:false,escape:0,seat:null,covered:false,checkDone:false,stage:'gate',stageT:0,paid:false};
//@@WORLD
/* =================================================================================
   PART 1 · BOARDING GATE (a short lounge; the jet bridge door is at the east end)
   ================================================================================= */
const COACH_X=k=>0;
let gateAgent=null,bridgeDoor=[15.2,0];
function buildPlatform(){
  scene.background=new T.Color(0xcfe0f0);scene.fog=new T.Fog(0xcfe0f0,40,120);hemi.color.set(0xffffff);hemi.groundColor.set(0x8090a0);hemi.intensity=1.2;
  const flTex=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#d9dde3';g.fillRect(0,0,w,h);g.strokeStyle='rgba(0,0,0,.08)';for(let i=0;i<=8;i++){g.beginPath();g.moveTo(i*64,0);g.lineTo(i*64,h);g.stroke();g.beginPath();g.moveTo(0,i*64);g.lineTo(w,i*64);g.stroke();}});
  flTex.wrapS=flTex.wrapT=T.RepeatWrapping;flTex.repeat.set(6,3);
  const fl=mesh(new T.PlaneGeometry(36,16),m(0xffffff,{map:flTex,roughness:.6}),0,0,0);fl.rotation.x=-Math.PI/2;
  box(-18,18,-8,-7.6,4.5,m(0xeef1f5),{tall:true});box(-18,-17.6,-8,8,4.5,m(0xeef1f5),{tall:true});box(17.6,18,-8,-1.2,4.5,m(0xeef1f5),{tall:true});box(17.6,18,1.2,8,4.5,m(0xeef1f5),{tall:true});
  // big window onto the apron with the plane outside
  mesh(new T.PlaneGeometry(30,3.2),new T.MeshBasicMaterial({color:0x9fd0ff,toneMapped:false}),0,2.2,-7.55);
  const pl=new T.Group();pl.position.set(2,0,-16);scene.add(pl);mesh(new T.CapsuleGeometry(2,16,8,16),m(0xf4f6f8),0,3,0,pl).rotation.z=Math.PI/2;mesh(new T.BoxGeometry(6,.3,18),m(0xe0e4ea),0,2.4,0,pl);mesh(new T.BoxGeometry(.3,4,3),m(0xe0242b),-9,5.4,0,pl);
  sign(`GATE 41 · ${FLIGHT}`,0,4,-7.55,0,9,1,'#1d2340','#ffd166');
  // seats
  for(const z of [-3,0,3])for(let x=-14;x<=6;x+=1){mesh(rb(.8,.12,.7,.05),m(0x2b6fd6),x,.45,z);mesh(rb(.8,.6,.12,.05),m(0x2b6fd6),x,.75,z-.32);}
  for(const z of [-3,0,3])COL.push({x0:-14.5,x1:6.5,z0:z-.4,z1:z+.4,on:true,tall:false});
  // gate desk and the jet bridge door
  box(11,14,-2.4,-1.2,1.1,m(0x1d2340),{cast:true});sign('BOARDING',12.5,2.4,-1.15,0,3,.5,'#ffd166','#111');
  mesh(new T.PlaneGeometry(.1,2.4),glow(0x2fe39a,1.5),17.55,1.2,0);sign('JET BRIDGE →',16.6,3,0,-Math.PI/2,2.6,.45,'#2fe39a','#111');
  // duty-free kiosk: cap + sunglasses
  box(-16.5,-13.5,5.6,7.4,1.1,m(0xb5652a),{cast:true});sign('DUTY FREE · CAPS',-15,1.9,7.45,0,3.2,.5,'#1d2340','#fff');
}
let platformGuards=[],coachDoorGuard=null;
function setupPlatform(){
  buildPlatform();
  for(let i=0;i<14;i++){const c=npc(paxOpts(),rnd(-14,6),pick([-1.6,1.6,4.6,-4.6]),'platform');c.walk=rnd(.8,1.1);}
  for(let i=0;i<10;i++){const x=ri(-14,6),z=pick([-3,0,3]);const c=npc(paxOpts(),x,z,'platform','static');sitPose(c,.42);c.yaw=0;c.g.rotation.y=0;}
  gateAgent=npc({body:0x1d2340,legs:0x1d2340,skin:0xc68b5e,hair:0x111111,longHair:true,scarf:0xe0242b},12.5,-2.9,'platform','static');gateAgent.yaw=0;gateAgent.g.rotation.y=0;
  const CISF={body:0x6b7a4a,legs:0x4a5535,skin:0x9a6644,hair:0x111111,cap:0x3a4528,capPeak:0x222a18,mustache:true};
  platformGuards.push(guard({route:[[-15,-5.6],[8,-5.6],[8,5.6],[-15,5.6]],area:'platform',name:'CISF jawan',look:CISF,knows:true}));
  coachDoorGuard=guard({route:[[15.6,-1.6]],yaw:-Math.PI/2,range:6,area:'platform',name:'CISF (gate)',look:CISF});coachDoorGuard.pos.set(40,0,0);coachDoorGuard.g.visible=false;
}
const CAMS=[];
function cctv(id,x,z,yaw,sweep,range,fov=.42){const g=new T.Group();g.position.set(x,4.2,z);scene.add(g);const head=new T.Group();g.add(head);mesh(rb(.3,.24,.6,.06),m(0xf1f3f6),0,0,.2,head,{cast:true});mesh(new T.SphereGeometry(.05,8,6),glow(0xff2d2d,2),0,.08,.5,head);head.rotation.x=.55;
  const cone=coneMesh(range,fov);cone.me.material.color.set(0xff4040);cone.me.material.opacity=.12;cone.piv.position.set(x,.025,z);CAMS.push({id,x,z,base:yaw,yaw,sweep,range,fov,head,cone,ph:rnd(0,6)});}
function camSees(c,x,z){const dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz);if(d>c.range)return false;if(Math.abs(angDiff(Math.atan2(dx,dz),c.yaw))>c.fov)return false;return !losBlocked(c.x,c.z,x,z);}
function updCams(dt){for(const c of CAMS){c.ph+=dt*.3;c.yaw=c.base+Math.sin(c.ph)*c.sweep;c.head.rotation.y=c.yaw;c.cone.piv.rotation.y=c.yaw-Math.PI/2;c.cone.piv.visible=S.area==='platform';
  const seen=S.area==='platform'&&!locked&&camSees(c,P.pos.x,P.pos.z);c.cone.me.material.opacity=seen?.26:.1;if(seen&&!S.camsSeen.has(c.id)){S.camsSeen.add(c.id);snapshot(c);}}}

/* =================================================================================
   PART 2 · THE CABIN (z=TZ, nose at +x). Near side (+z) cut away. Rear galley + lavatory at -x.
   ================================================================================= */
const TZ=-300;
const CO=k=>6;
const SEATS=[];
const outside=[];
let tc=null,contact=null,grabBag=null,marshal=null,bins=[],lavDoor=null,seatbeltSign=null,doorCol=null;
const ROW_X=r=>6.2-r*1.05;
function buildTrain(){
  const wallM=m(0xf4f1ea,{roughness:.6}),seatM=m(0x1d3a6b,{roughness:.8});
  mesh(new T.BoxGeometry(17,.2,3.2),m(0x4a4f5a),0,-.1,TZ);
  mesh(new T.PlaneGeometry(17,1),m(0x2b6fd6),0,.02,TZ).rotation.x=-Math.PI/2;      // aisle carpet
  box(-8.5,8.5,TZ-1.6,TZ-1.5,2.6,wallM,{tall:true});
  for(let r=0;r<ROWS;r++)mesh(new T.CircleGeometry(.22,16),new T.MeshBasicMaterial({color:0xbfe4ff,toneMapped:false}),ROW_X(r),1.5,TZ-1.49);
  box(-8.6,-8.5,TZ-1.6,TZ+1.6,2.6,wallM,{tall:true});box(8.5,8.6,TZ-1.6,TZ+1.6,2.6,m(0xdfe3ea),{tall:true});
  mesh(new T.PlaneGeometry(.9,2),m(0x9aa3ad),8.45,1,TZ+.2).rotation.y=-Math.PI/2;                         // cockpit door
  // overhead bins (far side) with the target bin highlighted
  for(let r=0;r<ROWS;r++){const b=mesh(rb(1,.45,.7,.06),m(r===MY_ROW?0xffd166:0xe9e6de),ROW_X(r),2.25,TZ-1.15);bins.push(b);}
  seatbeltSign=mesh(new T.PlaneGeometry(.5,.25),glow(0x333333,1),4,2.55,TZ-1.48);
  // seats 2+2, facing the nose (+x)
  for(let r=0;r<ROWS;r++){const x=ROW_X(r);
    for(const z of [TZ-1.18,TZ-.72,TZ+.72,TZ+1.18]){mesh(rb(.44,.12,.42,.05),seatM,x,.45,z);mesh(rb(.1,.7,.42,.05),seatM,x-.22,.85,z);SEATS.push({kind:'sit',x,z,y:.42,yaw:Math.PI/2,taken:false,row:r});}
    COL.push({x0:x-.28,x1:x+.22,z0:TZ-1.45,z1:TZ-.5,on:true,tall:false});COL.push({x0:x-.28,x1:x+.22,z0:TZ+.5,z1:TZ+1.45,on:true,tall:false});}
  COL.push({x0:-8.6,x1:8.6,z0:TZ+1.5,z1:TZ+1.7,on:true,tall:false});   // invisible near-side wall of the cut-away cabin
  for(const s of SEATS){if(chance(.62)){s.taken=true;const c=npc(paxOpts(),s.x,s.z,'train','static');sitPose(c,s.y);c.yaw=s.yaw;c.g.rotation.y=s.yaw;}}
  // rear galley: trolley and the lavatory door, crew jacket hanging on a hook
  box(-8.4,-7.4,TZ-1.5,TZ-.6,1.1,m(0xb8bec8),{cast:true});
  lavDoor=mesh(new T.PlaneGeometry(.8,2),m(0x9aa3ad),-8.45,1,TZ+.6);lavDoor.rotation.y=Math.PI/2;mesh(new T.PlaneGeometry(.5,.18),glow(0x2fe39a,1.2),-8.44,2.15,TZ+.6).rotation.y=Math.PI/2;
  mesh(new T.CapsuleGeometry(.18,.5,4,8),m(0x1d2340),8.3,1.3,TZ-1.3);
  const lp=new T.PointLight(0xfff2dc,10,14,1.4);lp.position.set(0,2.4,TZ);scene.add(lp);
  // clouds outside (scroll past)
  const sea=mesh(new T.PlaneGeometry(240,120),m(0x6fa3d8,{roughness:1}),0,-14,TZ-40);sea.rotation.x=-Math.PI/2;
  for(let i=0;i<26;i++){const g=new T.Group();for(let k=0;k<4;k++)mesh(new T.SphereGeometry(rnd(1.2,2.4),10,8),m(0xffffff,{roughness:1}),rnd(-2,2),rnd(-.4,.6),rnd(-1,1),g);
    g.position.set(rnd(-90,90),rnd(-6,-1),TZ-rnd(6,30));scene.add(g);outside.push(g);}
  // the flight attendant (re-uses the "tc" walker) and the air marshal at the rear galley
  tc=chibi({body:0x1d2340,legs:0x1d2340,skin:0xe2b48f,hair:0x2a1d14,longHair:true,scarf:0xe0242b,shadow:true});tc.pos.set(7.6,0,TZ);tc.yaw=-Math.PI/2;tc.inArea='train';tc.bay=0;tc.icon=iconSprite();tc.sus=0;tc.ghost=true;
}
//@@PANELS
const PANELS={
  start:()=>`<svg viewBox="0 0 900 420">${NOIR}<rect width="900" height="420" fill="#0d0d0d"/><g><clipPath id="s1"><rect x="14" y="14" width="872" height="392"/></clipPath><g clip-path="url(#s1)"><rect x="14" y="14" width="872" height="392" fill="#f1ece1"/><rect x="14" y="14" width="872" height="230" fill="url(#h1)" opacity=".35"/>
    <g fill="#111"><path d="M380 230 L820 200 Q860 200 860 215 Q860 230 820 232 L380 262Z"/><path d="M600 215 L520 120 L560 120 L680 212Z"/><path d="M600 240 L540 330 L580 330 L680 240Z"/><path d="M400 232 L370 180 L395 180 L430 230Z"/></g>
    ${agent(200,170,1.15)}${capb(30,40,330,['FLIGHT PAKDI.','PAR CABIN MEIN EK AIR MARSHAL HAI.'])}<text x="560" y="110" class="sfx" font-size="40" fill="#e0242b" transform="rotate(-6 560 110)">WHOOSH!</text></g></g><rect x="14" y="14" width="872" height="392" fill="none" stroke="#f1ece1" stroke-width="5"/></svg>`,
  jump:()=>`<svg viewBox="0 0 900 420">${NOIR}<rect width="900" height="420" fill="#0d0d0d"/><g><clipPath id="j1"><rect x="14" y="14" width="872" height="392"/></clipPath><g clip-path="url(#j1)"><rect x="14" y="14" width="872" height="392" fill="#f1ece1"/><rect x="14" y="14" width="872" height="392" fill="url(#h1)" opacity=".3"/>
    <rect x="14" y="300" width="872" height="110" fill="#111"/><rect x="560" y="150" width="280" height="150" fill="#111"/><text x="700" y="240" text-anchor="middle" class="sfx" font-size="34" fill="#f1ece1">ARRIVALS</text>${agent(300,150,.95)}
    <text x="40" y="100" class="sfx" font-size="86" fill="#2fa37a" stroke="#111" stroke-width="4">LANDED!</text>${capb(520,320,350,['Immigration ne stamp maara.','Naya shehar. Naya naam.'])}</g></g><rect x="14" y="14" width="872" height="392" fill="none" stroke="#f1ece1" stroke-width="5"/></svg>`,
  caught:who=>`<svg viewBox="0 0 900 420">${NOIR}<rect width="900" height="420" fill="#0d0d0d"/><g><clipPath id="c1"><rect x="14" y="14" width="872" height="392"/></clipPath><g clip-path="url(#c1)"><rect x="14" y="14" width="872" height="392" fill="#f1ece1"/><rect x="14" y="14" width="872" height="392" fill="url(#hr)" opacity=".35"/>
    ${agent(330,170,1.2)}<g fill="#111"><circle cx="560" cy="160" r="40"/><path d="M500 210 Q560 180 620 210 L650 406 L470 406Z"/><path d="M500 240 L380 200 L384 186 L506 222Z"/></g>
    <text x="450" y="90" text-anchor="middle" class="sfx" font-size="92" fill="#e0242b" stroke="#111" stroke-width="4">PAKDI GAYI!</text>${capb(560,330,310,[esc(who)+' ne pakad liya.'])}</g></g><rect x="14" y="14" width="872" height="392" fill="none" stroke="#f1ece1" stroke-width="5"/></svg>`};
const CROPS={start:['14 14 450 392','420 14 466 392'],jump:['14 14 560 392'],caught:['14 14 872 392']};
//@@INTER
function inter(o){INTER.push(o);}
function clearWanted(){if(S.wanted&&S.wanted!==lookKey()){S.wanted=null;G.forEach(g=>{if(g.state!=='alert'){g.sus=Math.min(g.sus,15);g.state='patrol';}});}}
inter({area:'platform',label:'Buy a cap + sunglasses · ₹600',r:2.4,on:()=>S.look.outfit!=='cap',pos:()=>[-15,4.9],run:async()=>{CAREER.money-=600;S.look={outfit:'cap',hat:true};buildPlayer(P.pos.clone(),P.yaw);clearWanted();sfx.ok();toast('New look: cap + sunglasses.','good');}});
inter({area:'platform',label:'Board: show your boarding pass',r:2,pos:()=>[16.4,0],run:async()=>board()});
/* ---- cabin ---- */
function seatNear(){let best=null,bd=1.4;for(const s of SEATS){if(s.taken)continue;const d=Math.hypot(P.pos.x-s.x,P.pos.z-s.z);if(d<bd){bd=d;best=s;}}return best;}
inter({area:'train',label:'Sit down',r:3,on:()=>!S.seat&&!!seatNear()&&(S.done||Math.abs(P.pos.x-ROW_X(MY_ROW))>.8),pos:()=>{const s=seatNear();return s?[s.x,s.z]:[1e9,0];},run:async()=>{const s=seatNear();if(!s)return;s.taken=true;S.seat={kind:'sit',ref:s,back:P.pos.clone()};P.pos.set(s.x,s.y,s.z);P.yaw=s.yaw;P.g.rotation.y=s.yaw;sitPose(P,s.y);P.ring.visible=false;}});
inter({area:'train',label:()=>S.covered?'Take off the eye mask':'Put on an eye mask (hide face)',r:99,on:()=>!!S.seat,pos:()=>[P.pos.x+.01,P.pos.z],run:async()=>{S.covered=!S.covered;coverMesh.visible=S.covered;toast(S.covered?'Eye mask on. Harder to recognise, but you see nothing.':'Mask off.','info');}});
inter({area:'train',label:'Stand up',r:99,on:()=>!!S.seat,pos:()=>[P.pos.x,P.pos.z],run:async()=>standUp()});
function standUp(){if(!S.seat)return;S.seat.ref.taken=false;const b=S.seat.back;S.seat=null;S.covered=false;coverMesh.visible=false;P.pose=null;P.root.rotation.z=0;P.root.position.y=0;P.g.position.set(b.x,0,b.z);P.ring.visible=true;}
inter({area:'train',label:'Swap the drive in the yellow bin',r:1.3,on:()=>!S.done&&!S.seat,pos:()=>[ROW_X(MY_ROW),TZ-.1],run:async()=>{const ok=await hold('Bin khol ke drive badal rahi ho…',3.5,true,()=>S.stage==='landing'?'Landing! Seat pe jao.':null);
  if(ok){S.done=true;sfx.ok();bins[MY_ROW].material=m(0xe9e6de);toast('Drive swapped. Now sit tight till landing.','good');trace(`Row ${MY_ROW+1}: overhead bin khola`);}}});
inter({area:'train',label:'Front galley: put on the spare crew jacket',r:1.4,on:()=>S.look.outfit!=='crew'&&!S.seat,pos:()=>[7.9,TZ-.9],run:async()=>{const ok=await hold('Galley ke parde ke peeche jacket pehen rahi ho…',2.5,true);if(!ok)return;S.look={outfit:'crew',hat:false};buildPlayer(P.pos.clone(),P.yaw);clearWanted();sfx.ok();toast('Crew jacket on. Walking the aisle looks normal now.','good');}});
//@@FLOW
/* ---------------- flow ---------------- */
const ui=on=>['#hud','#pads','#joy','#map'].forEach(s=>$(s).hidden=!on);
function setObj(t){t=gtx(t);if($('#objText').textContent!==t)$('#objText').textContent=t;}
let coverMesh=null;
async function title(){
  $('#loading').hidden=true;
  await new Promise(res=>{const c=sheet(`<div class="eyebrow">TRACE · ${RUN?'ESCAPE · LEG '+RUN.leg:'FLIGHT'}</div><h2>Flight ${esc(FLIGHT.split(' · ')[0])}</h2>
    <div class="dossier"><h3>${esc(FLIGHT)}</h3><dl><dt>Naam</dt><dd>${esc(L.given)} ${esc(L.surname)}</dd><dt>Job</dt><dd>Row <b>${MY_ROW+1}</b> ke <b>peele overhead bin</b> mein ek hard drive hai. Usse apni drive se badlo.</dd>
    <dt>Danger</dt><dd>Ek <b>air marshal</b> peeche galley se aisle dekhta hai. Aisle mein khade raho to woh notice karega. Seatbelt sign on ho to sab baithte hain.</dd><dt>Tip</dt><dd>Aage ki galley mein spare crew jacket latki hai. Crew bankar aisle mein chalna normal lagta hai. Marshal kabhi kabhi lavatory jaata hai.</dd></dl><span class="stampx">TOP SECRET</span></div>
    <button class="btn" id="go" type="button">Go to the gate</button><a class="btn alt" href="index.html">Safehouse</a>`);
    c.querySelector('#go').onclick=()=>{auInit();AU.ctx&&AU.ctx.resume();closeSheet();res();};});
  if(!(RUN&&await arrivalCard()))await comic('start');startPlatform();}
function startPlatform(){S.phase='platform';S.area='platform';S.timeLeft=120;buildPlayer(new T.Vector3(-12,0,-1.6),Math.PI/2);ui(true);locked=false;sfx.chime();runStart();
  if(RUN&&RUN.fcode){S.phase='boarding';startTrain();return;}
  toast('Boarding is closing. Walk to the jet bridge (east end).','info');}
async function board(){if(S.phase!=='platform')return;locked=true;S.phase='talk';
  await say('Gate agent','Boarding pass and ID, please.');const ok=await nameQ('Gate agent');
  if(!ok){await say('Gate agent','Ye naam boarding pass se match nahi karta. Ek minute… Security!');closeDlg();S.phase='platform';locked=false;goAlert(platformGuards[0],'naam galat');return;}
  if(lookKey()===S.startLook&&S.wanted)await say('Gate agent','(photo ko do second zyada dekhti hai) …Theek hai. Have a nice flight.');else await say('Gate agent','Thank you. Have a nice flight.');
  closeDlg();S.phase='boarding';ui(false);trace(`Gate 41: boarding pass scan (CCTV ${S.camsSeen.size} camere)`);await sleep(400);startTrain();}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function startTrain(){S.phase='train';S.area='train';S.timeLeft=170;S.trainT=0;S.stage='cruise';S.stageT=0;
  buildPlayer(new T.Vector3(7.4,0,TZ+.05),-Math.PI/2);
  scene.background.set(0x8ec5f0);scene.fog=new T.Fog(0x8ec5f0,30,120);
  marshal=guard({route:[[-7.6,TZ-.1]],yaw:Math.PI/2,area:'train',range:9,fov:.5,knows:true,name:'Air marshal',look:{body:0x2b2f3a,legs:0x2b2f3a,skin:0x9a6644,hair:0x111111,mustache:true}});
  ui(true);$('#map').hidden=true;locked=false;banner('Find a free seat. The air marshal watches the aisle from the back.');setTimeout(()=>banner(null),5000);}
function jobDone(){}
async function jump(){if(S.phase!=='train'&&S.phase!=='talk')return;S.phase='over';locked=true;banner(null);ui(false);RT.exit='landed';await comic('jump');finish(true);}
function failMission(why){if(S.phase!=='train'&&S.phase!=='platform')return;S.phase='over';locked=true;banner(null);sfx.alert();finish(false,null,why);}
async function caught(g){if(runNoArrest(g))return;if(S.phase!=='platform'&&S.phase!=='train')return;const ph=S.phase;locked=true;S.phase='talk';if(S.seat)standUp();
  await say(g.name,'Ruko. Boarding pass dikhao. Naam?');const ok=await nameQ(g.name);
  if(await judge(g,ok)){await say(g.name,'Theek hai. Apni seat pe baitho.');closeDlg();trace(`${g.name} ne roka, naam likha`);G.forEach(o=>{if(o.area===S.area){o.state='patrol';o.sus=20;}});S.phase=ph;locked=false;return;}
  closeDlg();S.phase='over';ui(false);await comic('caught',g.name);finish(false,g.name);}
async function nameQ(who){await say(who,'Naam kya hai?');const ans=`${L.given} ${L.surname}`;const opts=shuffle([ans,...shuffle(NAMES.map(n=>n[0]+' '+n[1]).filter(x=>x!==ans)).slice(0,2)]);
  const r=await choose(opts.map(o=>({label:o})),{timer:7000});return r===ans;}
function finish(win,who,why){if(runEnd(win,who,why))return;S.phase='over';locked=true;ui(false);
  const c=sheet(`<div class="eyebrow">FLIGHT</div><h2>${win?'Landed':'Mission fail'}</h2><p>${win?'Clean landing.':who?esc(who)+' ne pakad liya.':esc(why||'')}</p>
    <button class="btn" id="again" type="button">Play again</button><a class="btn alt" href="index.html">Safehouse</a>`);
  c.querySelector('#again').onclick=()=>location.reload();}
/* ---------------- per-phase logic ---------------- */
let annT=0,clackT=0;
function platformTick(dt,t){
  S.timeLeft-=dt;if(S.timeLeft<=0)return failMission('Gate band ho gaya. Flight tumhare bina udd gayi.');
  const el=120-S.timeLeft;
  if(el>40&&!S.checkDone){S.checkDone=true;coachDoorGuard.g.visible=true;coachDoorGuard.pos.set(15.6,0,-4);sfx.chime();toast('Announcement: "Final boarding call for '+FLIGHT+'."','info');}
  setObj('Walk to the jet bridge (east end) and board');
}
function trainTick(dt,t){
  S.trainT+=dt;S.stageT+=dt;S.timeLeft-=dt;
  // stages: cruise → (marshal visits the lavatory) → turbulence (seatbelts) → cruise → landing (must be seated) → immigration
  if(S.stage==='cruise'&&S.trainT>45&&!S.lavDone){S.lavDone=true;S.lavT=22;marshal.g.visible=false;marshal.area='gone';toast('The air marshal steps into the lavatory… (22 seconds)','info');banner('Marshal in the lavatory! Do the job NOW',true);setTimeout(()=>{if(S.phase==='train')banner(null);},5000);}
  if(S.lavT>0){S.lavT-=dt;if(S.lavT<=0){marshal.g.visible=true;marshal.area='train';marshal.pos.set(-7.6,0,TZ-.1);toast('The marshal is back at the galley.','info');}}
  if(S.stage==='cruise'&&S.trainT>85&&!S.turbDone){S.turbDone=true;S.stage='turb';S.stageT=0;seatbeltSign.material=glow(0xffd166,2);sfx.chime();banner('Turbulence! Seatbelt sign ON: sit down',true);setTimeout(()=>{if(S.stage==='turb')banner(null);},5000);}
  if(S.stage==='turb'){if(!S.seat&&S.look.outfit!=='crew'){marshal.sus=Math.min(99,marshal.sus+(marshal.g.visible?10:0)*dt);}
    if(S.stageT>15){S.stage='cruise2';S.stageT=0;seatbeltSign.material=glow(0x333333,1);toast('Seatbelt sign off.','info');}}
  if((S.stage==='cruise'||S.stage==='cruise2')&&S.timeLeft<30){S.stage='landing';S.stageT=0;seatbeltSign.material=glow(0xffd166,2);sfx.chime();banner('Landing! Be in a seat when the wheels touch down',true);}
  if(S.stage==='landing'&&S.timeLeft<=0){banner(null);if(!S.seat){S.stage='done';return failMission('Landing pe khadi thi. Crew ne marshal ko bulaya.');}
    if(!S.done){S.stage='done';return failMission('Drive badli hi nahi. Contact ne airport pe intezaar karke chhod diya.');}
    S.stage='done';immigration();return;}
  updTC(dt,t);
  for(const o of outside){o.position.x-=(S.stage==='landing'?10:22)*dt;if(o.position.x<-95)o.position.x+=190;}
  clackT-=dt;if(clackT<=0){clackT=.5;burst(.5,120,.12);}
  setObj(S.stage==='landing'?`Sit down for landing! ${Math.ceil(S.timeLeft)}s`:S.stage==='turb'?'Turbulence: stay seated':!S.done?`Swap the drive: row ${MY_ROW+1}, yellow overhead bin`:'Done. Stay calm and seated till landing');
}
async function immigration(){locked=true;S.phase='talk';if(S.seat)standUp();
  await say('','(Plane rukta hai. Aerobridge, phir immigration counter.)',true);
  const hot=S.alerts>0||S.wanted;
  await say('Immigration officer',hot?'Aapke flight se ek complaint aayi hai. Kuch sawaal.':'Passport please. Kahan se aa rahi hain?');
  if(RUN&&!(await ppScan('Immigration officer'))){await say('Immigration officer','Ye passport system mein FLAGGED hai. Side mein aaiye.');closeDlg();S.phase='over';ui(false);await comic('caught','Immigration');return finish(false,'Immigration');}
  const ans=L.city;const r=await choose(shuffle([ans,...shuffle(CITIES.filter(x=>x!==ans)).slice(0,2)]).map(o=>({label:`${o} se`,value:o})),{timer:hot?5000:8000});
  if(r!==ans){await say('Immigration officer','Passport mein to kuch aur likha hai… Side mein aaiye.');closeDlg();S.phase='over';ui(false);await comic('caught','Immigration');return finish(false,'Immigration');}
  if(hot){await say('Immigration officer','Aur kaam kya karti hain?');const j=L.job;const r2=await choose(shuffle([j,...shuffle(JOBS.filter(x=>x!==j)).slice(0,2)]).map(o=>({label:o})),{timer:5000});
    if(r2!==j){await say('Immigration officer','Hmm. Security!');closeDlg();S.phase='over';ui(false);await comic('caught','Immigration');return finish(false,'Immigration');}}
  await say('Immigration officer',`Welcome to ${DEST}.`);closeDlg();jump();}
function updTC(dt,t){if(!tc||S.stage==='landing'||S.stage==='done')return;
  if(tc.checking){tc.checking-=dt;tc.speed=0;}
  else{const target=ROW_X(tc.bay);if(stepTo(tc,target,TZ,dt,.8)){tc.checking=2.4;tc.yaw=Math.PI;tc.g.rotation.y=tc.yaw;
      if(!S.paid&&Math.abs(P.pos.x-target)<1&&S.seat)snackCheck();tc.bay=(tc.bay+1)%ROWS;if(tc.bay===0)tc.pos.set(7.6,0,TZ);}}
  anim(tc,dt,tc.speed,t);tc.icon.sp.visible=false;}
async function snackCheck(){if(locked)return;locked=true;S.phase='talk';
  await say('Flight attendant','Chai, coffee, sandwich? Aur ek baar boarding pass dikha dijiye.');
  const pay=await choose([{label:'Chai, cash se',tag:'₹200',sub:'No record',value:'cash'},{label:'Sandwich, card se',tag:'₹450',sub:'Card record',value:'card'},{label:'Kuch nahi, thanks',value:'no'}]);
  if(pay==='card')trace('Card: in-flight purchase, seat ka record');if(pay!=='no')CAREER.money-=pay==='card'?450:200;
  if(lookKey()===S.startLook&&S.wanted){await say('Flight attendant','(aapke chehre ko ek second dekhti hai) …Enjoy.');marshal.sus=Math.max(marshal.sus,45);}
  else await say('Flight attendant','Enjoy your flight.');
  S.paid=true;closeDlg();S.phase='train';locked=false;}
//@@NPCUPD
function updNPC(dt,t){for(const n of NPC){if(n.inArea!==S.area)continue;let mv=false;
  if(n.beh==='wander'){if(!n.target){n.wait-=dt;if(n.wait<=0)n.target=[rnd(-15,8),pick([-1.6,1.6,4.6,-4.6])];}if(n.target){if(stepTo(n,n.target[0],n.target[1],dt,n.walk)){n.target=null;n.wait=rnd(1,5);}else mv=true;}}
  anim(n,dt,mv?n.speed:0,t);}}
//@@MINIMAP
const mc=$('#map'),mg=mc.getContext('2d');const mx=x=>(x+18)/36*236,mz=z=>(z+8)/16*168;
function drawMap(){mg.clearRect(0,0,236,168);mg.fillStyle='rgba(255,255,255,.18)';mg.fillRect(mx(-17.6),mz(-7.6),mx(17.6)-mx(-17.6),mz(8)-mz(-7.6));
  mg.strokeStyle='#2fe39a';mg.lineWidth=4;mg.beginPath();mg.arc(mx(16.4),mz(0),8,0,7);mg.stroke();
  for(const g of G){if(g.area!=='platform'||!g.g.visible)continue;mg.fillStyle=g.state==='alert'?'#ff3030':g.state==='patrol'?'#ffd166':'#ff9f1c';mg.beginPath();mg.arc(mx(g.pos.x),mz(g.pos.z),5,0,7);mg.fill();}
  mg.fillStyle='#fff';mg.beginPath();mg.arc(mx(P.pos.x),mz(P.pos.z),6,0,7);mg.fill();}
//@@BOOT
if(REAL)await loadModels();
setupPlatform();
setupCams();
function setupCams(){cctv(1,-17,-6,Math.PI*.3,.5,13);cctv(2,16.8,-6,-Math.PI*.3,.5,12);}
buildTrain();
window.__ready=true;
window.__trace={S,G,NPC,SEATS,MY_ROW,ROW_X,get P(){return P;},get tc(){return tc;},get marshal(){return marshal;},get cur(){return current&&(typeof current.label==='function'?current.label():current.label);},doAct:()=>doAct(),tp:(x,z)=>{P.pos.set(x,0,z);},board};
frame();
title();
