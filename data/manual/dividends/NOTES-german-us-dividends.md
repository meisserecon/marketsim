# Dividends for German and US stocks: research notes

Worktree session of 2026-10-02. One section per stock, in the order worked. All amounts are re-checkable from the raw-<id>.csv files in this folder.

## Daimler-Benz / DaimlerChrysler (mercedes)

Covered: payments 1980 to 1998 (FY1979 to FY1997), 18 lines in mercedes.csv. FY1995 had no dividend. Yahoo has EUR 2.35 from May 1999, so nothing is missing before that, except:
- Months for FY1982 and FY1983 (payments 1983 and 1984) are "month assumed July": the AGM dates were not found (reports 1982/1983 exist only as truncated web.archive.org captures). AGMs 1980 (2.7.), 1981 (1.7.), 1982 (7.7.), 1985 (3.7.), 1986 (2.7.), 1987 (1.7.), 1988 (1.7.) are all in early July.
- FY1976 to FY1978 amounts are in raw-mercedes.csv (9.50, 9, 9 DM) but not used (before the game starts).

Sources: Daimler-Benz annual reports, own archive (see header of mercedes.csv). The company site returns 403 to scripted fetches, so the reports were read from the KU Leuven library copies (1985 to 1997) and web.archive.org copies (1979, 1981, 1984).

Basis: the price series is not adjusted for rights and bonus issues (1:7 bonus 1986, capital increases 1981 8:1 and 1989 and others), so the dividend per share actually held is converted with the same constant as the prices: DM per DM 50 share / 23.5586 until the 10:1 split of 1.7.1996, DM per DM 5 share / 2.35586 afterwards. Control: the report's own "dividend as adjusted" row (AR 1985 p.127) shows the company itself adjusts retroactively for capital increases; the raw (unadjusted) row is the one used because the price series is unadjusted.
Bonus payments: FY1980 DM 1, FY1982 DM 1, FY1985 DM 2.50 (centenary bonus) were paid in cash with the dividend and are included in the line total.
Excluded: special distribution of DM 20 per share at the AGM of 27.5.1998 (about DM 10.3 billion). The company re-raised DM 7.4 billion by a capital increase with subscription rights at the same time (AR 1997), so it is a return of capital, not income, and on its own would be a 13 percent yield.

Yield check (dividend / price of the series in the payment month): 1980 3.8, 1981 3.1, 1982 3.3, 1983 1.9, 1984 2.0, 1985 1.3, 1986 1.3, 1987 1.0, 1988 1.7, 1989 1.7, 1990 1.4, 1991 1.6, 1992 1.7, 1993 2.3, 1994 1.0, 1995 1.6, 1997 0.8, 1998 0.9 percent. All inside 0.5 to 8 percent. Note the series price falls from 49 (1987-07) to 29 (1988-07) with no capital measure identified in mercedes.csv; the dividend is on the same raw basis in both years, so the yield jumps from 1.0 to 1.7 percent; treat the 1980s NZZ part of the price series with that in mind.
Conflict to flag for the lead: Yahoo's own EUR 2.35 (1999-05, 2000-05...) is not divided by the 1.20452 Daimler Truck factor that is in its prices, the lines here are (rule 2). The step between 1998 and 1999 is therefore about 20 percent in nominal terms.
