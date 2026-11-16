#!/usr/bin/env python3
"""Copy latest closes from data.json into Supabase price_snapshots (service role). Skips if secrets are unset."""
import json, os, sys, urllib.request
url, key = os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_KEY")
if not url or not key:
    print("SUPABASE_URL / SUPABASE_SERVICE_KEY not set; skipping"); sys.exit(0)
d = json.load(open(os.path.join(os.path.dirname(__file__), "..", "data.json")))
asof = d["asOf"][:10]
rows = [{"ticker": t, "price": v["last"], "as_of": asof} for t, v in d["tickers"].items() if v.get("last")]
req = urllib.request.Request(url.rstrip("/") + "/rest/v1/price_snapshots?on_conflict=ticker", data=json.dumps(rows).encode(), method="POST",
    headers={"apikey": key, "Authorization": "Bearer " + key, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=minimal"})
print("pushed", len(rows), "prices:", urllib.request.urlopen(req, timeout=30).status)
