# NZZ second reading, month ends 1983-01 to 1984-03: verification notes

Second reading file: `nzz-readings-1983a-second.csv` (320 rows, 15 months). Read blind: for each month the first agent's rows
(`nzz-readings-1983-1985.csv`) were opened only after my rows for that month were written. First file not edited.
Comparison key: series + share class, exact numeric equality.

## Per month

| month (issue) | my rows | compared with first | agreed | corrected | left unresolved | mine only (no first row) | first only (not in mine) |
|---|---|---|---|---|---|---|---|
| 1983-01 (02-01) | 23 | none (first never read) | - | - | 0 | 23 | - |
| 1983-02 (03-01) | 23 | none | - | - | 0 | 23 | - |
| 1983-03 (04-02) | 22 | none | - | - | 0 | 22 | - |
| 1983-04 (04-30) | 22 | none | - | - | 0 | 22 | - |
| 1983-05 (06-01) | 22 | none | - | - | 0 | 22 | - |
| 1983-06 (07-01) | 22 | 22 | 22 | 0 | 0 | 0 | 0 |
| 1983-07 (07-30) | 23 | 22 | 22 | 0 | 0 | 1 (Siemens 361.50) | 0 |
| 1983-08 (09-01) | 22 | 22 | 22 | 0 | 0 | 0 | 0 |
| 1983-09 (10-01) | 23 | 23 | 23 | 0 | 0 | 0 | 0 |
| 1983-10 (11-01) | 23 | 22 | 22 | 0 | 0 | 1 (Siemens 385.50) | 0 |
| 1983-11 (12-01) | 23 | 23 | 22 | 1: Siemens, first 380 (= Vortag), mine 382.50 (Schluss); third read at 5x: Schluss 382.50, Vortag 380 | 0 | 0 | 0 |
| 1983-12 (12-31) | 5 | 5 | 5 | 0 | 0 | 0 | 0 |
| 1984-01 (02-01) | 20 | 17 | 16 | 1: SLB, first 46.5, mine first 45.25 (took Vortag), third read at 3x: Tagesschluss 46 1/2; first agent right, my row corrected to 46.5 | 0 | 4 (SBG I 3555, SBG N 667, Ciba N 980, Sandoz PS 1125; SBG PS 125.50 added after seeing first row, not blind) | 0 |
| 1984-02 (03-01) | 22 | 16 | 16 | 0 | 0 | 7 (Ciba I 2265, N 980, PS 1790; Nestle N 2865; Sandoz I 6900, PS 1055; Swissair I 1035) | 0 |
| 1984-03 (03-31) | 20 | 17 | 17 | 0 | 0 | 3 (Sandoz I 6775, PS 1025; Siemens 395.50) | 2 (SBG N 645, SBG PS 124) |

Totals for the nine months 1983-06 to 1984-03 that have a first reading: 178 pairs compared, 176 agreed at first comparison, 2 differed (both resolved by a third reading,
one in each direction). No value left unresolved. The first agent's tail-print rule was reproduced exactly (including L prints), so the agreement says the readings
are consistent, not that the rule is correct.

Rows in my file that the first agent has not (e.g. Swissair I 1984-02 1035, Siemens in 1983-07/10, SBG I/N 1984-01) are single readings of mine (two crops: first pass, then zoomed re-look).
First-only rows 1984-03 SBG N 645 and SBG PS 124: I did not record SBG N/PS 1984-03. The paper prints SBG Na. (642) 642 5 and PS (121 1/2) 121 1/2 2 R 1/2 3 4; I did not
reconcile these (abbreviated prints), left out.

## Months 1983-01 to 1983-05 (no first reading)
Each issue was read in a first pass from medium crops and again, later, from a different (tighter, 1.4x to 2.5x) crop of the same lines. The second look was a visual
confirmation against the recorded values without a written independent transcription, so these months are NOT strictly "two independent transcriptions". For 1983-01 the Bank block
(Swissair, SBG, SBV, SKA) was additionally re-transcribed from a new crop at the end and agreed in all 10 values. Treat 1983-01..05 as double-looked, not double-written: single-read quality plus confirmation.

## Layout notes (additions to nzz-notes-1983-1985.md)
- Swiss table "Schweizer Aktien"/"Schweizer Boersen" page number (printed): 1983-01 p19, 02 p25, 03 p19, 04 p27, 05 p25, 06 p23, 07 p19, 08 p23, 09 p25, 10 p21, 11 p25; 1984-01 p25 (idx 24), 02 p23 (idx 22), 03 p25 (idx 24).
  New York list is the page before the Frankfurt page in the year 1983 for most months; in 1984 the sequence is New York then London/Frankfurt page ("Auslandboersen").
- From January 1984 prints inside a line are abbreviated to the trailing digits (e.g. `SBG (3550) 3500 490 480 485 75 80 R 80`, meaning 3480). I expanded by replacing the last digits
  of the previous print. Single-digit ends such as `R 5` after `1065`-level prints (Swissair I 1984-03: `1060 70 65 R 5`) expand to 1065; `4 1/2 4 R 4 4 1/2 4` for SBG PS gives 124. This expansion
  is a convention and the main risk for 1984 values (Swissair I 1984-02/03, SBG I 1984-01 1984-02, Sandoz PS, Nestle I).
- 1983-03: issue 04-02 prints "Kurse vom 31. Maerz" (Good Friday 1 April closed). 1983-04: issue Saturday 04-30 prints 29 April.
- 1983-12: issue 31.12.1983 has no Swiss share table (NZZ_1983-12-31 page overviews of idx 11 to 20 viewed, no Schweizer Aktien table seen; not exhaustively searched); only Frankfurt/New York read. Frankfurt was closed 30 Dec
  (Schluss column printed "geschlossen"), so the Frankfurt rows are the Vortag column = 29 Dec close (quote_date 1983-12-29). New York rows are 30 Dec. There is no January 1984 issue in the download log
  that carries 31 Dec Swiss prices (the 1984-01-02 issue is not downloaded), so Swiss December 1983 is not readable from the files available.
- Roche: not in the Zurich table of any issue read (I did not look for a Basel list); not read. Tokio/IBJ: not read by me except noting "no IBJ" in 1983-01.

## Controls
IBM (printed / Yahoo split-adjusted), all 15 months: ratio 4.171 to 4.210 (4.184 typical, range from 1/8 steps and Yahoo rounding): 1983-01 4.184, 02 4.184, 03 4.184, 04 4.188, 05 4.175, 06 4.184, 07 4.171, 08 4.175,
09 4.184, 10 4.180, 11 4.206, 12 4.210, 1984-01 4.179, 02 4.179, 03 4.184. Passes. Same constant as the first agent's.

Frankfurt vs JdG print (rows "JdG print" in bmw/siemens/mercedes-raw.csv, months in my range):
- 1983-01 (NZZ Schluss of 31.1.): BMW 229 vs JdG 228.8, Siemens 257 vs 256.6, Daimler 391 = 391.
- 1983-03: JdG is 30 March, NZZ issue is 31 March. Compare JdG with NZZ Vortag: BMW 296 vs 295.8, Daimler 494 vs 495, Siemens 322.50 vs 321.5. (Schluss 31.3.: 299, 502.50, 329.50 do not compare.)
- 1983-04: BMW 344.50 vs 345.5, Daimler 537.80 = 537.8, Siemens 364.50 vs 365.2.
- 1983-06: BMW 384 = 384, Daimler 569 = 569, Siemens 347 vs 346.5.
So in my months the largest difference is 1 DM, mostly 0.2 to 0.7; seven of twelve differ by rounding-sized amounts, three are exactly equal. The first agent's 1984-06, 1985-03 differences of up to 6 DM are outside my months.

What the NZZ Frankfurt column is: in the paper the Frankfurt block (title "Frankfurt Duesseldorf Muenchen", header "Kurse vom <date>") has two columns headed only "Vortag" and "Schluss", with a degree mark after some Schluss values
(e.g. `KW Rheinfelden 234.50 235 °`, `WMF 172.50 171 °`) and a dash where there was no quotation. No footnote in the pages read explains the degree mark, and no mention of "Kassakurs" or "Fixing" appears in the
crops I read. So from the paper I can establish: it is a "Schluss" (closing) column, printed to 5 pfennig/50 pfennig precision for larger values and often rounded (many values are whole DM or x.50 whereas
the JdG prints values such as 228.8 and 256.6, i.e. one decimal). The pattern (NZZ rounded, JdG with decimals; difference <= 1 DM, same sign scattered) is consistent with NZZ printing a rounded closing/last
price and JdG a different quotation (fixing / amtlicher Kurs) of the same day; but that attribution is an inference, not something the paper states. For modelling use JdG/onvista values where available and treat NZZ
Frankfurt as accurate to about +-1 DM. The first agent's 0.5 to 6 DM spreads in 1984/85 are larger than I see in 1983 and may include misreads or different columns.

Other checks:
- Month-to-month Swiss bearer shares: no factor-2 jumps (Nestle I 3880 to 4950, SBG I 3210 to 3555/3480, Swissair I 770 to 1065).
- Ciba N 1983-10 940 and 1983-11 982: consistent with the bearer rise (2170 to 2350).
- No splits seen; no year high/low columns exist in this table.

## Problems
- Tail-print choice is a rule, not a printed close: the entries most at risk are lines with many t/tt/ttt prints (Ciba, Nestle, Sandoz) and 1984 abbreviated lines.
- 1984-01 SBG PS 125.50 was read after seeing the first agent's row; independent of the rule but not blind.
- Months 1983-01..05 not independently double-written (see above).
- Swiss December 1983 missing in all files.

Error estimate: for the months with agreement (178 pairs, 2 initial differences, both traced to column/previous-day confusion rather than digits) I estimate 1 to 2 percent errors among tail-print values and below 1 percent among
foreign columns. For 1983-01..05 and my single-only rows 2 to 4 percent.
