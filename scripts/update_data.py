#!/usr/bin/env python3
"""Rebuild data.json from free daily closes (Stooq CSV, no API key).
UNTESTED in the build sandbox (no outbound access); run once locally to verify.
Output schema matches data.json used by index.html."""
import csv, io, json, sys, urllib.request, datetime as dt

T = ["VTI","VXUS","BND","VTV","VBR","EFV","VUG","QQQ","VBK","SPY","BIL","QUAL","MOAT",
     "SCHD","VIG","VYM","MTUM","VLUE","USMV","TLT","GLD","IEF","DBC",
     "AMGN","NKE","CVX","IBM","MCD","HD","PG","MRK","UNH","KO"]

def daily(t):
    url = f"https://stooq.com/q/d/l/?s={t.lower()}.us&i=d"
    raw = urllib.request.urlopen(url, timeout=30).read().decode()
    rows = list(csv.DictReader(io.StringIO(raw)))
    return [(r["Date"], float(r["Close"])) for r in rows if r.get("Close")]

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
    out, last_date = {}, None
    for t in T:
        s = daily(t)
        last_date = max(last_date or s[-1][0], s[-1][0])
        d, last = s[-1]
        ld = dt.date.fromisoformat(d)
        out[t] = {
            "last": last,
            "d1": s[-2][1],
            "w1": on_or_before(s, (ld - dt.timedelta(days=7)).isoformat()),
            "m": [month_end(s, *ym) for ym in MONTHS(ld)],
        }
    ld = dt.date.fromisoformat(last_date)
    months = [f"{y}-{m:02d}" for y, m in MONTHS(ld)]
    data = {
        "asOf": f"{last_date}T21:00:00Z",
        "pulledAt": dt.datetime.utcnow().isoformat() + "Z",
        "session": "closed",
        "source": "Stooq daily closes",
        "priceBasis": "price return, excludes dividends",
        "months": months,
        "ytdIdx": months.index(f"{ld.year-1}-12"),
        "mtdIdx": len(months) - 1,
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
