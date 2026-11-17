#!/usr/bin/env bash
# Builds the site into ./dist (plain static files)
set -euo pipefail
rm -rf dist && mkdir dist
cp source/index.html source/style.css source/tools.js source/seo.js dist/
cp source/og.png dist/
cp -r source/fonts dist/fonts
cp data.json dist/data.json
cp history.json dist/history.json

node scripts/build_pages.mjs

# Cache-bust: tag CSS/JS with a content hash so browsers load the new files after each deploy
V=$(cat source/style.css source/tools.js source/seo.js | sha1sum | cut -c1-8)
find dist -name '*.html' -print0 | xargs -0 sed -i -e "s#href=\"style.css\"#href=\"style.css?v=$V\"#" -e "s#src=\"tools.js\"#src=\"tools.js?v=$V\"#" -e "s#src=\"seo.js\"#src=\"seo.js?v=$V\"#"
echo "Built dist/"
