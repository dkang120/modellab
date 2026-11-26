# ModelLab design spec (modeled on joininyo.com)

Source of every number below: the reference site's published CSS and rendered layout, measured at 1440x900, 820x1100 and 390x845 on 2026-11-16. "Derived" means no direct equivalent exists in the reference, so the value is computed from measured tokens. Every derived or substituted value is listed under Deviations.

## 1. Tokens (measured)

| Token | Value | Where the reference uses it |
|---|---|---|
| ink | `#0a0a0a` | headline, logo, screen text, footer bg |
| soft | `#707070` | first headline line |
| muted | `#666666` | trust line under CTA |
| muted-2 | `#a3a3a8` | footer legal text |
| line | `#e9e9eb` | card border (inner pages) |
| bubble | `#dedee2` | gray ("inyo") message bubble |
| typing | `#e9e9ea` / dots `#8e8e93` | typing bubble |
| blue | `#7c4def` | reply bubble, ticket chip, focus ring |
| blue-soft | `#d9cbfb` | ticket chip sub-label |
| blue-deep | `#6a35e0` | inner-page primary (pill) |
| red | `#E51317` | heart stroke and dots |
| page | `#ffffff` landing, `#fcfcfc` inner pages | `--bg-main` |
| footer-line | `#38383b` | footer divider |
| scrim | `linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.58))` | card overlay |
| card-shadow | `0 12px 40px -24px rgba(0,0,0,.18)` | inner-page card |

Fonts (all OFL, self-hosted in `/fonts`): Open Sauce Sans 400/500 (headline, buttons, footer, nav), Inter 400/500/600 (screen text, bubbles, inner-page body), JetBrains Mono 400 (ticket chip), TikTok Sans 400 (chip sub-label).

## 2. Type scale (measured)

| Role | Font | Size / line / tracking | Color |
|---|---|---|---|
| Headline | Open Sauce 500 | 36 / 47.958 / -1.5px (x1.2222 = 44px at >=900 landscape) | ink; first line soft |
| Button | Open Sauce 500 | 18 / 24 / -0.3px | #fff on #000 |
| Trust line | Open Sauce 400 | 14 / 20 | muted |
| Footer link | Open Sauce 500 | 15 / 34 box / -0.2px | #fff |
| Footer legal | Open Sauce 400 | 14 / 22 | muted-2 |
| Bubble (small) | Inter 400 | 13.288 / 16, h32, pad 8x12, r16 | ink on bubble / #fff on blue |
| Bubble (message) | Inter 400 | 14 / 20, pad 8x16, r20, tail corner r8 | same |
| Card name | Inter 400 | 33.6 / 42 / -0.168px; age 25.2 at 60% | #fff |
| Card detail | Inter 400 | 14.7 / 18.9, icon 21px, gap 2.1 | #fff |
| Chip date | JetBrains Mono 400 | 13 / 14 | #fff |
| Chip label | JetBrains Mono 400 | 9 / 10, tracking .1em, caps | #fff |
| Inner-page h1 | Inter | clamp(26px,7vw,34px) / 1.15 / -.04em, lowercase | #1a1a1a |
| Eyebrow | Inter | 13px | #6b6b6b |

Voice: headlines, buttons and bubbles are lowercase in the reference; footer and trust line are sentence case. ModelLab follows this split with `text-transform`, so source text and tickers are unchanged.

## 3. Geometry (measured)

- Hero stage: 390x845 (portrait/mobile), 1440x900 (landscape >=900px). Scaled to fit: `min(w/390, h/845, 1.6)` and `min(w/1440, h/900)`.
- Logo 48x20.3 at left 23 (mobile) / 32 (desktop), top 37. Ticket chip 142x42 at right 23 / 32, top 24, notch radius 7, corner radius 6.
- Deck card 224.7x304.5, radius 16.8, left 83.109, top 186.323. Mid card: rotate -9.66deg, scale .95, opacity .8, white 35% cast. Scrim begins 126px down, 178.5px tall. Info inset 16.8.
- Message bubbles: gray rotate -6.59deg (tail bottom-left r8), blue rotate 6deg (tail bottom-right r8). Entry `rise-soft` .68s with an 8px bounce.
- Card exit: translate +-70px (x), 54px (y), rotate +-18deg, 614ms, fade 239ms after 375ms.
- Headline block top 600, width 350, gap 24. Button 56px tall, radius 16, full width of 350 (360 on desktop). Heart 49.2x43.7.
- Drift bubbles bob 3.15-3.9s ease-in-out, translate up to 4px, rotate under 0.5deg. Opacity .17-.42.
- Footer: padding 24 / 40 (>=640) / 64 80 56 (>=1024); inner max 1280; gap 32 / 40; link height 34, gap 24 / 32; social 32px radius 8, gap 16 / 20; divider `1px #38383b`, padding-top 32 / 40; legal gap 8; logo 76.8x85.98 / 96x107.5; radius `0 0 30px 30px` (0 on the landing).
- Inner card: max-width 420, padding 32x24, radius 28, border 1px line, shadow above, button padding 15x20 radius 999 weight 600.
- Focus ring: 2px blue, offset 3px.

## 4. ModelLab mapping

| ModelLab element | Reference pattern |
|---|---|
| Home hero | Full stage: drifting bubbles, card deck, two-line headline, black CTA, trust line |
| Bubble text | Gray = ModelLab states a fact ("-46.5%. worst fall since 1992."); blue = the reader reacts |
| Deck card | Model card: name, muted risk number, rows for risk and effort dots, tag as gray message bubble, family as blue bubble |
| Ticket chip | "Admit one" = free signup/tools pass; flips to "Tools / Free" |
| Heart | Same construction (2.886px round stroke + two dots, red), redrawn as a drawdown-and-recovery curve |
| Primary button | Black 56px radius 16 (landing and gates) |
| Small buttons | 40px, same radius, 15/500 (matches footer link type) |
| Chips and filters | Small bubbles: h32, r16; active = blue |
| Section headings | Two-tone headline pattern, centered |
| Panels | Inner-page card: white, 1px line, r28, shadow |
| Tints | Gray `#f1f1f3` (bubble at 45%), blue `#efe8fd` (blue-soft at 50%), red `#fdecec` (red at 8%) |
| Positive / user / primary series | blue |
| Negative / drawdown | red |
| Reference series, gridlines | muted-2 / bubble |
| Table and chart labels | JetBrains Mono 11px caps, tracking .1em (ticket micro-label style) |
| Footer | Reference footer, with ModelLab links, legal and price-data source |

## 5. Deviations (flagged)

1. The reference has no navigation bar. ModelLab has 5 destinations, so text links in the footer-link style (Open Sauce 15/500/-0.2) sit between logo and chip from 900px up; below 900px they form a scrolling row under the header.
2. The reference scales logo and chip with the stage; here they stay fixed-size.
3. Heart replaced by a drawdown curve (brand mark of the reference is not reused).
4. No photos (people photos are not reusable). Card background = holding weights as vertical color bands in blue/gray/ink.
5. Hover cursor followers (typing bubble, heart) and the headline typing animation are omitted. The drawing animation on the curve and all bob/flip/exit motion are kept; `prefers-reduced-motion` disables all of it.
6. The reference has no data tables, charts or forms. Their styles are derived: hairline `#e9e9eb`, 14/20 Inter, mono 11px labels, inputs 56px r16 border `#e9e9eb` with the blue focus ring.
7. Footer wordmark is longer ("modellab" vs "inyo"), so the footer logo is wider than 96px at the same height.
8. Footer rounding (30px) applies on inner pages only, as in the reference.
9. The reference's lowercase CSS is applied to headings, buttons, chips and bubbles only; financial disclaimers, tickers and data stay as written.

## Deviations added 2026-11-27 (audit pass)
No equivalent exists in the reference, so these are derived from existing tokens:
- **Lab-notebook grid paper** (`.nb`): 22px grid in `line` #e9e9eb on white, r28 like inner-page cards. Used on the Lab Drop sample, text buddy info, scenario mode.
- **Model glyph icon set** (`GLYPH`, 24px, 1.6px round stroke): one metaphor per model. In Library cards, Compare headers, scenario cards.
- **Tube meters** for risk/effort on Library cards (JetBrains Mono 9px label, 38×7 capsule).
- **Compare**: 3 models max (was 4), sticky header, rows tinted `#faf8ff` where models differ, stacked grid under 760px (no sideways scroll).
- **Contrast**: `muted2` text uses moved to `#75757a` (AA on white); Instagram-style tab label `#8e8e93` → `#6e6e73`.
- **Email popup**: no timer. Shows after value (halfway down a page, quiz result, Now what? plan, 20s on a model page) or desktop exit intent; never to text buddy subscribers.
