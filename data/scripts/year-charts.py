"""Charts for the "YYYY in review" stories: the S&P 500 at each month end of that year, from the
December before to the December of the year. year-charts.py <year> ... writes
web/static/news/markets/<year>-12-year-chart.png and prints the year's change."""
import sys, os, json
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
rows = {r["month"]: r["price"] for r in json.load(open(os.path.join(ROOT, "data", "reference", "sp500.json"), encoding="utf-8"))["rows"]}
W, H = 1400, 800
L_, R_, T_, B_ = 110, 60, 120, 80
LETTERS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def font(size, bold=False):
    for name in (["arialbd.ttf", "segoeuib.ttf"] if bold else ["arial.ttf", "segoeui.ttf"]):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


def nice(lo, hi):
    span = hi - lo
    step = next(s for s in (1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000) if span / s <= 6)
    a = int(lo // step) * step
    b = (int(hi // step) + 1) * step
    return a, b, step


def chart(year):
    months = [f"{year - 1}-12"] + [f"{year}-{m:02d}" for m in range(1, 13)]
    vals = [rows.get(m) for m in months]
    if None in vals:
        return None
    change = vals[-1] / vals[0] - 1
    colour = "#0b5f0b" if change >= 0 else "#a32222"
    lo, hi, step = nice(min(vals), max(vals))
    px = lambda i: L_ + i / 12 * (W - L_ - R_)
    py = lambda v: H - B_ - (v - lo) / (hi - lo) * (H - T_ - B_)
    img = Image.new("RGB", (W, H), "#f7f3e8")
    d = ImageDraw.Draw(img)
    d.text((L_, 28), f"The stock market in {year}", font=font(38, True), fill="#1c1a16")
    d.text((L_, 78), f"American shares (S&P 500) at the end of each month: {'up' if change >= 0 else 'down'} {abs(change) * 100:.0f} percent in the year", font=font(22), fill="#5a564c")
    v = lo
    while v <= hi:
        d.line((L_, py(v), W - R_, py(v)), fill="#d8d2c2", width=1)
        d.text((L_ - 14, py(v)), f"{v:,}", font=font(20), fill="#5a564c", anchor="rm")
        v += step
    for i, name in enumerate(LETTERS):
        d.text((px(i), H - B_ + 16), name, font=font(20), fill="#5a564c" if i else "#9a958a", anchor="mt")
    d.line((L_, H - B_, W - R_, H - B_), fill="#2a2722", width=2)
    # where the year began
    d.line([(px(0), py(vals[0])), (px(12), py(vals[0]))], fill="#9a958a", width=2)
    pts = [(px(i), py(v)) for i, v in enumerate(vals)]
    d.line(pts, fill=colour, width=6, joint="curve")
    for x, y in pts:
        d.ellipse((x - 7, y - 7, x + 7, y + 7), fill=colour, outline="#f7f3e8", width=2)
    d.text((px(12) - 12, py(vals[-1]) - 34 if change >= 0 else py(vals[-1]) + 14), f"{change * 100:+.0f}%", font=font(30, True), fill=colour, anchor="rt" if change < 0 else "rb")
    path = os.path.join(ROOT, "web", "static", "news", "markets", f"{year}-12-year-chart.png")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, optimize=True)
    return change


for arg in sys.argv[1:]:
    c = chart(int(arg))
    print(arg, "no data" if c is None else f"{c * 100:+.1f}%")
