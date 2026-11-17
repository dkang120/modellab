#!/usr/bin/env python3
"""Rebuild data.json from free daily closes (no API key).
Tries Yahoo Finance first, then Stooq. Tickers that fail keep their previous values.
Output schema matches data.json used by index.html."""
import csv, io, json, sys, urllib.request, datetime as dt

T = ["VTI","VXUS","BND","VTV","VBR","EFV","VUG","QQQ","VBK","SPY","BIL","QUAL","MOAT",
     "SCHD","VIG","VYM","MTUM","VLUE","USMV","TLT","GLD","IEF","DBC",
     "AMGN","NKE","CVX","IBM","MCD","HD","PG","MRK","UNH","KO"]

UA = {"User-Agent": "Mozilla/5.0 (ModelLab price refresh; +https://dkang120.github.io/modellab/)"}

def _get(url):
    req = urllib.request.Request(url, headers=UA)
    return urllib.request.urlopen(req, timeout=30).read().decode()

def daily_yahoo(t):
    """Daily closes (price only, not dividend-adjusted) for ~11 years from Yahoo's chart API."""
    j = json.loads(_get(f"https://query1.finance.yahoo.com/v8/finance/chart/{t}?range=11y&interval=1d&includePrePost=false"))
    r = j["chart"]["result"][0]
    ts, closes = r["timestamp"], r["indicators"]["quote"][0]["close"]
    out = [(dt.datetime.utcfromtimestamp(a).date().isoformat(), float(c)) for a, c in zip(ts, closes) if c is not None]
    # Drop today's unfinished bar if the market is still open
    meta = r.get("meta", {})
    if meta.get("currentTradingPeriod", {}).get("regular", {}).get("end", 0) > dt.datetime.utcnow().timestamp() and len(out) > 1:
        if out[-1][0] == dt.datetime.utcnow().date().isoformat():
            out = out[:-1]
    return out

def daily_stooq(t):
    raw = _get(f"https://stooq.com/q/d/l/?s={t.lower()}.us&i=d")
    rows = list(csv.DictReader(io.StringIO(raw)))
    return [(r["Date"], float(r["Close"])) for r in rows if r.get("Close")]

SRC = {"yahoo": 0, "stooq": 0}
def daily(t):
    for name, fn in (("yahoo", daily_yahoo), ("stooq", daily_stooq)):
        try:
            s = fn(t)
            if len(s) > 300:
                SRC[name] += 1
                return s
        except Exception as e:
            print(f"  {t}: {name} failed ({e})", file=sys.stderr)
    return None

def on_or_before(series, day):
    best = None
    for d, c in series:
        if d <= day: best = c
        else: break
    return best

def month_end(series, y, m):
    nxt = dt.date(y + (m == 12), (m % 12) + 1, 1)
    return on_or_before(series, (nxt - dt.timedelta(days=1)).isoformat())

def main():
    try:
        prev = json.load(open("data.json"))["tickers"]
    except Exception:
        prev = {}
    out, last_date, missing = {}, None, []
    for t in T:
        s = daily(t)
        if not s:
            missing.append(t)
            continue
        last_date = max(last_date or s[-1][0], s[-1][0])
        d, last = s[-1]
        ld = dt.date.fromisoformat(d)
        out[t] = {
            "last": last,
            "d1": s[-2][1],
            "w1": on_or_before(s, (ld - dt.timedelta(days=7)).isoformat()),
            "m": [month_end(s, *ym) for ym in MONTHS(ld)],
            "y5": month_end(s, ld.year - 5, ld.month),
            "y10": month_end(s, ld.year - 10, ld.month),
        }
    if last_date is None or len(missing) > len(T) // 3:
        print("too many tickers failed, keeping the old data.json:", missing)
        return 1
    for t in missing:
        if t in prev:
            out[t] = prev[t]
    ld = dt.date.fromisoformat(last_date)
    months = [f"{y}-{m:02d}" for y, m in MONTHS(ld)]
    data = {
        "asOf": f"{last_date}T21:00:00Z",
        "pulledAt": dt.datetime.utcnow().isoformat() + "Z",
        "session": "closed",
        "source": ("Yahoo Finance" if SRC["yahoo"] >= SRC["stooq"] else "Stooq") + " daily closes, refreshed every weekday after the US close",
        "priceBasis": "price return, excludes dividends",
        "months": months,
        "ytdIdx": months.index(f"{ld.year-1}-12"),
        "mtdIdx": len(months) - 1,
        "longBase": {"y5": f"{ld.year-5}-{ld.month:02d}", "y10": f"{ld.year-10}-{ld.month:02d}"},
        "tickers": out,
    }
    json.dump(data, open("data.json", "w"), separators=(",", ":"))
    print("wrote data.json as of", last_date)

def MONTHS(ld):
    """Month-ends from same month last year through the month before ld (13 values)."""
    y, m = ld.year - 1, ld.month
    res = []
    for _ in range(13):
        res.append((y, m))
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)
    return res

if __name__ == "__main__":
    sys.exit(main())
