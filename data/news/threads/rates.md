# Thread: rates

Span: 1979-12 to 2023-10.

The game opens in the middle of the Great Inflation: prices rise about 13 percent a year and Paul Volcker's Fed has just switched to controlling the money supply. Interest rates go to 20 percent (prime rate 21.5 percent in December 1980, 10-year Treasury yield 15.3 percent in September 1981), and the squeeze causes the deepest recession since the war, with unemployment near 11 percent. In August 1982 the Fed lets rates fall and the great bull market begins. From then on, interest rates fall for almost four decades, with setbacks along the way: Volcker hands over to Greenspan in 1987 with inflation under 4 percent; Greenspan cuts hard in 1991 and again in 2001; the 1994 surprise hikes give bondholders their worst year in decades; in 2008 the Fed goes to zero and starts buying bonds; in 2014 Switzerland and the euro area go below zero. The pandemic takes US rates back to zero and the 10-year yield to a record low in 2020. Then inflation returns (6.2 percent in October 2021, 8.6 percent in May 2022), and the fastest rate rises in forty years end the long bond bull market; by October 2023 the 10-year yield is back near 5 percent. For players the thread teaches the one rule that links it all: when rates fall, bond prices rise, and vice versa.

## Storyline

| Month | Title | Beat id | Arc file | Status |
|---|---|---|---|---|
| 1979-12 | Gold doubles in a year as inflation passes 12 percent | 09d0e46d | rates.beats.json | existing |
| 1980-12 | The prime rate hits a record 21.5 percent | 67433d77 | rates.beats.json | existing |
| 1981-09 | Ten-year Treasury yields reach a record 15 percent | 21ff4855 | rates.beats.json | existing |
| 1982-08 | Wall Street jumps on rate hopes; Boeing up 48%, Apple up 33% | d4f7bb04 | ba.beats.json | existing, enriched (Fed eases, unemployment 9.8%, inflation 6.4%) |
| 1987-08 | Shares hit a record as Greenspan takes over the Fed | 9603bcbc | markets.beats.json | existing, enriched (Volcker's record: inflation and yields since 1980/81) |
| 1991-12 | The Fed cuts sharply and shares end 1991 with an 11 percent burst | 0610238d | markets.beats.json | existing |
| 1994-02 | The Fed raises rates for the first time in five years | e5478fc8 | rates.beats.json | existing, enriched (look-back: 10-year yield 15.3% in 1981, 5.3% in 1993) |
| 1994-11 | Sixth hike of the year as bond losses mount | a8281700 | rates.beats.json | existing |
| 2001-01 | The Fed cuts by half a point, twice in one month | 371fa7de | rates.beats.json | existing |
| 2008-12 | Zero interest rates and the Fed starts buying bonds | 02686580 | rates.beats.json | existing, enriched (look-back: 19% in January 1981) |
| 2014-12 | Switzerland introduces negative interest rates | 914a10c0 | rates.beats.json | new |
| 2020-03 | Back to zero, and unlimited bond buying | 25006799 | rates.beats.json | existing |
| 2021-11 | Inflation at 6.2 percent; the Fed starts to slow its bond buying | 4bfdfd27 | rates.beats.json | existing |
| 2022-03 | The Fed raises rates as inflation nears 8 percent and war breaks out | c806db40 | rates.beats.json | existing |
| 2022-06 | Inflation at 8.6 percent; a three-quarter-point hike | 91dd355a | rates.beats.json | existing |
| 2023-10 | Ten-year yields near 5 percent, mortgages near 8 | 98d41543 | rates.beats.json | existing, enriched (look-back: 0.6% in July 2020) |

The 2003 cut to 1 percent (7a8b5a59) belongs to the housing-crisis thread, where it opens the cheap-money chapter.

## One metric (4 October 2026)

Every story of this storyline is told with the Fed's interest rate (the federal funds rate) and closes with the same three numbers: the Fed's rate as it stands at the end of the month (its target, FRED series DFEDTAR, and the target range DFEDTARL to DFEDTARU since December 2008; before October 1982, when no target was published, the month's average, FEDFUNDS), inflation (the headline index CPIAUCNS against a year before) and unemployment (UNRATE), the last two as last reported, i.e. for the month before. Other rates (the prime rate, bond yields, mortgages) appear only inside the text and are named for what they are. The picture of each story is a chart of the three numbers from 1955 up to its month, drawn by `data/scripts/rate-charts.py`. The years of free money (2009 to 2019) have at least one beat each.

The storyline now:
- 1979-12 Gold doubles in a year as inflation passes 12 percent (09d0e46d, rates)
- 1980-06 The Fed's rate tumbles from 17.6 to 9.5 percent; bonds and gold bounce back (9cc82a5f, rates)
- 1980-12 The Fed drives its interest rate to 19 percent (67433d77, rates)
- 1981-07 The Fed holds its rate at 19 percent and gold slides below 410 (80da83c4, rates)
- 1981-09 The Fed's rate eases to 16 percent, but lending for ten years costs more than ever (21ff4855, rates)
- 1982-08 Wall Street jumps on rate hopes; Boeing up 48%, Apple up 33% (d4f7bb04, ba)
- 1987-08 Shares hit a record as Greenspan takes over the Fed (9603bcbc, markets)
- 1991-12 The Fed cuts sharply and shares end 1991 with an 11 percent burst (0610238d, markets)
- 1994-02 The Fed raises rates for the first time in five years (e5478fc8, rates)
- 1994-11 Sixth hike of the year as bond losses mount (a8281700, rates)
- 1998-10 A surprise Fed cut on 15 October and shares bounce 8 percent (5901c0c0, markets)
- 2001-01 The Fed cuts by half a point, twice in one month (371fa7de, rates)
- 2001-04 A surprise rate cut and better earnings bring an 8 percent bounce (203cc7b8, markets)
- 2005-02 Greenspan's 'conundrum': long rates fall while the Fed raises (ad2cf020, rates)
- 2006-06 Seventeenth hike in a row; gold falls back from a 26-year high (b0b300fd, rates)
- 2008-01 The Fed's emergency cut: three-quarters of a point between meetings (1d20f458, markets)
- 2008-12 Zero interest rates and the Fed starts buying bonds (02686580, rates)
- 2009-03 Money is free: the Fed creates a trillion dollars to buy bonds (ca8586b6, rates)
- 2010-11 Two years at zero, and the Fed buys another 600 billion dollars of bonds (76a44a32, rates)
- 2011-08 The Fed promises: money stays free for two more years (a4f7a932, rates)
- 2012-09 QE3: open-ended bond buying (e762e5d4, rates)
- 2013-06 Bernanke hints at slower bond buying and yields jump (4321ca9e, rates)
- 2014-10 The Fed stops buying bonds, but money stays free (eed0a3a0, rates)
- 2014-12 Switzerland introduces negative interest rates (914a10c0, rates)
- 2015-12 The first rate rise in nine years (3460c8de, rates)
- 2016-07 Money stays almost free: the Fed holds its rate below half a percent (9a55fbf6, rates)
- 2016-12 A second small step: the Fed raises its rate to 0.5 to 0.75 percent (4a4e5aa4, rates)
- 2017-12 Three rises in one year: the Fed's rate reaches 1.25 to 1.5 percent (33f590f3, rates)
- 2018-12 The Christmas fall: shares lose 9 percent in December (393d6f65, markets)
- 2019-01 The Fed promises patience and shares jump 8 percent (be310846, markets)
- 2019-07 The Fed cuts its rate for the first time since 2008 (559196a1, rates)
- 2020-03 Back to zero, and unlimited bond buying (25006799, rates)
- 2020-08 Gold at a record as the Fed says it will let inflation run (d8ab1d2d, rates)
- 2021-11 Inflation at 6.2 percent; the Fed starts to slow its bond buying (4bfdfd27, rates)
- 2022-03 The Fed raises rates as inflation nears 8 percent and war breaks out (c806db40, rates)
- 2022-04 Rising rates and weak earnings: the worst month since March 2020 (7016a204, markets)
- 2022-06 Inflation at 8.6 percent; a three-quarter-point hike (91dd355a, rates)
- 2022-09 Third giant hike; the British bond market breaks (281974e4, rates)
- 2023-03 Silicon Valley Bank fails on its bond losses (cfcbe3df, rates)
- 2023-10 The Fed holds its rate at 5.3 percent, the highest in 22 years; mortgages near 8 (98d41543, rates)
- 2023-11 Inflation cools, yields drop, shares jump 9 percent (83717eb0, markets)
- 2024-09 The Fed's first cut in four years, half a point at once (7a7429cb, rates)
- 2026-06 Inflation back above 4 percent; Warsh takes over; gold slides (815cf415, rates)
- 2026-09 The Fed raises rates again as oil passes 100 dollars (282e2f5b, rates)
