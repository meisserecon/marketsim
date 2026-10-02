# NZZ readings 1988: notes

Months done: 1988-01 to 1988-11 completely (12 values each: 8 Swiss, Daimler, BMW, IBJ, IBM), 1988-12 foreign values only (4). 136 values, all read twice.
Missing: Swiss shares for December 1988. The issue of 31 Dec/1 Jan 1988/89 (74 pages) has no "Zuercher Boerse" page (checked page headers 1-74); the 3 Jan 1989 issue was not downloaded.

## Layout (page = PDF page, image index + 1)
Issues are JPEG scans. Per issue: Swiss list on the "Zuercher Boerse" page of the business section, header "Kurse vom <date>" (checked for Aug, Sep, Oct, Nov; the others are the last trading day before the issue date, issue headers viewed).
Swiss pages: 1988-01-30 p41; 03-01 p39; 04-02 p41; 04-30 p45; 06-01 p45; 07-01 p41; 07-30 p35; 09-01 p41; 10-01 p41; 11-01 p43; 12-01 p41. Frankfurt page is Swiss page + 4 (+2 in 07-30), Tokyo +1, New York +2 (see CSV page column).
Convention (legend printed on the Swiss page, "Zeichenerklaerung"): running text per company: name/class, previous day's cash price in (...), then all trades in order; R = Reprise (start of 2nd session); L = Losgeschaeft (trade with lottery);
dt = premium deal with price before and after; month abbreviations after a price = forward deals; pH = permanent trading. This is the same format as 1983-87; the 28 Feb 1987 change noted by earlier agents is a marker/ordering change only.
Value taken: last price of the day with no dt and no month abbreviation. Where it carries an L it is kept (flagged "L" in the note, 15 values); it is a genuine trade.
Nestle I: not a bearer share with PS in the same line (Nestle I pH, N pH, PS pH are separate lines). SKA line is "SKA I+PS" (bearer including PS) and is recorded as share_class I+PS; SBG I is series ubs.
Foreign tables ("Auslandboersen"): Frankfurt columns Vortag, Tages H, Tages T, Tagesschluss, Jahres H, T. The Schluss column is the closing price (Frankfurt official/closing, printed as Tagesschluss), and it equals onvista's Frankfurt close exactly (see controls). Tokyo same columns; New York: Vortag, Tages H, T, Tagesschluss (fractions), plus volume and yield columns.

## Special cases
- 1988-03: issue 2 Apr (Good Friday 1 Apr). Frankfurt table has one price column only (31 Mar close, no Vortag/H/T). Tokyo was open on 1 April: the 31 Mar close is the Vortag column (Industrial Bk. 3600). New York closed: IBM 31 Mar from the Schluss column of the 1 April list (107 1/2).
- 1988-04: 29 April Tokyo holiday, single column = 28 Apr (IBJ 3430, quote_date 28 Apr). Frankfurt/NY 29 Apr.
- 1988-12: issue 31 Dec. Frankfurt and New York "Kurse vom 30. Dezember"; Frankfurt prints a single year-end column. Tokyo prints a column headed 28.12. only (Tokyo closed from 29 Dec): IBJ 4350 on 28 Dec.
- Frankfurt 1988-11/12 values are the 30 Nov / 30 Dec closes (onvista months end 30 Nov and 29 Dec; BMW/Daimler ratio below shows the 29 Dec onvista close equals the 30 Dec NZZ one, i.e. no trade difference).

## Double reading
Pass 1 values were typed into a file during the first pass; because of a tool problem (the images of my first attempt were not delivered to me) the first file was discarded and rewritten after re-viewing the same crops, so pass 1 is the original-crops read plus a re-view. Pass 2 used new crops at other coordinates and was read afresh, but pass 1 values were in my context (it was not blind).
Compared: 136 values, 132 agree at first comparison (97.1 percent), 4 disagreed, all four resolved by a third reading at higher magnification (eye3):
- 1988-06 IBM: 127 7/8 vs 127 3/8 -> 127 3/8 (8x crop: "127 3/8").
- 1988-09 IBM: 115 5/8 vs 115 3/8 -> 115 3/8 (5x crop).
- 1988-11 Sandoz I: 10600 vs 10575 -> 10575 (sequence ends "10650L 10625 10600 10575 N (6925)" after the R).
- 1988-11 Ciba-Geigy I: 2715 vs 2710 -> 2710 (sequence "... 2700L 2715L 2710 N (1920)").
No value was dropped for disagreement. Per month first-comparison disagreements: 06: 1, 09: 1, 11: 2, others 0.

## Controls
IBM printed / Yahoo (ibm.csv): 01 4.198, 02 4.188, 03 4.179, 04 4.189, 05 4.203, 06 4.184, 07 4.184, 08 4.184, 09 4.184, 10 4.193, 11 4.184, 12 4.180 (constant 4.18-4.20; scatter is Yahoo month-end date convention).
Frankfurt vs onvista (value in DM / 1.95583 / onvista EUR value): Daimler 12.0450-12.0454 in all 12 months; BMW 25.9996-26.0003 in all 12 months. Exact agreement; constants are the split bases (Daimler 12.045, BMW 26 per the bmw.csv header). No unexplained Frankfurt differences, so the earlier agents' 0.5-6 DM scatter was reading error or wrong day, not a different quote.
No Zurich control exists for 1988 (Nestle registered Yahoo starts 1990).

## Nestle opening of 17 Nov 1988 (printed in the paper)
Nestle I: 8890 (31 Oct) -> 6875 (30 Nov), -22.7 percent. Nestle N: 4375 -> 6000, +37.1 percent. Ratio I/N 2.03 -> 1.15. Month before: 8375/8750/8890 vs 4280/4240/4375.
Other bearer shares Oct -> Nov: SBG 3440 -> 3125 (-9.2), SBV 391 -> 363 (-7.2), SKA 2880 -> 2690 (-6.6), Sandoz 12300 -> 10575 (-14.0), Ciba-Geigy 3475 -> 2710 (-22.0), Swissair 1185 -> 1090 (-8.0). For comparison Daimler 758.5 -> 739 (-2.6), BMW 546.5 -> 516 (-5.6). Sandoz and Ciba-Geigy show a Nestle-like drop. In the 1 Dec issue the Ciba-Geigy N line shows (1920) 1960 ... up to about 2025, i.e. the registered share rose too (not read as a series value). I did not read the paper's text on the cause.

## Plausibility checks / breaks
No factor-2 or factor-10 jump other than the Nestle/Ciba/Sandoz November moves above. No split or nominal change seen in the year-high/low columns of Frankfurt, Tokyo and New York for these names in 1988. IBJ 4350 (28 Dec) vs 3740 (30 Nov) is +16 percent; the year range printed in the same table is 4500/2417, so it is inside the range and treated as real.

## Honest error estimate
Bearer-share running text is dense and the last price of a long sequence is easy to mis-pick; I estimate 1 to 2 percent of the Swiss values could be off by one trade (typically 5 to 25 CHF for Nestle, Sandoz). Foreign values are tightly controlled (Frankfurt exact, IBM constant). Two readings by the same reader, not fully blind, so correlated errors (e.g. systematically choosing the wrong "last" price) are not excluded.
