"""Charts for the interest-rate storyline: the Fed's rate, inflation and unemployment from 1955 up to
the month of the story (nothing later), on a time axis that always spans the whole game.
charts.py <rateset.json> : writes web/static/news/<arc>/<month>-rates.png for each entry."""
import sys, os, json, csv
from PIL import Image, ImageDraw, ImageFont

ROOT = r"C:\Users\luziu\Documents\GitHub\marketsim"
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]


def series(name):
    out = {}
    with open(os.path.join(ROOT, "data", "raw", "fred", name + ".csv"), encoding="utf-8") as f:
        rows = list(csv.reader(f))[1:]
    for d, v in rows:
        if v and v != ".":
            out[d[:7]] = float(v)
    return out


def idx(m):
    return int(m[:4]) * 12 + int(m[5:7]) - 1


def mon(i):
    return f"{i // 12}-{i % 12 + 1:02d}"


ff, cpi, un = series("FEDFUNDS"), series("CPIAUCSL"), series("UNRATE")
infl = {m: (cpi[m] / cpi[mon(idx(m) - 12)] - 1) * 100 for m in cpi if mon(idx(m) - 12) in cpi}

W, H = 1400, 800
L_, R_, T_, B_ = 90, 40, 110, 70
X0, X1 = idx("1955-01"), idx("2026-12")
YMAX = 20.0


def font(size, bold=False):
    for name in (["arialbd.ttf", "segoeuib.ttf"] if bold else ["arial.ttf", "segoeui.ttf"]):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


def px(i):
    return L_ + (i - X0) / (X1 - X0) * (W - L_ - R_)


def py(v):
    return H - B_ - max(-1.0, min(YMAX, v)) / YMAX * (H - T_ - B_) if v >= 0 else H - B_ + (-v) / YMAX * (H - T_ - B_)


def chart(month, path):
    img = Image.new("RGB", (W, H), "#f7f3e8")
    d = ImageDraw.Draw(img)
    last = idx(month)
    label = f"{MONTHS[int(month[5:7]) - 1]} {month[:4]}"
    d.text((L_, 28), "The Fed's interest rate, inflation and unemployment", font=font(34, True), fill="#1c1a16")
    d.text((L_, 72), f"United States, percent, 1955 to {label}", font=font(22), fill="#5a564c")
    for v in range(0, 21, 5):
        y = py(v)
        d.line((L_, y, W - R_, y), fill="#d8d2c2", width=1)
        d.text((L_ - 14, y), f"{v}%", font=font(20), fill="#5a564c", anchor="rm")
    for year in range(1955, 2027, 10):
        x = px(idx(f"{year}-01"))
        d.line((x, H - B_, x, H - B_ + 8), fill="#5a564c", width=1)
        d.text((x, H - B_ + 14), str(year), font=font(20), fill="#5a564c", anchor="mt")
    d.line((L_, H - B_, W - R_, H - B_), fill="#2a2722", width=2)
    # the part of the time axis that has not happened yet
    d.rectangle((px(last) + 1, T_, W - R_, H - B_ - 1), fill="#efe9d8")
    for data, colour, width in ((un, "#8a8577", 3), (infl, "#c0392b", 3), (ff, "#1f4e9c", 6)):
        pts = [(px(i), py(data[mon(i)])) for i in range(X0, last + 1) if mon(i) in data]
        if len(pts) > 1:
            d.line(pts, fill=colour, width=width, joint="curve")
    # legend with the latest values
    lx, ly = W - R_ - 420, T_ + 14
    rows = [("The Fed's interest rate", ff, "#1f4e9c"), ("Inflation (prices against a year before)", infl, "#c0392b"), ("Unemployment", un, "#8a8577")]
    d.rectangle((lx - 16, ly - 10, W - R_ - 6, ly + 34 * len(rows) + 4), fill="#f7f3e8", outline="#d8d2c2")
    for n, (name, data, colour) in enumerate(rows):
        y = ly + 34 * n + 12
        d.line((lx, y, lx + 34, y), fill=colour, width=6 if n == 0 else 3)
        d.text((lx + 46, y), name, font=font(19), fill="#1c1a16", anchor="lm")
    x = px(last)
    d.line((x, T_, x, H - B_), fill="#1c1a16", width=1)
    if month in ff:
        d.ellipse((x - 8, py(ff[month]) - 8, x + 8, py(ff[month]) + 8), fill="#1f4e9c", outline="#f7f3e8", width=2)
        side = "rm" if x > W - 260 else "lm"
        d.text((x + (-14 if side == "rm" else 14), py(ff[month]) - 22), f"{ff[month]:.1f}%", font=font(26, True), fill="#1f4e9c", anchor=side)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, optimize=True)


todo = json.load(open(sys.argv[1], encoding="utf-8"))
for e in todo:
    rel = f"news/{e['arc']}/{e['month']}-rates-chart.png"
    chart(e["month"], os.path.join(ROOT, "web", "static", *rel.split("/")))
    e["file"] = rel
json.dump(todo, open(sys.argv[1], "w", encoding="utf-8"), indent=1)
print("charts", len(todo))
