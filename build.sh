#!/usr/bin/env bash
# Builds the site into ./dist (plain static files)
set -euo pipefail
rm -rf dist && mkdir dist
cp source/index.html dist/index.html
cp data.json dist/data.json
echo "Built dist/"
