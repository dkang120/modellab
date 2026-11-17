# ModelLab text buddy: SMS playbook

**Rulebook:** "How Gen Z Texts: Voice Study for the ModelLab Text Buddy" (https://claude.ai/artifact/JBBcwffoibsZcH1feXgQm2). Every text here follows it. If a text and the rulebook disagree, the rulebook wins.

## Fixed core (never changes)
1. lowercase always; caps only for a ticker or one hype word
2. no period at the end of a text; "!" rarely, "?" fine
3. under 160 characters (one SMS segment), 1 to 3 texts per burst
4. max 1 emoji by default, from: 👀 😅 😭 🔒 💪 🧪 (🔥 only for streaks). Never 👍 🙂 😂 🙏 ✅
5. own slang only: lock in, locked in, lowkey, real talk, ngl, tbh, fr, vibe
6. real numbers from history, no hype, never tell anyone to buy or sell a specific thing
7. calm in a crash; never match panic
8. never chase silence with "??"; at most one light check-in after 2 weeks of no reply

## Mirroring (what changes per user)
Klaviyo stores `buddy_energy` from the user's last reply:
- `high`: caps, "!!", stretched letters ("yesss") or 2+ emoji
- `low`: one-word reply ("k", "ok", "y")
- `normal`: anything else

Each template below has a **normal** version and a **high** version (one step below their energy). For `low`, send the normal version with no follow-up question.

Slang the user uses first (bet, say less, it's giving, valid) can be echoed back later. Klaviyo can't do this automatically, so it's reserved for the AI upgrade.

## Profile properties the site sends
| Property | Values |
|---|---|
| `buddy_goal` | monthly, panic, basics, model |
| `buddy_freq` | low (about 2 a month), weekly (about 4 a month) |
| `modellab_top_match` | model id from the Match Quiz, if taken |
| `buddy_consent_at` / `buddy_consent_text_v` | when they checked the consent box, and which wording |
| `buddy_energy` | high, normal, low (set from replies) |

Send window: 10am–8pm in the subscriber's time zone.

## 1. Welcome (right after signup)
- **1a:** `hey it's your modellab buddy 👋 you're locked in. i'll text when markets get wild + when a new model drops. reply STOP anytime`
- **1b (2 min later, by goal):**
  - panic: `quick q: what almost made you sell last time? one word is fine`
  - monthly: `what day do you get paid? i'll nudge you that day`
  - basics: `rate your investing knowledge 1-10. no judgment fr`
  - model: `took the match quiz yet? 2 min and i'll know your vibe: modellab.hidanielkang.com/tools/match/`

(👋 appears once, in the opener only.)

## 2. Lab Drop (weekly campaign, everyone)
- normal: `new drop 🧪 dogs of the dow: 10 high-yield dow stocks, reset once a year. see it: modellab.hidanielkang.com/models/dogs/`
- high: `NEW DROP 🧪 dogs of the dow just landed. 10 dow stocks, reset once a year: modellab.hidanielkang.com/models/dogs/`

Template: `new drop 🧪 {{ model }}: {{ one-line idea }}. see it: {{ link }}`

## 3. Market dip check-ins (S&P 500 down 5%+ from its high; max 1 a week)
| Drop | normal | high |
|---|---|---|
| 5% | `market's down 5% from the top. pretty normal tbh, happens most years. you good?` | `ok market's down 5% rn. totally normal, happens most years. you good?` |
| 10% | `down 10% now. this is where people start googling "should i sell" 😅 your plan > the headlines` | `down 10% 😅 real talk this is where people panic. your plan > the headlines` |
| 20% | `down 20%. ngl that's rough. {{ match }} has fallen further before and came back. still with me?` | `down 20%, not fun at all. {{ match }} has been here before and came back. still with me?` |

Replies:
- YES / GOOD / any calm reply: `that's the energy 🔒 i'll check back in a week`
- SELL / NO / panic words: `heard. before you do anything, see how holding vs selling played out last time: modellab.hidanielkang.com/tools/pain/` (no emoji, no jokes)

## 4. Monthly habit check (goal = monthly, payday or day 1)
`did you invest this month? reply Y or N`
- Y, normal: `let's go 🔥 that's {{ streak }} months in a row`
- Y, high: `LET'S GOOO 🔥 {{ streak }} months straight`
- N: `all good, even $20 counts. want a payday reminder?`

## 5. Re-engage (no reply or click in 45 days; once)
`still here 👀 want fewer texts? reply LESS. want out? reply STOP`

## Keywords
| Reply | Response |
|---|---|
| STOP | Klaviyo's standard opt-out confirmation, nothing else |
| HELP | `modellab buddy: free texts about investing habits. educational only, not advice. reply STOP to quit` |
| LESS | set `buddy_freq` = low, reply `got you, only when it matters from now on` |
| Y / N | section 4 |
| SELL | section 3 panic reply |

## Cost check
About 2–4 texts per person per month. Klaviyo's free plan includes 150 SMS credits a month (1 US text = 1 credit), roughly 40–75 subscribers. Every text above is plain text and under 160 characters.

## What's set up in Klaviyo (Nov 17, 2026)
- Sending number: toll-free +1 833-653-0604 (US + Canada), carrier registration in review.
- List: **ModelLab Text Buddy (SMS)** (id Ybnjeu). The site's text buddy signup subscribes phones here, separate from the email list.
- Flow: **Welcome** (RppiPm), **live**. 1a welcome, then 2 minutes later a 1b text picked by `buddy_goal`. The first text carries the "ModelLab:" prefix.
- Flow: **Now What? plan check-in** (WKYd6p), draft. Only for `buddy_source = modellab.now`. 14 days after signup, one text based on the first step in `now_plan` (emergency fund, card debt, park it, 401(k) match, or model auto-buy).
- Flow: **Re-engage at 45 days** (WiNVcU), draft. 45 days after signup, only if they never clicked or replied: section 5 text.
- Flow: **Lab Drop series** (QSmw8B), draft. Starts 7 days after signup, then one model every 2 weeks (13 drops, ~2 texts a month to stay inside the consent wording). No emoji, so each text stays 1 credit.
- Segment: **Text Buddy: goal = investing monthly** (Re3hUw).
- Campaign drafts: Lab Drop #1 dogs of the dow (one-off, optional now that the series flow exists); monthly habit check to segment Re3hUw (duplicate monthly).
- Keyword replies (HELP text, LESS, Y/N, SELL): set up by hand in Klaviyo, Settings > SMS > Keywords. No API for it.
- Account settings: org prefix "ModelLab", opt-out text "Text STOP to opt-out".

## Before the first send (in Klaviyo)
1. Settings → SMS: add a US sending number (toll-free is quickest) and finish carrier registration.
2. Segment on `buddy_source = modellab.text`; confirm consent status before the first send.
3. Build flows 1, 3, 4, 5 and the keyword replies as flows; send the Lab Drop as a weekly campaign.
4. Re-check the slang and emoji lists against the rulebook every quarter.

## Email (redesigned Nov 17, 2026)
- **ModelLab Welcome** (WxP5LZ) and **Weekly Series, 13 weeks** (UMtJqn): live, automatic, new Gen Z design (gradient, chat bubbles, @model profiles) with a text buddy block in every email. Subjects: `new drop 🧪 @model: hook`.

## Market dip texts (automatic, since Nov 17, 2026)
- The daily price job (weekdays 2:30pm PT) checks SPY against its 52-week closing high (`scripts/dip_check.py`).
- At -5%, -10% or -20% it creates and sends an SMS campaign to the whole Text Buddy list via the Klaviyo API (`KLAVIYO_PRIVATE_KEY` GitHub secret).
- Max one dip text every 7 days, only when a deeper level is hit, and levels reset once SPY is back within 3% of its high. State lives in `dip_state.json`.
- Nov 17, 2026: SPY was -5.02%; -5% was marked handled on purpose, so the first text goes out at -10%.
- Test without sending: run the workflow manually with `dip_test` = true (creates a draft, then delete it in Klaviyo).

## AI text buddy (live 2026-11-17)
- Code: `buddy/` (Cloudflare Worker `modellab`, https://modellab.kangd4u.workers.dev). Auto-deploys from GitHub on every push touching `buddy/`.
- Voice: `buddy/src/prompt.js` = the Gen Z rulebook doc turned into instructions. Model: Claude Haiku 5.5, thinking off.
- Klaviyo: inbound text (Sent Text Message TD8d8Y) -> flow VHZ872 webhook -> worker -> "Buddy Reply" event -> flow XVHM2i texts `{{ event.reply }}`.
- Alerts: "Buddy Needs Human" -> flow Y5jhzu, "Buddy Budget Alert" -> flow XuUv9J (email to Daniel, template UV3ypD).
- Caps (wrangler.toml): 80 AI credits/month, 6 replies per person/month, one "maxed out" note, 80% alert.
- Secrets live in Cloudflare only: ANTHROPIC_API_KEY, KLAVIYO_BUDDY_KEY, BUDDY_SECRET.
- Check usage: GET /status with header x-buddy-secret.
