"""Builds port.html (Chapter 4 / Level 4: Bandar ka Akhri Jahaz) from the shared engine in src/train.js plus
src/port-parts.js, with the CSS of index.html. Run:  python3 scripts/assemble-port.py"""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
tr = (root / 'src' / 'train.js').read_text(encoding='utf-8')
parts = (root / 'src' / 'port-parts.js').read_text(encoding='utf-8')
P = dict(re.findall(r'//@@(\w+)\n(.*?)(?=\n//@@|\Z)', parts, re.S))

def between(s, a, b):
    i = s.index(a); j = s.index(b, i)
    return s[:i], s[i:j], s[j:]

js = tr
pre, _, post = between(js, 'const MY_COACH=', 'const lookKey=')
js = pre + P['CONST'] + '\n' + post
pre, _, post = between(js, '/* =================================================================================\n   PART 1', '/* ---------------- player')
js = pre + P['WORLD'] + '\n' + post
pre, _, post = between(js, 'const PANELS={', 'function comic(')
js = pre + P['PANELS'] + '\n' + post
pre, _, post = between(js, '/* ---- platform interactions ---- */', '/* ---------------- flow')
js = pre + P['INTER'] + '\n' + post
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
rep('/* TRACE · Level 2 · Raat ki Gaadi', '/* TRACE · Chapter 4 · Bandar ka Akhri Jahaz (built by scripts/assemble-port.py from src/train.js + src/port-parts.js)\n   Original header: TRACE · Level 2 · Raat ki Gaadi')
rep('const RPF={body:0x5b4a3a,legs:0x3a2f24,skin:0x9a6644,hair:0x111111,cap:0x8a1f2a,capPeak:0x2b1a10,mustache:true,shadow:true};',
    'const RPF={body:0x1f2d4a,legs:0x1a2238,skin:0x9a6644,hair:0x111111,cap:0x1f2d4a,capPeak:0x0e1424,mustache:true,shadow:true};')
# sniffer dogs smell through walls at close range
rep('function canSee(g,x,z){const dx=x-g.pos.x,dz=z-g.pos.z,d=Math.hypot(dx,dz);',
    'function canSee(g,x,z){const dx=x-g.pos.x,dz=z-g.pos.z,d=Math.hypot(dx,dz);if(g.smell){if(!g.g.visible)return 0;if(d<g.range)return Math.max(d,.01);}')
# camera looks north, towards the quay and the ship
rep('let CAMY0=Math.atan2(-7,11)', 'let CAMY0=Math.atan2(4,-11)')
rep("'PF4 CAM '+c.id", "'PORT CAM '+c.id")
rep("const ts='23:'+String(31+", "const ts='03:'+String(21+")
rep("<b>PF4 CAM ${c.id} · ${ts}</b>", "<b>PORT CAM ${c.id} · ${ts}</b>")
i = js.index('function buildPlayer(pos,yaw){'); j = js.index('\nconst input=', i)
js = js[:i] + """function buildPlayer(pos,yaw){if(P)scene.remove(P.g);let o;
  if(S.look.outfit==='worker')o={body:0xf28b0f,legs:0x2c3150,cap:0xf5d000,capPeak:0xd9b000};
  else o={body:0xd9c3a0,coat:true,scarf:0xe0242b,legs:0x2c2c36,hat:0x2b2b35};
  Object.assign(o,{skin:0xc68b5e,hair:0x1a1a1a,longHair:true,shadow:true,bag:0x2b2f3a});charLook(o);P=chibi(o);P.pos.copy(pos);P.yaw=yaw;P.g.rotation.y=yaw;
  const ring=new T.Mesh(new T.RingGeometry(.5,.62,28),new T.MeshBasicMaterial({color:0xf5b82e,transparent:true,opacity:.85,toneMapped:false,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.04;P.g.add(ring);P.ring=ring;}""" + js[j:]
(root / 'src' / 'port.js').write_text(js, encoding='utf-8')
idx = (root / 'index.html').read_text(encoding='utf-8')
css = idx[idx.index('<style>'):idx.index('</style>') + len('</style>')]
head = (root / 'src' / 'train-head.html').read_text(encoding='utf-8').replace('Trace · Raat ki Gaadi', 'Trace · Akhri Jahaz')
body = (root / 'src' / 'train-body.html').read_text(encoding='utf-8').replace('Platform 4, raat 11:30…', 'Bandargah, raat 3 baje…')
(root / 'port.html').write_text(head + css + '\n' + body + js + '\n</script>\n</body>\n</html>\n', encoding='utf-8')
print('Built port.html')
