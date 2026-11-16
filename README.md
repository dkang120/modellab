# ModelLab

Every investing model, built as a portfolio. Educational only, not investment advice.

## Layout
- `source/index.html`: the whole site (hash-routed, no build step for the app itself)
- `data.json`: price snapshot (the deploy job refreshes it before each build)
- `build.sh`: copies the site into `dist/`
- `scripts/update_data.py`: rebuilds `data.json` (untested against the live data source, see below)
- `.github/workflows/deploy.yml`: builds and publishes to GitHub Pages

## Preview locally
```bash
python3 -m http.server 8000
# open http://localhost:8000/source/index.html
```

## Email signup
Price snapshots and Compare unlock with a free email signup, sent to Klaviyo.
Set `SIGNUP.companyId` (public API key) and `SIGNUP.listId` near the top of the script in `source/index.html`.
The unlock is stored in the visitor's browser and is a soft gate: `data.json` is public.

## Publish on GitHub Pages
Repo → Settings → Pages → Source: **GitHub Actions**, then push to `main`.

## Notes
- `scripts/update_data.py` pulls daily closes from Stooq and has not been run against the live service yet. If it fails, the deploy still succeeds using the committed `data.json`.
- Prices are price-only snapshots (no dividends, fees or rebalancing). Allocations are hypothetical examples.
- Check your data source's terms before publishing quote data publicly.

## Tools and leaderboard

- `source/tools.js` holds the Match Quiz, Pain Simulator, Stress Test, Implement It, Overlap Checker, Build Your Own and Leaderboard.
- `scripts/build_history.py` builds `history.json` (long-run proxy series from the Kenneth French Data Library, FRED and an open gold dataset). Re-run it to refresh; commit the result.
- Leaderboard: without a backend it runs in local-only mode (saved in the browser, no fake users). To go live, create a Supabase project, run `supabase/schema.sql`, set `LB.url` and `LB.key` (anon key) at the top of `source/tools.js`, and add repo secrets `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`. The daily workflow then writes closing prices that the database uses to set entry prices, so users cannot choose their own.
