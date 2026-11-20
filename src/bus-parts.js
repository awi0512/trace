//@@CONST
const DESTS=['JAIPUR','AJMER','AGRA','KOTA','UDAIPUR'];
const MY_BUS=ri(1,3);            // which parked bus is ours
const MY_DEST=DESTS[MY_BUS];
const JOB='pickup';
const S={phase:'title',t:0,timeLeft:180,traces:[],camsSeen:new Set(),alerts:0,wanted:null,photos:[],look:{outfit:'coat',hat:true},startLook:'coath',
  hold:null,done:false,escape:0,seat:null,covered:false,checkDone:false,stage:'drive1',stageT:0,paid:false};
//@@WORLD
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
//@@PANELS
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
//@@INTER
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
//@@FLOW
/* ---------------- flow ---------------- */
const ui=on=>['#hud','#pads','#joy','#map'].forEach(s=>$(s).hidden=!on);
function setObj(t){if($('#objText').textContent!==t)$('#objText').textContent=t;}
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
//@@NPCUPD
function updNPC(dt,t){for(const n of NPC){if(!(n.inArea===S.area||(S.area==='train'&&n.inArea==='dhaba'&&n.g.visible)))continue;let mv=false;
  if(n.beh==='wander'){if(!n.target){n.wait-=dt;if(n.wait<=0)n.target=[clamp(n.pos.x+rnd(-12,12),-38,38),rnd(-3,10)];}if(n.target){if(stepTo(n,n.target[0],n.target[1],dt,n.walk)){n.target=null;n.wait=rnd(1,5);}else mv=true;}
    if(n.isChai&&Math.hypot(n.pos.x-P.pos.x,n.pos.z-P.pos.z)<3&&!n.said){n.said=true;toast('Chaiwala: "Chaai, garam samosa!"','info');setTimeout(()=>n.said=false,15000);}}
  anim(n,dt,mv?n.speed:0,t);}}
//@@MINIMAP
const mc=$('#map'),mg=mc.getContext('2d');const mx=x=>(x+44)/88*236,mz=z=>(z+14)/28*168;
function drawMap(){mg.clearRect(0,0,236,168);mg.fillStyle='rgba(255,255,255,.18)';mg.fillRect(mx(-43),mz(-12.5),mx(43)-mx(-43),mz(13.4)-mz(-12.5));
  for(let k=0;k<5;k++){mg.fillStyle=k===MY_BUS?'#ff9a2a':'#3a4a6a';mg.fillRect(mx(BUS_X(k)-6),mz(-9.5),mx(BUS_X(k)+6)-mx(BUS_X(k)-6),mz(-6.5)-mz(-9.5));}
  for(const g of G){if(g.area!=='platform'||!g.g.visible)continue;mg.fillStyle=g.state==='alert'?'#ff3030':g.state==='patrol'?'#ffd166':'#ff9f1c';mg.beginPath();mg.arc(mx(g.pos.x),mz(g.pos.z),5,0,7);mg.fill();}
  mg.fillStyle='#fff';mg.beginPath();mg.arc(mx(P.pos.x),mz(P.pos.z),6,0,7);mg.fill();}
//@@BOOT
setupPlatform();
setupCams();
function setupCams(){cctv(1,-38,-4,Math.PI*.6,.5,14);cctv(2,0,-4,Math.PI*.05,.7,13);cctv(3,38,-4,-Math.PI*.6,.5,14);}
buildTrain();
window.__ready=true;
window.__trace={S,G,NPC,SEATS,BUS_X,MY_BUS,MY_DEST,get P(){return P;},get tc(){return tc;},get contact(){return contact;},get cur(){return current&&(typeof current.label==='function'?current.label():current.label);},doAct:()=>doAct(),tp:(x,z)=>{P.pos.set(x,0,z);},board};
frame();
title();
