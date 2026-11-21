//@@CONST
const JOB='papers';
const S={phase:'title',t:0,timeLeft:300,traces:[],camsSeen:new Set(),alerts:0,wanted:null,photos:[],look:{outfit:'coat',hat:true},startLook:'coath',
  hold:null,done:false,escape:0,seat:null,dogsOut:false,horn1:false,horn2:false};
//@@WORLD
/* =================================================================================
   CHAPTER 4 · BANDARGAH (night port). One big open yard: container maze, sweeping searchlights,
   patrols, a sniffer dog unit later, the dock office (papers) and the ship MV SITARA at the quay (north).
   ================================================================================= */
const COACH_X=k=>0;
const TZ=-300;const CO=k=>0;const SEATS=[];const outside=[];let tc=null,contact=null,grabBag=null;
let ship=null,waterTex=null;
function containerTex(col,name){return canvasTex(256,128,(g,w,h)=>{g.fillStyle=col;g.fillRect(0,0,w,h);for(let x=0;x<w;x+=10){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,0,4,h);}g.fillStyle='rgba(255,255,255,.85)';g.font="700 26px 'Space Grotesk', sans-serif";g.fillText(name,14,34);g.font="500 14px monospace";g.fillText('SITU '+ri(100000,999999)+' 4',14,58);});}
const CTEX=[['#b8322b','SITARA LINE'],['#2b5fa8','OCEANIC'],['#2f7a46','BHARAT CARGO'],['#d97a1f','SAFFRON SHIP'],['#6b7280','GULF EXPRESS']].map(([c,n])=>containerTex(c,n));
function container(x,z,level,rot=0){const t=pick(CTEX);const me=mesh(new T.BoxGeometry(6,2.6,2.4),new T.MeshStandardMaterial({map:t,roughness:.7,metalness:.2}),x,1.3+level*2.62,z,scene,{cast:true});me.rotation.y=rot;return me;}
function buildPlatform(){
  scene.background=new T.Color(0x0a1022);scene.fog=new T.Fog(0x0a1022,30,110);hemi.color.set(0x9fb2ff);hemi.groundColor.set(0x2a2018);hemi.intensity=1.05;sun.color.set(0xbfd0ff);sun.intensity=.9;
  const asTex=canvasTex(512,512,(g,w,h)=>{g.fillStyle='#3a3d44';g.fillRect(0,0,w,h);for(let i=0;i<3000;i++){g.fillStyle=`rgba(255,255,255,${rnd(0,.06)})`;g.fillRect(rnd(0,w),rnd(0,h),2,2);}g.fillStyle='rgba(245,208,0,.55)';g.fillRect(0,250,w,8);});
  asTex.wrapS=asTex.wrapT=T.RepeatWrapping;asTex.repeat.set(8,6);
  const fl=mesh(new T.PlaneGeometry(104,64),m(0xffffff,{map:asTex,roughness:.9}),0,0,-1);fl.rotation.x=-Math.PI/2;
  // quay edge, water, the ship
  mesh(new T.BoxGeometry(104,.4,1),m(0xf5d000),0,.2,30.6);COL.push({x0:-52,x1:52,z0:30.5,z1:31.5,on:true,tall:false});
  waterTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#0b1a33';g.fillRect(0,0,w,h);for(let i=0;i<220;i++){g.strokeStyle=`rgba(120,170,255,${rnd(.05,.18)})`;g.beginPath();const x=rnd(0,w),y=rnd(0,h);g.moveTo(x,y);g.lineTo(x+rnd(10,30),y);g.stroke();}});
  waterTex.wrapS=waterTex.wrapT=T.RepeatWrapping;waterTex.repeat.set(10,4);const wa=mesh(new T.PlaneGeometry(220,80),m(0xffffff,{map:waterTex,roughness:.2,metalness:.4}),0,-1.2,72);wa.rotation.x=-Math.PI/2;
  ship=new T.Group();ship.position.set(4,0,38);scene.add(ship);
  mesh(rb(70,9,12,.8),m(0x3a1d1d,{roughness:.6}),0,2.5,0,ship,{cast:true});mesh(new T.BoxGeometry(70.1,.6,12.1),m(0xf1ece1),0,6.4,0,ship);
  mesh(rb(12,9,10,.4),m(0xf1ece1),-26,11,0,ship,{cast:true});for(let i=0;i<4;i++)mesh(new T.PlaneGeometry(9,.6),glow(0xffe0a0,1.2),-26,9+i*1.8,-5.02,ship).rotation.y=Math.PI;
  mesh(new T.CylinderGeometry(1,1.2,5,12),m(0xb8322b),-24,17.5,0,ship);
  for(let i=0;i<5;i++)for(let j=0;j<2;j++)mesh(new T.BoxGeometry(6,2.6,2.4),new T.MeshStandardMaterial({map:pick(CTEX),roughness:.7}),-10+i*7,8.1+j*2.62,-2+j*.1,ship);
  mesh(new T.PlaneGeometry(14,2),new T.MeshBasicMaterial({map:signTex('MV SITARA · DUBAI','#3a1d1d','#f1ece1',1024,150,"700 90px 'Space Grotesk', sans-serif"),toneMapped:false}),10,3.4,-6.02,ship).rotation.y=Math.PI;
  for(let i=0;i<12;i++)mesh(new T.SphereGeometry(.18,8,6),glow(i%2?0xff3b30:0x3dff7a,2.4),-34+i*6,7,-6.1,ship);
  const gw=mesh(new T.BoxGeometry(1.4,.15,9),m(0x9aa3ad,{metalness:.6}),12,3,30.5);gw.rotation.x=-.62;sign('GANGWAY',12,2.2,26.6,Math.PI,2.4,.5,'#f5d000','#111');
  // fence + gate (south), walls left/right
  for(let x=-52;x<=52;x+=4){mesh(new T.CylinderGeometry(.05,.05,3,6),m(0x777777),x,1.5,-32);}mesh(new T.BoxGeometry(104,2.6,.05),new T.MeshStandardMaterial({color:0x8a8f99,transparent:true,opacity:.35,wireframe:true}),0,1.4,-32);
  COL.push({x0:-52,x1:52,z0:-32.3,z1:-31.7,on:true,tall:false},{x0:-53,x1:-52,z0:-33,z1:33,on:true,tall:true},{x0:52,x1:53,z0:-33,z1:33,on:true,tall:true});
  // container maze (rows along x with aisles); stacks of 1-2
  const AISLES=[-31,-12,8,27];
  for(const z of [-22,-14,-6,2,10,18]){for(let x=-46;x<=46;x+=6.6){if(AISLES.some(a=>Math.abs(a-x)<4))continue;if(z===18&&x<-33)continue;if(chance(.13))continue;
    const lv=chance(.45)?2:1;for(let l=0;l<lv;l++)container(x,z,l);COL.push({x0:x-3,x1:x+3,z0:z-1.2,z1:z+1.2,on:true,tall:true});}}
  // gantry crane at the quay
  for(const x of [-24,-12])for(const z of [24,30])box(x-.4,x+.4,z-.4,z+.4,16,m(0xd97a1f),{tall:true,cast:true});
  mesh(new T.BoxGeometry(14,1,8),m(0xd97a1f),-18,16.5,27);mesh(new T.BoxGeometry(2.4,2,2.4),m(0xf1ece1),-18,15,27);mesh(new T.BoxGeometry(.1,10,.1),m(0x333333),-18,9.5,27);
  // dock office (contact) and worker locker shed
  box(-46,-38,22,27,3.4,m(0x6b7280),{cast:true});sign('DOCK OFFICE',-42,3.9,21.95,Math.PI,4.6,.7,'#1d2340','#ffffff');mesh(new T.PlaneGeometry(2,1.2),glow(0xffe0a0,1.1),-42,1.8,21.97).rotation.y=Math.PI;
  box(34,42,-31.4,-29.6,2,m(0x2f5d4a),{cast:true});sign('WORKERS · LOCKER',38,1.3,-29.55,0,4.4,.6,'#f5d000','#111');
  // sodium lamps
  for(const [x,z] of [[-40,-28],[-20,-10],[0,6],[20,-18],[40,14],[-34,14],[30,26],[-4,26]]){mesh(new T.CylinderGeometry(.12,.16,9,8),m(0x555b66),x,4.5,z);mesh(new T.SphereGeometry(.4,10,8),glow(0xffa34d,3),x,9,z);}
  for(const [x,z] of [[-30,-20],[10,2],[30,20],[-20,22]]){const pl=new T.PointLight(0xffa34d,40,26,1.4);pl.position.set(x,8,z);scene.add(pl);}
}
let platformGuards=[],coachDoorGuard=null,lockerSpot=[38,-28.2],officeSpot=[-42,20.6];
function dogify(g){g.root.visible=false;const d=new T.Group();g.g.add(d);const fur=m(0x5a3e28);
  const body=mesh(new T.CapsuleGeometry(.22,.6,4,10),fur,0,.55,0,d,{cast:true});body.rotation.x=Math.PI/2;mesh(new T.SphereGeometry(.2,12,10),fur,0,.75,.48,d);mesh(new T.CapsuleGeometry(.07,.15,3,6),m(0x111111),0,.7,.68,d).rotation.x=Math.PI/2;
  for(const s of [-1,1]){mesh(new T.ConeGeometry(.07,.16,6),fur,s*.12,.95,.44,d);for(const zz of [-.25,.25])mesh(new T.CylinderGeometry(.05,.05,.4,6),fur,s*.12,.2,zz,d);}
  const tail=mesh(new T.CylinderGeometry(.03,.05,.4,6),fur,0,.75,-.48,d);tail.rotation.x=-.8;g.dogTail=tail;}
function setupPlatform(){
  buildPlatform();
  for(let i=0;i<8;i++){const c=npc({body:0xf28b0f,legs:0x2c3150,skin:pick(SKINS),hair:0x111111,cap:0xf5d000,capPeak:0xd9b000,mustache:chance(.5)},rnd(-40,40),pick([-26,-18,-10,-2,6,14,22]),'platform');c.walk=1.1;c.worker=true;}
  contact=npc({body:0xf28b0f,legs:0x2c3150,skin:0x8f5d3e,hair:0x111111,cap:0xf5d000,capPeak:0xd9b000,mustache:true,board:true},officeSpot[0],officeSpot[1],'platform','static');contact.yaw=0;contact.g.rotation.y=0;
  const PORT={body:0x1f2d4a,legs:0x1a2238,skin:0x9a6644,hair:0x111111,cap:0x1f2d4a,capPeak:0x0e1424,mustache:true};
  platformGuards.push(guard({route:[[-31,-28],[-31,26],[-31,-28]],area:'platform',name:'Port security',look:PORT,walk:1.15}));
  platformGuards.push(guard({route:[[27,26],[27,-28],[27,26]],area:'platform',name:'Port security',look:PORT,walk:1.1}));
  platformGuards.push(guard({route:[[-46,-10],[46,-10],[46,-2],[-46,-2]],area:'platform',name:'Port security',look:PORT,knows:true}));
  platformGuards.push(guard({route:[[0,25],[24,25]],area:'platform',name:'Gangway guard',look:PORT,walk:.9}));
  coachDoorGuard=guard({route:[[8,-26],[8,22],[-12,22],[-12,-26]],area:'platform',name:'Sniffer kutta',look:{},range:6.5,fov:Math.PI,walk:1.55});dogify(coachDoorGuard);coachDoorGuard.smell=true;coachDoorGuard.pos.set(0,0,-40);coachDoorGuard.g.visible=false;
}
const CAMS=[];
function cctv(id,x,z,yaw,sweep,range,fov=.42){const g=new T.Group();g.position.set(x,0,z);scene.add(g);
  box(x-.5,x+.5,z-.5,z+.5,10,m(0x555b66),{tall:true,cast:true});const head=new T.Group();head.position.y=10.4;g.add(head);
  mesh(new T.CylinderGeometry(.5,.7,1,14),m(0x222222),0,0,.2,head).rotation.x=Math.PI/2;mesh(new T.CircleGeometry(.5,14),glow(0xfff6d8,4),0,0,.71,head);
  const beam=mesh(new T.ConeGeometry(Math.tan(fov)*range,range,24,1,true),new T.MeshBasicMaterial({color:0xfff2c0,transparent:true,opacity:.07,depthWrite:false,side:T.DoubleSide,toneMapped:false}),0,0,0,head);beam.rotation.x=-Math.PI/2;beam.position.z=range/2;
  head.rotation.x=.55;const cone=coneMesh(range,fov);cone.me.material.color.set(0xfff0a0);cone.me.material.opacity=.16;cone.piv.position.set(x,.03,z);
  CAMS.push({id,x,z,base:yaw,yaw,sweep,range,fov,head,cone,ph:rnd(0,6)});}
function camSees(c,x,z){const dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz);if(d>c.range)return false;if(Math.abs(angDiff(Math.atan2(dx,dz),c.yaw))>c.fov)return false;return !losBlocked(c.x,c.z,x,z);}
function updCams(dt){for(const c of CAMS){c.ph+=dt*.35;c.yaw=c.base+Math.sin(c.ph)*c.sweep;c.head.rotation.y=c.yaw;c.cone.piv.rotation.y=c.yaw-Math.PI/2;c.cone.piv.visible=true;
  const seen=!locked&&camSees(c,P.pos.x,P.pos.z);c.cone.me.material.opacity=seen?.32:.16;
  if(seen){if(!S.camsSeen.has(c.id)){S.camsSeen.add(c.id);snapshot(c);}
    c.cd=(c.cd||0)-dt;if(c.cd<=0){c.cd=6;const g=G.filter(o=>o.g.visible&&!o.smell).sort((a,b)=>Math.hypot(a.pos.x-P.pos.x,a.pos.z-P.pos.z)-Math.hypot(b.pos.x-P.pos.x,b.pos.z-P.pos.z))[0];
      if(g){g.sus=Math.max(g.sus,60);if(g.state!=='alert'){g.state='search';g.lastSeen=[P.pos.x,P.pos.z];g.searchT=12;}toast(`Searchlight ${c.id}: "Container ke paas koi hai! Check karo."`);}}}}}
function buildTrain(){}
//@@PANELS
const PANELS={
  start:()=>`<svg viewBox="0 0 900 420">${NOIR}<rect width="900" height="420" fill="#0d0d0d"/><g><clipPath id="s1"><rect x="14" y="14" width="872" height="392"/></clipPath><g clip-path="url(#s1)"><rect x="14" y="14" width="872" height="392" fill="#111"/>
    <polygon points="700,40 420,406 860,406" fill="#f1ece1" opacity=".18"/><g fill="#f1ece1" opacity=".9"><rect x="560" y="60" width="16" height="250"/><rect x="560" y="60" width="300" height="16"/><rect x="820" y="76" width="4" height="120"/></g>
    <rect x="14" y="300" width="872" height="110" fill="url(#h2)" opacity=".5"/><g fill="#f1ece1" opacity=".85"><rect x="380" y="230" width="480" height="80"/><rect x="400" y="190" width="90" height="40"/></g>
    <text x="620" y="285" text-anchor="middle" class="sfx" font-size="34" fill="#111">MV SITARA</text>${agent(200,170,1.15)}
    ${capb(30,40,330,['GUJARAT. BANDARGAH. RAAT 3 BAJE.','EK JAHAZ. EK AKHRI MAUKA.'])}<text x="430" y="150" class="sfx" font-size="40" fill="#e0242b" transform="rotate(-6 430 150)">VHOOOOM!</text></g></g><rect x="14" y="14" width="872" height="392" fill="none" stroke="#f1ece1" stroke-width="5"/></svg>`,
  jump:()=>`<svg viewBox="0 0 900 420">${NOIR}<rect width="900" height="420" fill="#0d0d0d"/><g><clipPath id="j1"><rect x="14" y="14" width="872" height="392"/></clipPath><g clip-path="url(#j1)"><rect x="14" y="14" width="872" height="392" fill="#111"/>
    <circle cx="760" cy="100" r="50" fill="#f1ece1" opacity=".9"/><rect x="14" y="300" width="872" height="110" fill="url(#h2)"/><g fill="#f1ece1"><rect x="120" y="210" width="560" height="90"/><rect x="140" y="150" width="120" height="60"/></g>
    <text x="400" y="270" text-anchor="middle" class="sfx" font-size="40" fill="#111">MV SITARA → DUBAI</text>${agent(560,120,.55)}
    <text x="40" y="110" class="sfx" font-size="84" fill="#2fa37a" stroke="#111" stroke-width="4">JAHAZ CHAL PADA!</text></g></g><rect x="14" y="14" width="872" height="392" fill="none" stroke="#f1ece1" stroke-width="5"/></svg>`,
  dubai:()=>`<svg viewBox="0 0 900 520">${NOIR}<rect width="900" height="520" fill="#0d0d0d"/><g><clipPath id="d1"><rect x="14" y="14" width="872" height="492"/></clipPath><g clip-path="url(#d1)"><rect x="14" y="14" width="872" height="492" fill="#111"/>
    <polygon points="450,30 250,506 650,506" fill="#f1ece1" opacity=".9"/><polygon points="450,30 250,506 650,506" fill="url(#h1)" opacity=".45"/><rect x="440" y="14" width="20" height="30" fill="#f1ece1"/>
    <rect x="260" y="380" width="380" height="22" fill="#111"/>${agent(380,270,.95)}<g fill="#111"><circle cx="540" cy="240" r="40"/><path d="M470 300 Q540 270 610 300 L620 506 L460 506Z"/><path d="M490 210 h100 l-6 -22 h-88z"/></g>
    <g fill="#f1ece1"><rect x="420" y="372" width="60" height="44" transform="rotate(-8 450 394)"/><rect x="490" y="372" width="60" height="44" transform="rotate(6 520 394)"/></g>
    ${capb(30,30,330,['DUBAI. 3 DIN BAAD.','WAHI INTERROGATION ROOM.'])}${capb(560,420,310,['Ab sach batane ka waqt hai.'])}</g></g><rect x="14" y="14" width="872" height="492" fill="none" stroke="#f1ece1" stroke-width="5"/></svg>`,
  caught:who=>`<svg viewBox="0 0 900 420">${NOIR}<rect width="900" height="420" fill="#0d0d0d"/><g><clipPath id="c1"><rect x="14" y="14" width="872" height="392"/></clipPath><g clip-path="url(#c1)"><rect x="14" y="14" width="872" height="392" fill="#f1ece1"/><rect x="14" y="14" width="872" height="392" fill="url(#hr)" opacity=".35"/>
    ${agent(330,170,1.2)}<g fill="#111"><circle cx="560" cy="160" r="40"/><path d="M500 210 Q560 180 620 210 L650 406 L470 406Z"/><path d="M510 128 h100 l-8 -24 h-84z"/><path d="M500 240 L380 200 L384 186 L506 222Z"/></g>
    <text x="450" y="90" text-anchor="middle" class="sfx" font-size="92" fill="#e0242b" stroke="#111" stroke-width="4">PAKDI GAYI!</text>${capb(560,330,310,[esc(who)+' ne pakad liya.'])}</g></g><rect x="14" y="14" width="872" height="392" fill="none" stroke="#f1ece1" stroke-width="5"/></svg>`};
const CROPS={start:['14 14 450 392','420 14 466 392'],jump:['14 14 560 392'],dubai:['14 14 560 492'],caught:['14 14 872 392']};
//@@INTER
function inter(o){INTER.push(o);}
inter({area:'platform',label:'Locker se dock jacket + helmet lo',r:2.4,on:()=>S.look.outfit!=='worker',pos:()=>[lockerSpot[0],lockerSpot[1]],run:async()=>{const ok=await hold('Locker ka taala tod rahi ho…',2.2,true);if(!ok)return;
  S.look={outfit:'worker',hat:true};buildPlayer(P.pos.clone(),P.yaw);if(S.wanted&&S.wanted!==lookKey()){S.wanted=null;G.forEach(g=>{if(g.state!=='alert'){g.sus=Math.min(g.sus,15);g.state='patrol';}});}sfx.ok();toast('Ab tum ek dock worker ho. Shaanti se chalo to koi nahi rokega.','good');}});
inter({area:'platform',label:'Ismail bhai se kaagaz lo',r:1.9,on:()=>!S.done,pos:()=>[contact.pos.x,contact.pos.z],run:async()=>{locked=true;await say('Ismail bhai','(dheemi aawaaz) Crew list mein tumhara naam daal diya hai: "Deck hand". Ye lo pass. Jaldi karo, jahaz 4 baje nikal jaayega.');closeDlg();locked=false;
  const ok=await hold('Pass aur crew card jeb mein rakh rahi ho…',2,true);if(ok){S.done=true;sfx.ok();toast('Crew pass mil gaya! Ab gangway tak pahuncho.','good');banner('Gangway tak jao (jahaz ke beech mein) →');setTimeout(()=>banner(null),5000);}}});
inter({area:'platform',label:'Gangway pe chadho',r:2.4,on:()=>S.done,pos:()=>[12,26.4],run:async()=>{const g=G.find(o=>o.name==='Gangway guard');locked=true;
  await say('Gangway guard','Ruko. Pass dikhao. Naam?');const ok=await nameQ('Gangway guard');
  if(!ok){await say('Gangway guard','Ye naam crew list mein nahi hai! SECURITY!');closeDlg();locked=false;goAlert(g,'galat naam');return;}
  if(lookKey()===S.startLook){await say('Gangway guard','Deck hand… is coat mein? Hmm, chalo jaldi.');trace('Gangway: guard ne coat aur hat pe gaur kiya');}
  else await say('Gangway guard','Theek hai, upar jao.');closeDlg();jump();}});
/* escape mode: a speedboat at the west quay. No papers needed, but you leave loud */
let boat=null;function addBoat(){if(boat||!RUN)return;boat=new T.Group();boat.position.set(45,-.9,34.2);scene.add(boat);
  mesh(rb(2.2,1,5.2,.4),m(0xf1ece1),0,.5,0,boat,{cast:true});mesh(new T.BoxGeometry(2.25,.25,5.25),m(0xe0242b),0,.25,0,boat);mesh(rb(1.4,.8,1.2,.2),m(0x1d2340),0,1.3,.4,boat);
  sign('SPEEDBOAT',45,1.1,30.4,Math.PI,2.2,.4,'#e0242b','#fff');setTimeout(()=>{if(RT.on)toast('A speedboat sits at the east quay. No papers needed, but stealing it is loud.','info');},6500);}
inter({area:'platform',label:'Steal the speedboat (loud escape)',r:2.2,on:()=>RT.on&&S.phase==='platform',pos:()=>[45,29.8],run:async()=>{const ok=await hold('Engine ki taar jod rahi ho…',4,true);if(!ok)return;
  RT.exit='boat';addStars(1,'stolen speedboat');S.phase='over';locked=true;banner(null);ui(false);sfx.horn();finish(true);}});
//@@FLOW
const ui=on=>['#hud','#pads','#joy','#map'].forEach(s=>$(s).hidden=!on);
function setObj(t){t=gtx(t);if($('#objText').textContent!==t)$('#objText').textContent=t;}
async function title(){
  $('#loading').hidden=true;const C=getC();const story=!!(C&&C.active&&C.ch>=4);
  await new Promise(res=>{const c=sheet(`<div class="eyebrow">${RUN?'ESCAPE · LEG '+RUN.leg:'TRACE · '+(story?'CHAPTER 4':'LEVEL 4')}</div><h2>The Last Ship</h2>
    <div class="dossier"><h3>MV SITARA · Dubai</h3><dl><dt>Naam</dt><dd>${esc(L.given)} ${esc(L.surname)}</dd><dt>Jahaz</dt><dd>Raat 4 baje nikalta hai (5 minute)</dd>
    <dt>Kaam</dt><dd><b>Dock office</b> (upar-right, quay ke paas) se Ismail bhai ka crew pass lo, phir <b>gangway</b> se jahaz pe chadho.</dd><dt>Khatra</dt><dd>Ghoomti <b>searchlights</b>, port security, aur thodi der mein <b>sniffer kutte</b>. Kutte deewar ke peeche bhi soongh lete hain.</dd>
    <dt>Tip</dt><dd>Neeche-left ke locker shed se dock worker ki jacket lo. Containers ke beech chhupo.</dd></dl><span class="stampx">TOP SECRET</span></div>
    <button class="btn" id="go" type="button">Enter the docks</button><a class="btn alt" href="index.html">Safehouse</a>`);
    c.querySelector('#go').onclick=()=>{auInit();AU.ctx&&AU.ctx.resume();closeSheet();res();};});
  if(!(RUN&&await arrivalCard()))await comic('start');startPlatform();}
function startPlatform(){addBoat();S.phase='platform';S.area='platform';S.timeLeft=300;buildPlayer(new T.Vector3(-46,0,-28),0);ui(true);locked=false;sfx.horn();runStart();
  toast('Neeche-left gole se chalo. Searchlight ki roshni aur guards ki peeli nazar se bacho.','info');}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function board(){}
function startTrain(){}
async function jump(){if(S.phase!=='platform'&&S.phase!=='talk')return;S.phase='over';locked=true;banner(null);ui(false);sfx.horn();RT.exit='ship';await comic('jump');if(runEnd(true))return;await finale(true);}
function failMission(why){if(S.phase!=='platform')return;S.phase='over';locked=true;banner(null);sfx.alert();finish(false,null,why);}
async function caught(g){if(runNoArrest(g))return;if(S.phase!=='platform')return;locked=true;S.phase='talk';
  await say(g.name==='Sniffer kutta'?'Port security':g.name,g.name==='Sniffer kutta'?'(kutta bhaunkta hai) Ruko! Haath upar! Naam?':'Ruko! Yahan kya kar rahi ho? Naam?');const ok=await nameQ(g.name);
  if(await judge(g,ok)){await say('Port security','Hmm, nayi aayi ho? Apni shift pe jao.');closeDlg();trace('Port security ne roka, naam likha');G.forEach(o=>{o.state='patrol';o.sus=20;});S.phase='platform';locked=false;return;}
  closeDlg();S.phase='over';ui(false);await comic('caught',g.name==='Sniffer kutta'?'Sniffer kutte':g.name);finish(false,g.name==='Sniffer kutta'?'Sniffer kutte':g.name);}
async function nameQ(who){await say(who,'Naam kya hai?');const ans=`${L.given} ${L.surname}`;const opts=shuffle([ans,...shuffle(NAMES.map(n=>n[0]+' '+n[1]).filter(x=>x!==ans)).slice(0,2)]);
  const r=await choose(opts.map(o=>({label:o})),{timer:7000});return r===ans;}
function finish(win,who,why){if(runEnd(win,who,why))return;S.phase='over';locked=true;ui(false);const C=getC();const story=!!(C&&C.active&&C.ch>=4);
  CAREER.missions=(CAREER.missions||0)+1;saveCareer();
  const c=sheet(`<div class="eyebrow">${story?'CHAPTER 4':'LEVEL 4'} · THE LAST SHIP</div><h2>Mission fail</h2><p>${who?esc(who)+' ne pakad liya.':esc(why||'Jahaz chhoot gaya.')}</p>
    <button class="btn" id="again" type="button">${story?'Replay chapter':'Play again'}</button><a class="btn alt" href="index.html">Safehouse</a>`);
  c.querySelector('#again').onclick=()=>location.reload();}
/* ---------------- finale: "Dubai, 3 din baad" interrogation, using the whole journey's evidence ---------------- */
async function finale(){
  const C=getC();const story=!!(C&&C.active&&C.ch>=4);
  const levelTraces=S.traces.map(t=>({ch:4,text:t.text}));
  const log=(story?(C.log||[]):[]).concat(levelTraces);
  const photos=(story?(C.photos||[]):[]).concat(S.photos.slice(0,2).map(p=>({url:p.url,label:'Port searchlight '+p.id})));
  const alerts=(story?(C.alerts||0):0)+S.alerts;
  await comic('dubai');
  const off='Senior officer';
  let sus=clamp(log.length*6+alerts*8+(CAREER.heat||0)/4,10,85);
  await say(off,'Shuru se batao. Mumbai se Dubai tak. Hum sab jaante hain, phir bhi tumhare muh se sunna hai.');
  const items=[];photos.slice(0,2).forEach(p=>items.push({kind:'photo',label:p.label,url:p.url}));
  for(const e of log){if(items.length>=4)break;if(/UPI|app|TC|Conductor|naam|CCTV|record|scan/i.test(e.text))items.push({kind:'text',label:e.text});}
  if(!items.length)await say(off,'Ajeeb baat hai. Tumhare khilaaf hamare paas kuch bhi nahi hai. Na photo, na payment.');
  for(const it of items.slice(0,3)){
    if(it.kind==='photo'){const s=sheet(`<div class="eyebrow">SABOOT · ${esc(it.label)}</div><div class="snap" style="--r:-2deg;align-self:center"><img alt="CCTV saboot" src="${it.url}" style="width:min(72vw,300px);height:auto"></div><button class="btn" id="ok" type="button">Dekh liya</button>`);await new Promise(r=>s.querySelector('#ok').onclick=()=>{closeSheet();r();});
      await say(off,`Ye ${it.label} ki photo hai. Ye tum ho na?`);}
    else await say(off,`Hamare record mein ye bhi hai: "${it.label}". Samjhao.`);
    const r=await choose([{label:`"Main ${L.job} hoon, ${L.city} se. Kaam ke silsile mein safar kar rahi thi."`,sub:'Cover story pe tiko',value:'cover'},{label:'"Ye main nahi hoon. Koi galatfehmi hai."',sub:'Saaf inkaar',value:'deny'},{label:'"Mujhe embassy se baat karni hai."',sub:'Chup raho',value:'silent'}]);
    if(r==='cover')sus-=12;else if(r==='deny')sus+=it.kind==='photo'?10:-6;
    await say(off,r==='cover'?'Hmm… kahani to seedhi hai.':r==='deny'?(it.kind==='photo'?'Photo jhooth nahi bolti.':'Shayad.'):'(likhta hai) Embassy. Theek hai.');}
  await say(off,'Ek aakhri sawaal. Tum rehti kahan ho?');
  const ans=L.city;const r2=await choose(shuffle([ans,...shuffle(CITIES.filter(x=>x!==ans)).slice(0,2)]).map(o=>({label:o})),{timer:7000});sus+=r2===ans?-10:20;
  closeDlg();
  const ending=sus<35?'ghost':sus<65?'deport':'caught';
  const E={ghost:['GHOST','Unhone tumhe jaane diya. Device sahi haathon tak pahunch gaya. Tumhara asli naam kisi file mein nahi hai.','var(--good)'],
           deport:['DEPORT','Saboot adhoore the. Tumhe agli flight se India wapas bhej diya, par mission poora ho chuka tha.','var(--accent)'],
           caught:['PAKDI GAYI','Tumhara poora trace unke paas tha: photos, payments, naam. Har kadam ka nishaan tumhare khilaaf gaya.','var(--red)']}[ending];
  const reward=ending==='ghost'?400000:ending==='deport'?150000:0;CAREER.money+=reward;CAREER.heat=Math.max(0,(CAREER.heat||0)-30);CAREER.wins=(CAREER.wins||0)+1;CAREER.missions=(CAREER.missions||0)+1;CAREER.portDone=true;
  CAREER.endings=Array.from(new Set((CAREER.endings||[]).concat([ending])));saveCareer();
  if(story){C.active=false;C.ending=ending;C.done=Date.now();saveC(C);}
  const c=sheet(`<div class="eyebrow">${story?'KAHANI KHATAM · MUMBAI SE BHAAGO':'LEVEL 4 · FINALE'}</div><h2 style="color:${E[2]}">${E[0]}</h2><p>${E[1]}</p>
    <div class="stats"><div class="stat"><span>Reward</span><b>${inr(reward)}</b></div><div class="stat"><span>Nishaan</span><b>${log.length}</b></div><div class="stat"><span>Alerts</span><b>${alerts}</b></div></div>
    <p class="eyebrow">ENDINGS MILE: ${(CAREER.endings||[]).length}/3 ${['ghost','deport','caught'].map(e=>(CAREER.endings||[]).includes(e)?'●':'○').join(' ')}</p>
    ${photos.length?`<p class="eyebrow">TUMHARE SAFAR KI CCTV PHOTOS</p><div class="gallery">${photos.map(p=>`<div class="snap"><img alt="${esc(p.label)}" src="${p.url}"><b>${esc(p.label)}</b></div>`).join('')}</div>`:''}
    <p class="eyebrow">POORA DIGITAL FOOTPRINT</p><ul class="traces">${log.length?log.map(t=>`<li>Ch ${t.ch} · ${esc(t.text)}</li>`).join(''):'<li class="ok">No traces.</li>'}</ul>
    <button class="btn" id="newstory" type="button">Start a new story</button><a class="btn alt" href="index.html">Safehouse</a>`);
  c.querySelector('#newstory').onclick=()=>{saveC({active:true,ch:1,log:[],photos:[],alerts:0,started:Date.now()});location.href='cab.html';};}
/* ---------------- per-phase logic ---------------- */
let annT=0,clackT=0;
function platformTick(dt,t){
  S.timeLeft-=dt;if(S.timeLeft<=0)return failMission('MV SITARA tumhare bina nikal gaya. Port pe subah ki shift aa gayi.');
  const el=300-S.timeLeft;
  if(el>75&&!S.dogsOut){S.dogsOut=true;coachDoorGuard.g.visible=true;coachDoorGuard.pos.set(8,0,-26);sfx.alert();vib([80,40,80]);toast('Radio: "Customs ne sniffer kutte chhod diye hain."');banner('Sniffer kutta chhoda gaya! Wo deewar ke peeche bhi soonghta hai',true);setTimeout(()=>{if(S.phase==='platform')banner(null);},6000);}
  if(S.timeLeft<120&&!S.horn1){S.horn1=true;sfx.horn();toast('MV SITARA ka bhonpu: 2 minute mein jahaz nikal jaayega!','info');}
  if(S.timeLeft<45&&!S.horn2){S.horn2=true;sfx.horn();toast('Aakhri bhonpu! Gangway uthne wala hai!','info');}
  waterTex.offset.x+=dt*.01;if(coachDoorGuard.dogTail)coachDoorGuard.dogTail.rotation.z=Math.sin(t*12)*.5;
  setObj(S.done?'Gangway tak pahuncho aur jahaz pe chadho':S.look.outfit!=='worker'?'Dock office se crew pass lo (upar-right). Tip: locker shed (neeche-left) se worker jacket':'Dock office se Ismail bhai ka crew pass lo (upar-right, quay ke paas)');
}
function trainTick(){}
function updTC(){}
//@@NPCUPD
function updNPC(dt,t){for(const n of NPC){if(n.inArea!==S.area)continue;let mv=false;
  if(n.beh==='wander'){if(!n.target){n.wait-=dt;if(n.wait<=0){const aisle=pick([-31,-12,8,27]);n.target=chance(.5)?[aisle+rnd(-1,1),rnd(-28,26)]:[clamp(n.pos.x+rnd(-14,14),-46,46),pick([-26,-18,-10,-2,6,14,22,26])];}}
    if(n.target){if(stepTo(n,n.target[0],n.target[1],dt,n.walk)){n.target=null;n.wait=rnd(1,5);}else mv=true;}}
  anim(n,dt,mv?n.speed:0,t);}}
//@@MINIMAP
const mc=$('#map'),mg=mc.getContext('2d');const mx=x=>(53-x)/106*236,mz=z=>(33-z)/66*168;
function drawMap(){mg.clearRect(0,0,236,168);mg.fillStyle='rgba(120,140,170,.45)';for(const c of COL){if(!c.on||!c.tall)continue;mg.fillRect(mx(c.x0),mz(c.z1),Math.max(2,mx(c.x1)-mx(c.x0)),Math.max(2,mz(c.z0)-mz(c.z1)));}
  mg.fillStyle='#3a1d1d';mg.fillRect(mx(-31),mz(44),mx(39)-mx(-31),mz(32)-mz(44));
  const o=S.done?[12,26.4]:officeSpot;mg.strokeStyle='#2fe39a';mg.lineWidth=4;mg.beginPath();mg.arc(mx(o[0]),mz(o[1]),9,0,7);mg.stroke();
  if(S.look.outfit!=='worker'&&!S.done){mg.strokeStyle='#f28b0f';mg.beginPath();mg.arc(mx(lockerSpot[0]),mz(lockerSpot[1]),7,0,7);mg.stroke();}
  for(const g of G){if(!g.g.visible)continue;mg.fillStyle=g.smell?'#c58a4a':g.state==='alert'?'#ff3030':g.state==='patrol'?'#ffd166':'#ff9f1c';mg.beginPath();mg.arc(mx(g.pos.x),mz(g.pos.z),5,0,7);mg.fill();}
  mg.fillStyle='#fff';mg.beginPath();mg.arc(mx(P.pos.x),mz(P.pos.z),6,0,7);mg.fill();}
//@@BOOT
if(REAL)await loadModels();
setupPlatform();
setupCams();
function setupCams(){cctv(1,-20,-30,Math.PI*.15,.7,22,.2);cctv(2,20,8,-Math.PI*.6,.8,22,.2);cctv(3,-46,6,Math.PI*.5,.6,20,.2);cctv(4,44,-28,-Math.PI*.2,.6,20,.2);}
window.__ready=true;
window.__trace={S,G,NPC,get P(){return P;},get contact(){return contact;},get cur(){return current&&(typeof current.label==='function'?current.label():current.label);},doAct:()=>doAct(),tp:(x,z)=>{P.pos.set(x,0,z);},finale,jump};
frame();
title();
