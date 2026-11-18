# Simulated user test

AI personas text the buddy using the same rulebook, model and cleanup as production. A judge then grades every conversation. No texts are sent and no Klaviyo credits are used.

- `RESEARCH.md`: the human-behavior research the personas are built from
- `personas.json`: 22 hand-written edge cases (panic, crisis, account numbers, jailbreaks...)
- `generate.mjs`: mixes the research into thousands of distinct people (`node simtest/generate.mjs 5` to preview)
- `run.mjs`: runs the conversations, grades them, and writes `report.md` plus a labeled `dataset.jsonl`
- `results/`: reports from past runs, and `ledger.json` with total spend

## Run it (from your phone)
Repo → **Actions** → **Simulated user test** → **Run workflow**.
1. Pilot: name `pilot`, total `30`, budget `3`
2. Main: name `main`, total `1500`, budget `3`. The budget is a cap across *all* runs, so the pilot's spend counts toward it.

Runs over 100 conversations use the batch API (half price). The report shows up on the run's summary page and is committed to `simtest/results/<name>/`.

Results are **simulated** and should always be described that way.
