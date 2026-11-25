# ModelLab — project brief for Claude Code

ModelLab is Daniel Kang's beginner investing site: every well-known investing philosophy built as an example portfolio, plus an SMS "text buddy" that is the core of the product. Everything on the site is a tool that leads to the text buddy. Live at https://modellab.hidanielkang.com (GitHub Pages; old dkang120.github.io/modellab redirects).

Daniel is not a developer. Explain changes in plain words, don't assume he can read code, and keep replies short.

## Layout
| Path | What it is |
|---|---|
| `source/index.html` | The whole site, hash-routed, no framework |
| `source/tools.js` | Match Quiz, Pain Simulator, Stress Test, Implement It, Overlap Checker, Build Your Own, Leaderboard |
| `source/style.css`, `motion.js`, `seo.js` | Styles, animation, SEO/pages |
| `build.sh` → `dist/` | Copies the site, runs `scripts/build_pages.mjs`, adds cache-busting hashes |
| `data.json`, `history.json`, `drops.json`, `dip_state.json` | Data files; the daily workflow refreshes prices and commits them as `modellab-bot` |
| `scripts/` | `update_data.py` (prices), `build_history.py`, `dip_check.py` (Klaviyo dip campaign), `push_prices.py` (Supabase leaderboard prices), `build_pages.mjs` |
| `buddy/` | The AI text buddy: a Cloudflare Worker (`src/index.js`, persona in `src/prompt.js`, config in `wrangler.toml`). Twilio for live texts, Klaviyo for email/profiles, Stripe for the $4.99/mo Pro plan, Claude API for replies |
| `simtest/` | Simulated-user test of the buddy (AI personas + judge). Results are simulated and must be described that way |
| `supabase/schema.sql` | Leaderboard database |
| `.github/workflows/` | `deploy.yml` (weekdays after US close + on push: refresh data, dip check, push prices, build, deploy Pages), `simtest.yml` (manual) |
| `DESIGN.md` | Measured design spec. Follow it exactly; list any deviation |
| `SMS_PLAYBOOK.md` | Rules for every text the buddy sends |

## Run and ship
- Preview: `python3 -m http.server 8000`, then open http://localhost:8000/source/index.html
- Build check: `./build.sh` must finish with "Built dist/"
- Site deploys: push to `main` → GitHub Actions publishes Pages
- Buddy deploys: push to `main` → Cloudflare Workers Builds runs `npx wrangler deploy` from `buddy/`
- Before pushing, run `git pull --rebase` first: the bot commits data refreshes to `main` most weekdays

## Rules
1. **Not investment advice.** Never tell anyone to buy or sell a specific security, on the site or in buddy texts. Models are rule-based or industry-standard, never hand-picked.
2. **No model count in copy** (no "12 models"); models get added weekly as Lab Drops.
3. **Design:** match `DESIGN.md` measurements exactly; Gen Z / social-native feel; Tools section keeps blue `#4c90f7` (Tools hub cards and quiz hover are purple). Flag every deviation.
4. **Buddy voice:** buddy first, tool second. Follow `SMS_PLAYBOOK.md` and its rulebook (lowercase, no end periods, under 160 chars, approved emoji only, calm in a crash, never salesy).
5. **Secrets never go in the repo.** Keys live in Cloudflare (buddy), GitHub repo secrets (workflows) and Supabase. `wrangler.toml` holds only non-secret vars.
6. **Ask Daniel first** before anything that spends money or reaches real people: changing prices/plans or Stripe, raising API or SMS caps, sending Klaviyo campaigns or texts, running a paid simtest, or emailing outreach. Outreach goes only to outside communities (clubs, newsletters), never friends or family.
7. Keep the homepage short. The key funnel pages are the Library, the Match Quiz and "Now what?".

## Second opinion with Codex
This repo enables OpenAI's Codex plugin (see `.claude/settings.json`). After any non-trivial change, run `/codex:review` on the uncommitted changes and fix what it finds before committing. Use `/codex:adversarial-review` for risky changes (payments, buddy limits, anything touching texts sent to users). Codex usage counts against Daniel's ChatGPT/Codex limits, not Claude's.
