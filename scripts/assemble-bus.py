"""Builds bus.html (Level 3) from the shared engine in src/train.js plus the bus-specific parts in
src/bus-parts.js, with the CSS of index.html. Run after editing either file:  python3 scripts/assemble-bus.py"""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
tr = (root / 'src' / 'train.js').read_text(encoding='utf-8')
parts = (root / 'src' / 'bus-parts.js').read_text(encoding='utf-8')
P = dict(re.findall(r'//@@(\w+)\n(.*?)(?=\n//@@|\Z)', parts, re.S))

def between(s, a, b):
    i = s.index(a); j = s.index(b, i)
    return s[:i], s[i:j], s[j:]

js = tr
# constants and state
pre, _, post = between(js, 'const MY_COACH=', 'const lookKey=')
js = pre + P['CONST'] + '\n' + post
# world (platform + vehicle interior)
pre, _, post = between(js, '/* =================================================================================\n   PART 1', '/* ---------------- player')
js = pre + P['WORLD'] + '\n' + post
# comic panels
pre, _, post = between(js, 'const PANELS={', 'function comic(')
js = pre + P['PANELS'] + '\n' + post
# level-specific interactions
pre, _, post = between(js, '/* ---- platform interactions ---- */', '/* ---------------- flow')
js = pre + P['INTER'] + '\n' + post
# flow + per-phase logic
pre, _, post = between(js, '/* ---------------- flow', '/* ---------------- NPC update')
js = pre + P['FLOW'] + '\n' + post
pre, _, post = between(js, 'function updNPC(', '/* ---------------- input')
js = pre + P['NPCUPD'] + '\n' + post
pre, _, post = between(js, 'const mc=$(\'#map\')', '/* ---------------- camera & loop')
js = pre + P['MINIMAP'] + '\n' + post
js = js[:js.index('/* ---------------- boot ---------------- */')] + '/* ---------------- boot ---------------- */\n' + P['BOOT']

def rep(a, b):
    global js
    assert a in js, 'MISSING: ' + a[:90]
    js = js.replace(a, b, 1)
rep('/* TRACE · Level 2 · Raat ki Gaadi', '/* TRACE · Level 3 · Highway ki Bus (built by scripts/assemble-bus.py from src/train.js + src/bus-parts.js)\n   Original header: TRACE · Level 2 · Raat ki Gaadi')
rep('const RPF={body:0x5b4a3a,legs:0x3a2f24,skin:0x9a6644,hair:0x111111,cap:0x8a1f2a,capPeak:0x2b1a10,mustache:true,shadow:true};',
    'const RPF={body:0xb8a06a,legs:0xa08a5a,skin:0x9a6644,hair:0x111111,cap:0x2b3a7a,capPeak:0x1a2240,mustache:true,shadow:true};')
rep("  if(o.mustache)mesh(rb(.3,.07,.08,.03),m(0x1b1410),0,-.17,.47,head);",
    "  if(o.mustache)mesh(rb(.3,.07,.08,.03),m(0x1b1410),0,-.17,.47,head);\n  if(o.glasses){for(const s of [-1,1])mesh(new T.TorusGeometry(.11,.025,6,14),m(0x111111),s*.18,.03,.5,head);}")
rep("else if(F.seated)gain*=.25;", "else if(F.seated)gain*=S.covered?.1:.25;")
rep("if(S.area==='train'){const port=innerHeight>innerWidth;pos=new T.Vector3(tx,port?7.6:6.2,TZ+(port?9.6:8.2));look=new T.Vector3(tx,.7,TZ-.5);",
    "if(S.area==='train'){const port=innerHeight>innerWidth,zc=Math.max(tz,TZ);pos=new T.Vector3(tx,port?7.6:6.2,zc+(port?9.6:8.2));look=new T.Vector3(tx,.7,zc-.5);")
rep("'PF4 CAM '+c.id", "'ADDA CAM '+c.id")
rep("const ts='23:'+String(31+", "const ts='06:'+String(11+")
rep("<b>PF4 CAM ${c.id} · ${ts}</b>", "<b>ADDA CAM ${c.id} · ${ts}</b>")
# outfits for this level, plus a face cover that hangs off the head
i = js.index('function buildPlayer(pos,yaw){'); j = js.index('\nconst input=', i)
js = js[:i] + """function buildPlayer(pos,yaw){if(P)scene.remove(P.g);let o;
  if(S.look.outfit==='cap')o={body:0x3d6fd6,legs:0x2c3150,cap:0xf5f5f5,capPeak:0x222222,glasses:true};
  else if(S.look.outfit==='dupatta')o={body:0xc0392b,legs:0x2c2c36,scarf:0xff5fa2,shawl:0xc0392b,glasses:true};
  else o={body:0xd9c3a0,coat:true,scarf:0xe0242b,legs:0x2c2c36,hat:0x2b2b35};
  Object.assign(o,{skin:0xc68b5e,hair:0x1a1a1a,longHair:true,shadow:true,bag:0x2b2f3a});charLook(o);P=chibi(o);P.pos.copy(pos);P.yaw=yaw;P.g.rotation.y=yaw;
  const ring=new T.Mesh(new T.RingGeometry(.5,.62,28),new T.MeshBasicMaterial({color:0xf5b82e,transparent:true,opacity:.85,toneMapped:false,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.04;P.g.add(ring);P.ring=ring;
  coverMesh=mesh(new T.SphereGeometry(.57,16,12,0,Math.PI*2,0,Math.PI*.72),m(0xff5fa2,{side:T.DoubleSide}),0,.04,0,P.head);coverMesh.visible=S.covered;}""" + js[j:]
# keep the player inside the dhaba yard during the stop
rep("  S.trainT+=dt;S.stageT+=dt;S.timeLeft-=dt;", "  S.trainT+=dt;S.stageT+=dt;S.timeLeft-=dt;\n  if(P.pos.z>TZ+1.45){P.pos.x=clamp(P.pos.x,-11,11);P.pos.z=Math.min(P.pos.z,TZ+9.8);}")
(root / 'src' / 'bus.js').write_text(js, encoding='utf-8')
idx = (root / 'index.html').read_text(encoding='utf-8')
css = idx[idx.index('<style>'):idx.index('</style>') + len('</style>')]
head = (root / 'src' / 'train-head.html').read_text(encoding='utf-8').replace('Trace · Raat ki Gaadi', 'Trace · Highway ki Bus')
body = (root / 'src' / 'train-body.html').read_text(encoding='utf-8').replace('Platform 4, raat 11:30…', 'Bus adda, subah 6 baje…')
(root / 'bus.html').write_text(head + css + '\n' + body + js + '\n</script>\n</body>\n</html>\n', encoding='utf-8')
print('Built bus.html')
