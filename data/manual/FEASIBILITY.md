# Feasibility of the 17 hand-curated series

State of 2026-10-01. Every number quoted here was retrieved in the session that wrote this file; nothing is
from memory. "Entered" means a CSV exists in this folder and the build accepts it.

## Summary

| Series | Best source found | Granularity | Years covered | Effort for full series | Confidence | Status |
|---|---|---|---|---|---|---|
| pets-com | companiesmarketcap.com (daily closes) | daily | 2000-02 to 2001-01 | done | high; 10-K ranges and delisting-day close agree | entered, 2000-02..2000-11 |
| enron | companiesmarketcap.com (monthly) + UMKC daily table 1998-2001 | month-end | 1990-01 to 2001-12 | done | high 1998-2001 (two sources), good 1992-97 (10-K ranges), single source 1990-91 | entered; 1993-06 left out; 1985-89 not found |
| lehman | companiesmarketcap.com (monthly) | month-end | 1994-05 to 2008-09 | done | good; 151 months inside 10-K quarterly ranges, single source for the closes | entered |
| worldcom | companiesmarketcap.com (monthly) | month-end | 1990-01 to 2002-07 | done | good 1993-2001 (10-K ranges), unverified 1990-92 | entered; 1989 not found |
| xstrata | investing.com chart data (monthly, rights-adjusted) | month-end | 2002-05 to 2013-04 | done | medium; 6 months checked against archived Yahoo, adjustment factors are the source's | entered; 2002-03/04 missing, no dividends |
| slb (prefix) | Journal de Genève scans, New York table | daily close, two days per issue | 1980 to 1981 | done | good; 20 of 25 months read twice from two issues | entered, 1979-12..1981-12 |
| nestle (prefix) | Journal de Genève scans, Zurich table | daily close | 1980-01 to 1990-01 | about 120 issues to read | good (pilot of 13 months) | pilot only; must use registered shares |
| ubs (prefix, SBG) | Journal de Genève scans | daily close | 1980-01 to 1995-08 | about 190 issues | readable; overlap with Yahoo unresolved | pilot of 2 months; see conflict below |
| sbv | Journal de Genève scans | daily close | 1980-01 to 1998-02 | about 218 issues | readable | 1998-03..06 needs another source |
| sandoz | Journal de Genève scans | daily close | 1980-01 to 1996-12 | about 204 issues | readable | not started |
| ciba-geigy | Journal de Genève scans | daily close | 1980-01 to 1996-12 | about 204 issues | readable | not started |
| credit-suisse | Journal de Genève scans to 1998-02; digrin.com monthly 1995-04 to 2023-06 (adjusted) | daily / month-end | 1980 to 2023 | 218 issues + one download | scans readable; digrin is back-adjusted (0.9155 x true close in 2008) | not started |
| swissair | Journal de Genève scans | daily close | 1980-01 to 1998-02 | about 218 issues | readable | 1998-03..2001-10: no source found |
| mercedes (prefix) | onvista.de daily from 1987-12-30; Journal de Genève "Allemagne" table before | daily close | 1987-12 to 1996-10 online; 1980-87 scans only | download + about 96 issues | online part good; scans not piloted for German shares | not started |
| bmw (prefix) | boerse.de monthly from 1973 (adjusted) / onvista daily from 1987-12-30 (raw) | month-end / daily | 1980 to 1996 | one download | medium; pre-1988 rights adjustments unverified | not started |
| siemens (prefix) | boerse.de monthly from 1973 / onvista daily from 1987-12-30 | month-end / daily | 1980 to 1996 | one download | good; both are raw quotes times a constant | not started |
| ibj | JPX "TSE Daily Official List" archive (scanned TIFF to about 1998, text PDF after) | daily | 1980-01 to 2000-09 | 249 downloads of 100-170 MB each, one page read each | readable, but JPX asks for manual retrieval and forbids reproduction | not started |

## Sources that turned out usable

- **companiesmarketcap.com** `/<slug>/stock-price-history/` embeds a JSON array of prices. For live companies it
  mirrors Yahoo. For delisted US names (enron, lehman-brothers, worldcom, pets-dot-com-ipet-holdings) it has its own
  data: month-end points (daily for Pets.com) expressed per share of the first data month, i.e. quoted close
  times all later splits. Dividing by the total split factor gives the final-share basis. No dividends. No page
  for Xstrata, Swissair or IBJ; the Credit Suisse page is the USD ADR.
- **SEC EDGAR 10-K filings** (1993 onward) give quarterly high/low and dividends. sec.gov rejects scripted
  downloads (403, "undeclared automated tool"); the filings were read from web.archive.org copies. Used only as
  a range check and for dividends, never turned into monthly prices.
- **UMKC Famous Trials** publishes a scanned daily Enron price table for 1998-2001.
- **letempsarchives.ch** (Journal de Genève, Gazette de Lausanne; until 28 February 1998). Issue pages are
  served as images through a public IIIF endpoint used by the site's own viewer
  (`dedieletemps.cybor.ch/iiif_letemps/JDG_<yyyy>_<mm>_<dd>_<page>/...`), so any region can be fetched at full
  resolution. The whole-issue PDF is refused outside the site ("You can only download PDF from the app
  button") and was not used. No OCR text was found; numbers are read by eye from the image.
- **investing.com chart API** (monthly, back-adjusted) for Xstrata (id 23496) and Credit Suisse (id 316, from
  1989-04). Refuses plain HTTP clients; readable through a fetch tool only.
- **digrin.com** monthly CSGN.SW 1995-04 to 2023-06, back-adjusted.
- **boerse.de** monthly BMW and Siemens from 1973; **onvista.de** daily Frankfurt closes for Daimler, BMW,
  Siemens from 1987-12-30; **ariva.de** daily from 1990 with raw and adjusted variants and an event list.
- **JPX** daily official list archive for Tokyo, 1949-2010.

## Sources that are blocked or empty

- **e-newspaperarchives.ch**: Cloudflare challenge ("Just a moment...", HTTP 403) for both curl and the fetch
  tool. Not circumvented. Which papers there carry a quote page, and how good their OCR is, could not be
  checked; a person with a browser can.
- **stooq.com**: JavaScript proof-of-work challenge. Not circumvented.
- Wayback Machine has no archived Yahoo historical-price pages for ENE, LEH, WCOM, IPET (index query empty);
  it has a few for XTA.L and CSGN.VX with about 66 daily rows each.
- finanzen.net/.ch, marketscreener, macrotrends, advfn, marketwatch, comdirect: 401/403. Yahoo: "symbol may
  be delisted" for CSGN.SW, XTA.L, 8302. onvista and ariva have no Swissair history; ariva's UBS history starts
  1998-06.
- Schlumberger's investor site (split history) returns "Access Denied" to scripts.
- NZZ archive, SNB and SIX historical data: not examined.

## Newspaper-archive pilot (Journal de Genève)

What was done: Nestlé bearer and registered for the 12 month-ends of 1985 and for 31 January 1990 (Yahoo's
first month); Schlumberger for 25 month-ends 1979-12 to 1981-12 with a second reading from the following
issue; UBS, SBV, Swissair, CS Holding, Sandoz, Ciba-Geigy for 31 August 1995 and partly 31 October 1995.
Raw readings are in `raw/pilot-journal-de-geneve.csv` and `raw/slb-raw.csv`.

Findings:

- **Legibility.** Page scans are about 2,800 px wide in 1985 and 3,700 px in 1980, 1990 and 1995. Four- and
  five-digit quotes are clearly legible at full resolution. One of the issues examined (2 June 1981) was too
  faint to read. Suffix letters after a quote (`d`, `g`, `o`, `t`: bid, ask, offer, traded) appear and must
  not be mistaken for digits; a `d` quote is a bid, not a trade.
- **Two days per issue.** Each issue prints the previous two trading days, so every month-end close can be
  read twice (first issue after month end, and the one after that). In the Schlumberger run 20 of 25 months
  matched in both issues, 3 differed by 1/8 to 1 1/2 dollars because the earlier issue carried a 16:00 price
  rather than the close, and 2 had only one reading. Swiss closes do not have that time-zone issue.
- **Year-end.** The paper did not appear on 1 and 2 January, and the 31 December close of New York was never
  printed (28 or 30 December is the last one). The Swiss exchanges were closed on 31 December in 1985.
- **Finding the page.** The page number changes from issue to issue (4, 6, 8, 10 or 13 in the sample), the
  table moves within the page, and the layout changes over the years (1980: one "Suisse" list; 1985: Zurich
  list; 1995: "Bourses suisses" with volume and 12-month high/low). Roughly one extra image fetch per issue
  goes into locating the row.
- **Share class and overlap.** On 31 January 1990 Nestlé bearer closed at 8745, registered at 8480 (Zurich).
  Yahoo's first row is 8.475. Yahoo's series is therefore the **registered** share divided by 1000, not the
  bearer share. In 1985 the registered share traded at about half the bearer price (3435 against 6140 in
  January), so the class matters a great deal: the Nestlé prefix must use registered shares (`Nestlé N`),
  divided by 1000.
- **UBS overlap is unresolved (conflict).** 31 August 1995: SBG bearer 1075, SBG registered 235, SBV bearer
  410, SBV registered 205.75. Yahoo UBSG.SW 1995-08 is 18.8757 and 1995-10 is 20.5314 (+8.8 %). Over the same
  two months SBG registered rose 10.6 % (235 to 260), SBG bearer 14.4 %, SBV bearer 13.7 %, SBV registered
  13.1 %. None matches. SBG registered / Yahoo is 12.45 and 12.66, the most stable ratio, and 12 is the product
  of the later 2:1, 3:1 and 2:1 splits reported for UBS, but that is a guess, not a finding. Before a UBS
  prefix is entered, more overlap months (1995-09 to 1998-06) must be read to establish which class Yahoo
  carries and with what factor.
- **Coverage ends 28 February 1998**, so the scans cannot supply SBV 1998-03..06, Swissair 1998-03..2001-10 or
  Credit Suisse after 1998-02.
- **German shares.** The same page has an "Allemagne" table with Frankfurt closes in DM (BMW, Daimler-Benz,
  Siemens seen in the 1 October 1980 issue) and a Zurich table with German shares quoted in CHF. Only the DM
  table is usable. Not piloted beyond confirming the rows exist.
- **Tokyo.** The page has a Tokyo table; whether it lists Industrial Bank of Japan was not checked.

Measured effort: locating the page and reading one company's two columns took about two image fetches and
one reading per issue when issues were batched six at a time; a second issue for confirmation doubles that.
One issue yields all Swiss, German and US rows at once, so the unit of work is the issue, not the data point.

Estimate for the full Swiss and German scope: about 218 month-end issues (1980-01 to 1998-02), each read
for up to 11 rows (Nestlé N, SBG, SBV, CS, Swissair, Sandoz, Ciba-Geigy, plus Daimler, BMW, Siemens in DM
until 1987), that is about 1,700 points from about 220 issues, or 440 with the second reading. For a person
with a browser: 4 to 6 minutes per issue including typing, so 15 to 22 hours single-read and about 30 hours
double-read. For an agent reading page images the same job is several hundred image fetches and is feasible
in a few long sessions, but share-class changes, splits and nominal-value changes (not yet researched for any
Swiss name) need a separate documented pass, and the UBS and SBV class question must be settled first.
Buying a data file is clearly cheaper if one is available for the Swiss names.

## Per series

### pets-com (entered)
Daily closes 2000-02-11 to 2001-01-18 from companiesmarketcap. No split, no dividend. The 10-K for 2000
gives quarterly ranges (14.00/3.88, 4.63/1.88, 2.44/0.59, 0.81/0.06) and a 0.125 close on 18 January 2001,
all consistent. The shares traded until January 2001; the universe ends the series in 2000-11 at 0.28.

### enron (entered, 1990-01 to 2001-12)
Month-ends from companiesmarketcap, divided by 8 (2-for-1 splits in December 1991, August 1993, August 1999).
The UMKC daily table confirms 45 of 48 months of 1998-2001 to the cent. Conflicts: 2000-05 (72.875 against
71.63) and 2000-07 (73.625 against 73.75), where the first source appears to carry the next day's opening
price; the UMKC value is used. 1993-06: source gives 65.875 as quoted, above the quarter's high of 62.5 in
the 10-K; the month is left out. Dividends 1992-2000 from 10-Ks, booked at quarter end; none for 1990-91 and
2001. 1985-1989: no monthly source found. 1991-12: the split is dated 31 December 1991 and it is not
established whether that day's quote was before or after it; the adjusted value is unaffected.

### lehman (entered, 1994-05 to 2008-09)
Month-ends from companiesmarketcap, divided by 4 (2-for-1 on 20 October 2000 and 28 April 2006). 151 months
lie inside the 10-K quarterly ranges (fiscal 2000 range not retrieved). Dividends from 10-K quarterly tables;
fiscal 2000 is the annual 0.22 spread evenly, and the three 2008 payments use the announced 0.68 annual rate.
2008-09 is the over-the-counter close of 30 September (0.22), after the filing.

### worldcom (entered, 1990-01 to 2002-07)
Month-ends from companiesmarketcap, divided by 40.5. 108 months of 1993-2001 lie inside 10-K ranges. The
source's own split table multiplies to 20.25, so one 2-for-1 step before 1994 is undocumented, and it is not
known whether 1990-1992 follows LDDS (Tennessee) or Resurgens; treat those three years as unverified. The MCI
group tracking share distributed in July 2001 (1/25 per share) is not included. No dividends. 1989: not found.

### xstrata (entered, 2002-05 to 2013-04)
investing.com monthly closes in pence, rights-adjusted by the source, divided by 100. Checked against six
unadjusted Yahoo closes from archived pages (exact in 2010, constant ratio 0.5066 in 2004). 2002-03 and
2002-04 are missing. Dividends not entered. The 2003 and 2006 rights-issue terms were not retrieved, so the
adjustment cannot be re-derived from this folder alone.

### slb prefix (entered, 1979-12 to 1981-12)
Journal de Genève, New York table. Divisors 9, 6, 4 for the 3-for-2 splits visible in the quotes in October
1980 and July 1981 and Yahoo's later 2-for-1 splits. Overlap: 13.9375 (30 December 1981) against Yahoo
13.96875 (31 December). Year-end rows are 28 or 30 December. No dividends.

### nestle prefix (pilot only)
See pilot. Use registered shares / 1000. Splits and nominal changes between 1980 and 1990 not researched; the
1985 and 1990 registered quotes (3435, 8480) are raw.

### ubs prefix, sbv, sandoz, ciba-geigy, swissair, credit-suisse
All are in the Journal de Genève table through February 1998 with bearer, registered and participation
lines. Not started. Open points: UBS overlap (above); SBV and Swissair after February 1998 (no source);
Credit Suisse after February 1998 from digrin.com or investing.com, both back-adjusted with different
factors (1998-03: 67.672 against 66.35), raw closes only from ariva.de from 2004 (and those are also
adjusted); the 4-for-1 split of 15 August 2001 and the 2013, 2015 and 2017 capital events need mapping.

### mercedes, bmw, siemens prefixes
Daily Frankfurt closes from 1987-12-30 (onvista) for all three; monthly from 1973 (boerse.de) for BMW and
Siemens. Daimler-Benz 1980-1987 has no online source and needs the newspaper table or the annual reports
(which exist on the Mercedes-Benz site but refused scripted access). Conversion constants found empirically:
Daimler DM quote = EUR x 1.95583 x 12.0452 before the 1 July 1996 10-for-1 nominal change; BMW x 26; Siemens
onvista x 15.459 with Yahoo about 11 % below onvista. Dividends only from 1993-1995 on. These sites' terms
restrict reuse; check before shipping.

### ibj
JPX publishes the Tokyo daily official list for 1949-2010. A 29 December 1989 scan shows 8302 at 6380; the
21 September 2000 PDF shows it at 835. Month-ends before 1999 mean one 100-170 MB download and one page read
each. JPX asks for manual retrieval only and prohibits reproduction of the files. No split or dividend
history was found.
