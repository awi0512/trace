#!/bin/sh
# Deploys site/ to the Cloudflare Pages project "trace-game" (https://trace-game.pages.dev).
# The pages are embedded in a Pages _worker.js, so the deploy is a single API call and needs no
# separate asset upload. Needs CLOUDFLARE_ACCOUNT_ID, and CLOUDFLARE_API_TOKEN with "Cloudflare Pages: Edit"
# (inside a Claude cloud session the token is injected by the network proxy, so it can be left unset).
set -e
cd "$(dirname "$0")/.."
sh scripts/build-site.sh
: "${CLOUDFLARE_ACCOUNT_ID:?set CLOUDFLARE_ACCOUNT_ID}"
PROJECT="${CF_PAGES_PROJECT:-trace-game}"
TMP="$(mktemp -d)"
python3 - "$TMP/_worker.js" <<'PY'
import json, sys, pathlib
pages = {}
for f in sorted(pathlib.Path('site').glob('*.html')):
    pages['/' + f.name] = f.read_text(encoding='utf-8')
    if f.name != 'index.html':
        pages['/' + f.stem] = pages['/' + f.name]
pages['/'] = pages['/index.html']
src = 'const PAGES=%s;\n' % json.dumps(pages)
src += """export default{async fetch(req){const p=new URL(req.url).pathname;const body=PAGES[p];
  if(body!==undefined)return new Response(body,{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-cache'}});
  return new Response('Not found',{status:404,headers:{'content-type':'text/plain'}});}};
"""
open(sys.argv[1], 'w', encoding='utf-8').write(src)
PY
AUTH=""
[ -n "$CLOUDFLARE_API_TOKEN" ] && AUTH="Authorization: Bearer $CLOUDFLARE_API_TOKEN"
curl -sS -X POST ${AUTH:+-H "$AUTH"} \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT/deployments" \
  --form-string 'manifest={}' --form-string 'branch=main' \
  -F "_worker.js=@$TMP/_worker.js;type=application/javascript+module" \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('success:',d.get('success'),d.get('errors') or '');print((d.get('result') or {}).get('url',''))"
rm -rf "$TMP"
