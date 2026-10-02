# NZZ readings for the ten gap month ends: notes

Output: `nzz-readings-gaps.csv`. Read by eye on 2026-10-02 from the replacement issues in `data/manual/scans/nzz/`. Page crops with a Python/Pillow tool (JPEG scans, DCTDecode, about 3650 x 5400 px; Flate scans for the later issues). Layouts as in the earlier notes (`nzz-notes-1979-1982.md` etc.). Method: pass 1 = a first crop of the line; pass 2 = a second, separately made crop, or the Vortag bracket/column of the following issue (a different place in the paper). Only values on which both agree are in the csv.

## 1979-12

- Issues: 1979-12-29 (Saturday/Sunday issue, Swiss page 13 "Kurse vom 28. Dezember", NY p15, Frankfurt p16), 1980-01-03 (p18 Frankfurt "Kurse vom 2. Januar", p19 NY), 1980-01-04 (p17 Swiss, p20 Frankfurt "Kurse vom 3. Januar").
- Swiss quote date 28 Dec 1979, last Zurich trading day of the year: the "Boersenindizes" tables of the Kreditanstalt and the Bankverein in the 4 Jan issue have columns 28.12. and 3.1. only, and the Vortag brackets of the 3 Jan table equal the 28 Dec closes for all names read but one. Zurich was closed 31 Dec and 2 Jan. Convention as in the earlier notes: close = last print without t/tt/ttt/dt mark; L (Loskurs) accepted as printed.
- Frankfurt: Frankfurt traded on Monday 31 Dec 1979: the FAZ index is 227.27 (Schluss 28 Dec) in the 29 Dec issue, but 223.99 (Vortag) in the 3 Jan table, and BMW 167 (28 Dec) against 163 (31 Dec). The 2 Jan table is headed with a vertical "geschlossen" in the Vortag column and holds the 31 Dec close in the Schluss column; read there and, independently, in the Vortag column of the 3 Jan table (same values: BMW 163, Daimler 242.50). So the Frankfurt rows are of 31 Dec while the Swiss rows are of 28 Dec. The 28 Dec Schluss values (single reading, not in the csv): BMW 167, Daimler-Benz 243.
- NY: the last NY trading day was 31 Dec (Vortag of the 2 Jan table, 64 5/8); the 28 Dec close was 64 (Schl. column, single reading). The csv has the 31 Dec value, equal to the existing row in `nzz-readings-1979-1982.csv`.
- IBJ: not in the Tokyo list of 29 Dec 1979 (listed: Alps ... Mitsubishi Est.; no Industrial Bank of Japan); Tokyo was closed 3 Jan.
- **Left out: Schweizerische Bankgesellschaft I.** The last print in the 28 Dec sequence is 3505 (3510, 3505, 3510, 3505, read twice), but the bracket in both the 2 Jan table (1980-01-03) and the 3 Jan table (1980-01-04) is (3515). All other names read (Swissair, SBV, SKA, Nestle I/N, Sandoz, Ciba-Geigy, also Aare-Tessin, BBC, Hermes) have a bracket equal to the last unmarked print, so the SBG bracket is odd; the two readings disagree and a third crop confirms both printed figures. Left out; candidates 3505 (last print) and 3515 (bracket).
- Pass agreement: 8 Swiss and Frankfurt/NY values, 7 of 8 Swiss agree with the bracket reading, 1 disagreement (SBG). Frankfurt 2 of 2, IBM 2 of 2.

## 1982-05

- Issue 1982-05-29 (Saturday/Sunday 29/30 May 1982): Swiss page 25 "Kurse vom 28. Mai" (Zurich, Vontobel), NY p27 "New Yorker Boersenkurse vom 28. Mai", Frankfurt/Duesseldorf/Muenchen p28 "Kurse vom 28. Mai". 31 May was Whit Monday (all exchanges closed), so 28 May is the last trading day of the month.
- Layout: running text as in 1980-82; the Swiss page has four narrow columns; the Zurich list of foreign shares on the same page is not the Frankfurt list and was not used. Frankfurt columns Vortag / Schluss, NY columns Vortag, Eroeff., Hoechst, Tiefst, Vol, P/E, Schl.
- SKA line is "Inh. inkl. PS" from April 1982 (class I includes the PS).
- Pass 1 and pass 2 (separate crops of the same lines, different window offsets, read without looking at pass 1): 11 of 11 agree. Compared with an earlier scratch reading by a previous (interrupted) attempt: identical.
- IBJ: not in the Tokyo list (banks listed: Bank of Tokyo, Fuji Bank).

## 1983-12

- Issues: 1983-12-30 (prints 29 Dec; p17 Swiss, p20 Frankfurt), 1983-12-31 (prints 30 Dec; the first-downloaded issue: NY p21, Frankfurt p22, but no Swiss share table anywhere on pages 13-19), 1984-01-03 (Monday 2 Jan: no stock tables in the issue), 1984-01-04 (3 Jan tables: Swiss p17, Frankfurt p20).
- Swiss: last trading day 30 Dec 1983 (Friday, printed nowhere as a table). The only print is the Vortag bracket in the 3 Jan table ('Kurse vom 3. Januar', first trading day of 1984; Tendenzen text: "startete ... ins neue Jahr"; Zurich closed 2 Jan). Brackets read in two separate crops. They are the previous close as printed; no running text of 30 Dec exists to compare with.
- Frankfurt: the 30 Dec table (31 Dec issue) is headed with 'geschlossen' in the Schluss column and its Vortag column merely repeats the Vortag column of the 29 Dec table (BMW 427, Daimler 651, BBC 227.80 are the 28 Dec closes; the 29 Dec Schluss values are 426.50, 650.50, 223.70). The earlier file took 427/651 as the 29 Dec close; the correct 29 Dec closes are BMW 426.50, Daimler-Benz 650.50 (pass 1 and pass 2 both from the 30 Dec issue; the second place, the Vortag of the 3 Jan table, shows 2 Jan values because Frankfurt traded on 2 Jan: FAZ Ende 1983 351.83 = 29 Dec Schluss). Differences to the earlier file: BMW -0.5 DM, Daimler -0.5 DM.
- IBM: 30 Dec 122 3/4, equal to the earlier file. IBJ not in the Tokyo list (Tokyo also closed 29-30 Dec).
- Pass agreement: 11 of 11.
