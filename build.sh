#!/usr/bin/env bash
# Builds the site into ./dist (plain static files)
set -euo pipefail
rm -rf dist && mkdir dist
cp source/index.html source/style.css source/tools.js dist/
cp -r source/fonts dist/fonts
cp data.json dist/data.json
cp history.json dist/history.json
echo "Built dist/"
