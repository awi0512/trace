#!/bin/sh
# Builds the static website version of TRACE into site/ (for Cloudflare Pages, GitHub Pages, itch.io).
# index.html is authored as a page fragment (for the Claude artifact host), so it is wrapped in a full
# HTML document with a mobile viewport here. cab.html is already a full document and is copied as is.
set -e
cd "$(dirname "$0")/.."
python3 scripts/assemble-train.py
python3 scripts/assemble-bus.py
rm -rf site && mkdir -p site
{
  printf '<!doctype html>\n<html lang="hi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n'
  cat index.html
  printf '\n</body>\n</html>\n'
} > site/index.html
cp cab.html site/cab.html
cp train.html site/train.html
cp bus.html site/bus.html
echo "Built site/ ($(wc -c < site/index.html) bytes index.html)"
