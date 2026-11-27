#!/usr/bin/env bash
# Builds the site into ./dist (plain static files)
set -euo pipefail
rm -rf dist && mkdir dist
cp source/index.html source/style.css source/tools.js source/seo.js source/motion.js dist/
cp source/og.png source/favicon.svg source/favicon.ico source/apple-touch-icon.png source/icon-192.png source/icon-512.png source/site.webmanifest source/404.html dist/
cp -r source/fonts dist/fonts
cp data.json dist/data.json
cp history.json dist/history.json

node scripts/build_pages.mjs

# Cache-bust: tag CSS/JS with a content hash so browsers load the new files after each deploy
node scripts/cache_bust.mjs
echo "Built dist/"
