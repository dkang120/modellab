#!/usr/bin/env bash
# Builds the site into ./dist (plain static files)
set -euo pipefail
rm -rf dist && mkdir dist
cp source/index.html dist/index.html
cp source/tools.js dist/tools.js
cp data.json dist/data.json
cp history.json dist/history.json
echo "Built dist/"
