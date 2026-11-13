#!/usr/bin/env bash
# Builds the password-protected site into ./dist
# Usage: MODELLAB_PASSWORD='your-password' ./build.sh
set -euo pipefail
: "${MODELLAB_PASSWORD:?Set MODELLAB_PASSWORD first}"
rm -rf dist && mkdir dist
npx --yes staticrypt@3 source/index.html \
  -p "$MODELLAB_PASSWORD" --short -c false --salt 6d6f64656c6c61622d73616c742d3031 -d dist \
  -t gate/template.html \
  --template-title "Enter the password" \
  --template-instructions "ModelLab is a private preview. Enter the password to view the site." \
  --template-placeholder "Password" \
  --template-button "Enter site →" \
  --template-error "Wrong password. Try again." \
  --template-toggle-show "Show password" --template-toggle-hide "Hide password" \
  --remember 30
cp data.json dist/data.json
echo "Built dist/ (index.html is encrypted, data.json is public)"
