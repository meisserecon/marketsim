# NZZ readings 1986-01 to 1987-01 (double read): notes

Output: `nzz-readings-1986.csv`, 146 values, method `eye2`. Replaces in value the single-read file `nzz-readings-1986-1988.csv` for the 13 months it covers (that file stays as is).

## Layout (all issues in this period are JPEG scans, pages about 3700 x 5480 px)
- Swiss shares: page "Zuercher Boerse" / "Schweiz", running text, no closing column. Line format: `Name (Vortag) first trades ... R trades of the second session`. Marks: t/tt/ttt forward deals, dt premium deals, L trade in the call. A lone figure abbreviates the last digits of the previous price. Close = last price of the day without t/tt/ttt/dt mark; a trailing L was accepted (noted). From the issue of 1986-11-01 a box "Permanenter Handel" (p.H.) holds the continuously traded names (Nestle I, SBG I, SBV I, SKA, Swissair I, Ciba I, ...) with the same running-text format. The bracket value (previous day) was used as plausibility check for every line.
- Foreign: "Auslandboersen" page two pages after the Swiss page: Frankfurt with columns "Ende 1985 / Vortag / Schluss" (DM), Tokio same columns (yen); "New Yorker Boerse" the page after (columns Ende 1985, high, low, Vortag, Schluss ... fractions). Date in the header "Kurse vom ...".
- Page indexes (PDF page = idx+1): Swiss 25 (issues 1986-02-01, 03-01, 05-02, 05-31, 08-30, 10-01, 11-01, 11-29, 1987-01-31), 21 (07-01), 19 (08-02, 12-31); Frankfurt/Tokio two pages later (27; 23 for 07-01; 21 for 08-02 and 12-31); New York 29, 25, 23, 22 respectively. Issue 1986-04-01: foreign pages 11 (Frankfurt/Tokio) and 12 (New York).

## Frankfurt column finding
The Frankfurt list prints "Vortag" (previous day) and "Schluss" (day), both numeric closing prices, no Kassakurs/fixing label. Compared with the Journal de Geneve prints the NZZ differs by 0 to 1.5 DM (below), so the NZZ Schluss is probably the last (Variabel/official) price of the day and the JdG a slightly different quote; Daimler agrees exactly in two of three months. Not resolved further.

## Special cases
- 1986-03 (issue 1986-04-01): Frankfurt closed Good Friday 28 and Easter Monday 31 March; table prints one column (Vortag, vertical word "geschlossen" in the Schluss column) = close of Thu 27 March. Tokio/New York of 31 March. This 60 page issue contains NO Swiss share table (all pages checked by contact sheets), so all Swiss rows of 1986-03 are missing. The issue carries a notice "Zum Boersenteil" (p. 9): until 27 April 1986 the US quotes in the whole edition are 15h quotes, not closes. The IBM value of March (151.5) is therefore an intraday quote; it still matches Yahoo (ratio 4.184) so it is kept and flagged in the note.
- 1986-04 (issue 1986-05-02): foreign tables "Kurse vom 1. Mai": Vortag column = 30 April. Swiss table is of 30 April. SBG I April (5460): the whole second session (R) is forward-marked, last unmarked price is that of the first session.
- 1986-05 (issue 05-31, Kurse vom 30. Mai): Frankfurt Vortag column reads "geschlossen", number = Schluss of 30 May.
- 1986-07 (issue 08-02): Swiss "Kurse vom 31. Juli"; foreign "Kurse vom 1. August", Vortag column = 31 July.
- 1986-12 (issue 12-31): all tables "Kurse vom 30. Dezember" (31 Dec close not printed; issue 1987-01-03 has no Swiss table). IBM 30 Dec close 120 7/8 (31 Dec close was 120 3/8 according to the earlier agent). Tokio closed ("gesch.") on 30 Dec: IBJ December missing.
- 1986-09 SBG I: last token a single digit read as 5645; 1986-04 SBV I last price carries L; 1986-07 Nestle N and 1986-08 Swissair I last prices carry L (noted in rows). SKA is printed as "Inh. inkl. PS".
- 1987-01 Sandoz I: line "(10750) 10750 650 R 50": last price 10650 or 10750 cannot be told; dropped.

## Double reading statistics
Pass 1 (run per issue and written to a file that was not opened in pass 2) and pass 2 (new crops, different crop boundaries, made after all of pass 1) were compared by script: 146 values in both, 0 differences, 1 value read in pass 1 only (Sandoz 1987-01, ambiguous, dropped). Caveat: pass 2 was done in the same session with the pass 1 values still in my context, so it is less independent than a blind second reading; every number was nevertheless re-read from a fresh crop, and the ambiguous running-text lines were re-expanded from the marks. No third reading was needed.
Months: 1986-01 to 1987-01 all done; 1986-03 only foreign (no Swiss table in the issue); per month 11-12 values, 12 shares and instruments per month (IBJ absent in 1986-12, Sandoz in 1987-01, Swiss in 1986-03).

## Sanity checks
- IBM printed / Yahoo (ibm.csv): 1986-01 4.177, 02 4.187, 03 4.184, 04 4.194, 05 4.184, 06 4.184, 07 4.184, 08 4.180, 09 4.184, 10 4.180, 11 4.184, 12 4.215 (30 Dec vs Yahoo 31 Dec; 120.375/28.681 = 4.197), 1987-01 4.176. Constant, so dates and rows are right.
- Frankfurt vs Journal de Geneve prints (bmw-raw.csv, mercedes-raw.csv): 1986-06 BMW 593 vs 592, Daimler 1340 vs 1340; 1986-07 BMW 479 vs 480, Daimler 1130 vs 1130; 1986-08 BMW 643 vs 644.5, Daimler 1322 vs 1323. Differences 0 to 1.5 DM (under 0.25 percent), not exact for BMW; unexplained (see Frankfurt finding). No overlap with the JdG Nestle 1985 file or the 1995 values.
- Bracket (Vortag) check of every Swiss line: the first trades were close to the bracket in every line used.
- Month to month: no factor 2 or 10 jumps in Swiss shares or IBM. No split or nominal value change found in these 13 months (year high/low columns of the New York page unchanged in structure). Large moves, each printed with Vortag and trades consistent: IBJ 2070 (Nov) to 3320 (Jan 1987, +60 percent, Vortag 3290, so the level is genuine); Daimler 1233.5 to 1022.5 and BMW 583 to 505 in Jan 1987 (Vortag 995 / 490 consistent); Swissair 1930 (Apr) to 1300 (Sep) steady decline, Nestle I 7425 (Jul) to 9610 (Nov).

## Comparison with the earlier single-read file (opened only after both passes)
Compared for all rows it has in the same series/class/month: Swiss bearer rows and Daimler, BMW, IBJ, IBM. Differences:
- Nestle N 1986-01: mine 4490, earlier 4500 (0.2 percent).
- SBG I 1986-11: mine 6035, earlier 6040 (0.1 percent; line start of the SBG entry is partly clipped by the p.H. frame, "6050 90tt ... 40 30 5": my 6035 kept).
- Everything else agrees: all other overlapping values are identical.
- Rows I have that the earlier file lacks: SBG I 1986-04, Swissair bearer (earlier file read only the registered share), BMW from 1986-07 to 1987-01, Daimler 1987-01, IBJ 1986-03 and 1987-01, IBM 1986-12 and 1987-01 (earlier file covers foreign lists only to December and has IBM December from the 2 January table).
No difference larger than one percent, so no further re-crop was required.

## Problems
- No Swiss table in the issue 1986-04-01 (March 1986 Swiss missing).
- Frankfurt vs JdG small unexplained differences for BMW.
- Pass 2 not blind (see above): the honest error rate is probably below 1 percent of values (misreads of one digit in an expanded running-text price are the main risk, 2 to 3 lines such as SBV Jan 1987, SBG Nov 1986 and Swissair Dec 1986 required careful expansion); I estimate 0 to 2 wrong values among 146.
