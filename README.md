# ModelLab

Every investing model, built as a portfolio. Educational only, not investment advice.

## Layout
- `source/index.html`: the whole site (hash-routed, no build step for the app itself)
- `data.json`: price snapshot (the deploy job refreshes it before each build)
- `gate/template.html`: the password page
- `build.sh`: encrypts the site into `dist/` with StatiCrypt
- `scripts/update_data.py`: rebuilds `data.json` (untested against the live data source, see below)
- `.github/workflows/deploy.yml`: builds and publishes to GitHub Pages

## Preview locally
```bash
python3 -m http.server 8000
# open http://localhost:8000/source/index.html
```

## Build the locked site
```bash
MODELLAB_PASSWORD='choose-a-password' ./build.sh
# then serve dist/
```

## Publish on GitHub Pages
1. Repo → Settings → Pages → Source: **GitHub Actions**
2. Repo → Settings → Secrets and variables → Actions → new secret `MODELLAB_PASSWORD`
3. Push to `main`. The workflow builds and deploys.

## Notes
- The password gate is a light lock: the page is encrypted in the browser, but `data.json` is public, and if this repo is public the unencrypted `source/` is readable. Use a private repo if that matters.
- `scripts/update_data.py` pulls daily closes from Stooq and has not been run against the live service yet. If it fails, the deploy still succeeds using the committed `data.json`.
- Prices are price-only snapshots (no dividends, fees or rebalancing). Allocations are hypothetical examples.
