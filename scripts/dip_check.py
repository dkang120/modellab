#!/usr/bin/env python3
"""Auto-send the text buddy "dip check-in" when the S&P 500 (SPY) falls 5%, 10% or 20%
below its 52-week high.

Rules
- Reads data.json (spyDrawdown, written by update_data.py) and dip_state.json.
- Sends only when the drop reaches a deeper level than already sent in the current dip
  (5 -> 10 -> 20), and never more than once every 7 days.
- When SPY recovers to within 3% of its high, the dip is over and the levels reset.
- Needs the KLAVIYO_PRIVATE_KEY secret (scope: campaigns write). Without it, it only logs.
"""
import datetime as dt, json, os, sys, urllib.request, urllib.parse, urllib.error

LIST_ID = "Ybnjeu"  # ModelLab Text Buddy (SMS)
LEVELS = [20, 10, 5]
TEXTS = {
    5: "market's down 5% from the top. pretty normal tbh, happens most years. you good?",
    10: 'down 10% now. this is where people start googling "should i sell" \U0001F605 your plan > the headlines',
    20: "down 20%. ngl that's rough. stocks have fallen this far before and came back. see how holding played out: dkang120.github.io/modellab/tools/pain/",
}
RESET_ABOVE = -3.0
MIN_DAYS = 7

def load(path, default):
    try:
        return json.load(open(path))
    except Exception:
        return default

def decide(pct, state, today):
    """Return (level_to_send or None, new_state)."""
    state = dict(state)
    if pct > RESET_ABOVE:
        state["episodeLevel"] = 0
        return None, state
    hit = next((l for l in LEVELS if pct <= -l), None)
    if not hit or hit <= state.get("episodeLevel", 0):
        return None, state
    last = state.get("lastSent")
    if last and (today - dt.date.fromisoformat(last)).days < MIN_DAYS:
        return None, state
    return hit, state

def klaviyo(path, body, key):
    req = urllib.request.Request("https://a.klaviyo.com/api/" + path, data=json.dumps(body).encode(), method="POST",
        headers={"Authorization": "Klaviyo-API-Key " + key, "revision": "2024-10-15",
                 "Content-Type": "application/vnd.api+json", "Accept": "application/vnd.api+json"})
    return json.loads(urllib.request.urlopen(req, timeout=30).read().decode() or "{}")

def send(level, key, today):
    name = f"Text Buddy auto dip check-in -{level}% ({today.isoformat()})"
    camp = klaviyo("campaigns/", {"data": {"type": "campaign", "attributes": {
        "name": name,
        "audiences": {"included": [LIST_ID], "excluded": []},
        "send_strategy": {"method": "immediate"},
        "campaign-messages": {"data": [{"type": "campaign-message", "attributes": {
            "channel": "sms", "label": f"dip {level}%",
            "content": {"body": TEXTS[level]},
            "render_options": {"shorten_links": True, "add_org_prefix": True,
                               "add_info_link": False, "add_opt_out_language": False}}}]}}}}, key)
    cid = camp["data"]["id"]
    klaviyo("campaign-send-jobs/", {"data": {"type": "campaign-send-job", "id": cid}}, key)
    return cid

def main():
    data = load("data.json", {})
    dd = data.get("spyDrawdown")
    if not dd:
        print("dip check: no spyDrawdown in data.json, skipping")
        return 0
    today = dt.date.today()
    key = os.environ.get("KLAVIYO_PRIVATE_KEY", "")
    if key:
        try:
            req = urllib.request.Request("https://a.klaviyo.com/api/campaigns/?filter=" + urllib.parse.quote("equals(messages.channel,'sms')"),
                headers={"Authorization": "Klaviyo-API-Key " + key, "revision": "2024-10-15", "Accept": "application/vnd.api+json"})
            urllib.request.urlopen(req, timeout=30).read()
            print("dip check: Klaviyo key works")
        except urllib.error.HTTPError as e:
            print(f"dip check: Klaviyo key problem ({e.code}: {e.read().decode()[:300]})")
        except Exception as e:
            print(f"dip check: Klaviyo key problem ({e})")
    state = load("dip_state.json", {"episodeLevel": 0, "lastSent": None})
    level, state = decide(dd["pct"], state, today)
    print(f"dip check: SPY {dd['last']:.2f} vs 52w high {dd['high']:.2f} ({dd['highDate']}) = {dd['pct']}%")
    if level:
        if not key:
            print(f"dip check: would send the -{level}% text, but KLAVIYO_PRIVATE_KEY is not set")
            return 0
        cid = send(level, key, today)
        state.update(episodeLevel=level, lastSent=today.isoformat())
        print(f"dip check: sent -{level}% text (campaign {cid})")
    else:
        print(f"dip check: nothing to send (episode level {state.get('episodeLevel', 0)})")
    json.dump(state, open("dip_state.json", "w"), indent=1)
    return 0

if __name__ == "__main__":
    sys.exit(main())
