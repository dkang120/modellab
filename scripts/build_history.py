#!/usr/bin/env python3
"""Build history.json: long-run MONTHLY total-return proxies for every ticker ModelLab uses.

Why proxies: most ETFs only started trading in the 2000s-2010s, which hides 1973-74, 2000-02 and 2008.
Instead we map each ticker to an openly published academic or government series with a much longer record:
  * Equity styles .... Kenneth French Data Library (value-weighted, total return, CRSP)
  * International .... French Developed ex-US factors and portfolios (from 1990)
  * Treasuries ....... estimated from FRED constant-maturity yields (duration/convexity approximation)
  * Cash ............. FRED 3-month T-bill rate
  * Gold ............. datasets/gold-prices monthly price (price only)
  * Commodities ...... IMF all-commodity price index via FRED (price only)

Everything is a PROXY, not the fund's own return. The site says so on every page that uses it.
Run:  python3 scripts/build_history.py   (stdlib only; needs internet)
"""
import csv, io, json, re, sys, urllib.request, zipfile, datetime as dt

FF = "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/%s_CSV.zip"
FRED = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=%s"
GOLD = "https://raw.githubusercontent.com/datasets/gold-prices/main/data/monthly.csv"


def get(url):
    return urllib.request.urlopen(url, timeout=60).read()


def french(name, col=None, block=r"Value Weight"):
    """Return {YYYY-MM: {column: pct}} for the first monthly value-weighted block of a French file."""
    z = zipfile.ZipFile(io.BytesIO(get(FF % name)))
    text = z.read(z.namelist()[0]).decode("latin-1").splitlines()
    i = 0
    if block:
        while i < len(text) and not (re.search(block, text[i]) and "Monthly" in text[i]):
            i += 1
    while i < len(text) and not text[i].lstrip().startswith(","):
        i += 1
    head = [h.strip() for h in text[i].split(",")][1:]
    out = {}
    for line in text[i + 1:]:
        p = [x.strip() for x in line.split(",")]
        if not re.fullmatch(r"\d{6}", p[0] or ""):
            break
        ym = p[0][:4] + "-" + p[0][4:]
        row = {}
        for h, v in zip(head, p[1:]):
            try:
                f = float(v)
            except ValueError:
                continue
            if f > -99:
                row[h] = f
        out[ym] = row
    return out


def fred(series):
    rows = list(csv.reader(io.StringIO(get(FRED % series).decode())))[1:]
    return {r[0][:7]: float(r[1]) for r in rows if len(r) > 1 and r[1] not in ("", ".")}


def bond_returns(y, maturity):
    """Monthly total return (%) of a constant-maturity par Treasury from yields (in %).
    carry = prior yield / 12;  price change = -D*dy + 0.5*C*dy^2 (D, C of a par bond)."""
    keys = sorted(y)
    out = {}
    for a, b in zip(keys, keys[1:]):
        y0, y1 = y[a] / 100, y[b] / 100
        if y0 <= 0:
            continue
        v = (1 + y0 / 2) ** (-2 * maturity)
        D = (1 - v) / y0                                                # modified duration of a par bond
        C = 2 * (1 - v) / y0 ** 2 - 2 * maturity * v / (y0 * (1 + y0 / 2))  # convexity of a par bond
        dy = y1 - y0
        out[b] = (y0 / 12 - D * dy + 0.5 * C * dy * dy) * 100
    return out


def pct_change(series):
    keys = sorted(series)
    return {b: (series[b] / series[a] - 1) * 100 for a, b in zip(keys, keys[1:]) if series[a]}


def main():
    ff3 = french("F-F_Research_Data_Factors", block=None)
    mkt = {k: v["Mkt-RF"] + v["RF"] for k, v in ff3.items()}
    s6 = french("6_Portfolios_2x3")
    mom6 = french("6_Portfolios_ME_Prior_12_2")
    op = french("Portfolios_Formed_on_OP")
    dp = french("Portfolios_Formed_on_D-P")
    beta = french("Portfolios_Formed_on_BETA")
    xus3 = french("Developed_ex_US_3_Factors", block=None)
    xus6 = french("Developed_ex_US_6_Portfolios_ME_BE-ME")
    gold = {}
    for r in csv.DictReader(io.StringIO(get(GOLD).decode())):
        gold[r["Date"][:7]] = float(r["Price"])
    cmdty = fred("PALLFNFINDEXM")
    tb3 = fred("TB3MS")

    pick = lambda d, c: {k: v[c] for k, v in d.items() if c in v}
    P = {}
    def add(pid, name, desc, src, series, start=None):
        P[pid] = dict(name=name, desc=desc, src=src, s=series, start=start)

    add("MKT", "US total stock market", "CRSP US market return plus T-bill rate", "French Data Library", mkt)
    add("LV", "US large-cap value", "Large stocks, highest book-to-market 30%", "French Data Library", pick(s6, "BIG HiBM"))
    add("SV", "US small-cap value", "Small stocks, highest book-to-market 30%", "French Data Library", pick(s6, "SMALL HiBM"))
    add("LG", "US large-cap growth", "Large stocks, lowest book-to-market 30%", "French Data Library", pick(s6, "BIG LoBM"))
    add("SG", "US small-cap growth", "Small stocks, lowest book-to-market 30%", "French Data Library", pick(s6, "SMALL LoBM"))
    add("LB", "US large-cap blend", "Large stocks, middle book-to-market 40%", "French Data Library", pick(s6, "ME2 BM2"))
    add("MOM", "US large-cap momentum", "Large stocks, highest prior 12-2 month return 30%", "French Data Library", pick(mom6, "BIG HiPRIOR"))
    add("QLTY", "US high profitability", "Stocks with highest operating profitability 30%", "French Data Library", pick(op, "Hi 30"))
    add("DIV", "US high dividend yield", "Stocks with highest dividend yield 30%", "French Data Library", pick(dp, "Hi 30"))
    add("DIVG", "US moderate dividend yield", "Stocks with middle dividend yield 40%", "French Data Library", pick(dp, "Med 40"))
    add("LOVOL", "US low beta", "Stocks with lowest market beta 20%", "French Data Library", pick(beta, "Lo 20"))
    add("INTL", "International developed stocks", "Developed markets excluding US, market return plus T-bill", "French Data Library", {k: v["Mkt-RF"] + v["RF"] for k, v in xus3.items()})
    add("INTLV", "International value", "Developed ex-US large stocks, highest book-to-market 30%", "French Data Library", pick(xus6, "BIG HiBM"))
    add("B5", "Core bonds", "Estimated from the 5-year Treasury yield, duration set near 6 like a broad bond fund", "FRED GS5 (estimate)", bond_returns(fred("GS5"), 7))
    add("B7", "Intermediate Treasuries", "Estimated from the 7-year Treasury yield, duration set near 7", "FRED GS7 (estimate)", bond_returns(fred("GS7"), 8.5))
    add("B20", "Long Treasuries", "Estimated from the 20-year Treasury yield (30-year where the 20-year was discontinued, 1987-93 and 2002-06), duration set near 16 like a long-bond fund", "FRED GS20/GS30 (estimate)", bond_returns({**fred("GS30"), **fred("GS20")}, 27))
    add("CASH", "Treasury bills", "3-month T-bill rate, monthly", "FRED TB3MS", {k: v / 12 for k, v in tb3.items()})
    g = {k: v for k, v in pct_change(gold).items() if k >= "1971-02"}
    add("GOLD", "Gold", "Gold price change (price only; fixed-price era excluded)", "datasets/gold-prices", g)
    add("CMDTY", "Commodities", "IMF all-commodity price index (price only)", "FRED PALLFNFINDEXM", pct_change(cmdty))

    last = min(max(p["s"]) for p in P.values())
    first = "1926-07"
    y, m = 1926, 7
    months = []
    while f"{y}-{m:02d}" <= last:
        months.append(f"{y}-{m:02d}")
        y, m = (y + 1, 1) if m == 12 else (y, m + 1)

    out = {"builtAt": dt.datetime.now(dt.timezone.utc).replace(tzinfo=None).isoformat() + "Z", "first": first, "last": last, "n": len(months), "proxies": {}}
    for pid, p in P.items():
        arr = [None if mo not in p["s"] else round(p["s"][mo], 2) for mo in months]
        st = next((i for i, v in enumerate(arr) if v is not None), None)
        out["proxies"][pid] = {"name": p["name"], "desc": p["desc"], "src": p["src"], "start": st, "r": arr[st:] if st is not None else []}
        print(f"{pid:6s} {months[st]} .. {last}  n={len(arr) - st}")

    # ticker -> proxy. Individual stocks cannot be rebuilt from public data, so they map to a style proxy.
    tmap = {"VTI": "MKT", "SPY": "MKT", "VXUS": "INTL", "BND": "B5", "VTV": "LV", "VBR": "SV", "EFV": "INTLV", "VUG": "LG",
            "QQQ": "LG", "VBK": "SG", "BIL": "CASH", "QUAL": "QLTY", "MOAT": "QLTY", "SCHD": "DIV", "VIG": "DIVG", "VYM": "DIV",
            "MTUM": "MOM", "VLUE": "LV", "USMV": "LOVOL", "TLT": "B20", "GLD": "GOLD", "IEF": "B7", "DBC": "CMDTY",
            "12 to 20 names": "LB", "Stock picks": "MKT", "Themes": "MKT"}
    for t in ["NKE", "CVX", "IBM", "MCD", "HD", "PG", "MRK", "UNH", "KO", "AMGN"]:
        tmap[t] = "DIV"
    out["map"] = tmap
    json.dump(out, open("history.json", "w"), separators=(",", ":"))
    print("wrote history.json", len(json.dumps(out)) // 1024, "KB")


if __name__ == "__main__":
    sys.exit(main())
