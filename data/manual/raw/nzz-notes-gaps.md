# NZZ readings for the ten gap month ends: notes

Method: crops of the replacement issues (Python/Pillow, JPEG scans) read by eye. Pass 1 = first crop; pass 2 = a separately made crop or a second place in the paper (Vortag bracket/column of a following issue). Only values with agreement go into `nzz-readings-gaps.csv`.

Correction note: an earlier state of this branch (commits "NZZ gaps: 1979-12" to "1986-03") contained rows entered while the crop images were not being delivered to me (image requests returned "media removed"). Those rows are void and were replaced; the months below were read again once images were visible.

## 1979-12

- Issues: 1979-12-29 (Saturday/Sunday 29/30 Dec, Nr. 302): p13 Swiss "Kurse vom 28. Dezember" (Zuerich, J. Vontobel), p15-16 foreign; 1980-01-03 (p18 Frankfurt "Kurse vom 2. Januar", p19 New York "Kurse vom 2. Januar"); 1980-01-04 (p17 Swiss "Kurse vom 3. Januar", p20 Frankfurt "Kurse vom 3. Januar", columns Vortag/Schluss).
- Layout 1979: running text in paragraphs by sector, name (previous close in brackets) then prints; t/tt/ttt = forward marks, L = Loskurs, dt = block. Close = last print without t mark (an L print is accepted).
- Swiss quote date 28 Dec 1979 (Friday): Zurich traded neither 31 Dec nor 2 Jan; the brackets of the 3 Jan table equal the 28 Dec last prints for all names read except SBG.
- Frankfurt: the 29 Dec issue prints 28 Dec (not recorded here); Frankfurt traded on 31 Dec: the 2 Jan table has a single column (marked 'geschlossen') with values different from the 28 Dec Schluss (e.g. AEG 35.70 against 35.30), and the Vortag column of the 3 Jan table repeats them (AEG 35.70, BMW 163, Daimler-Benz 242.50). The Frankfurt rows are therefore of 31 Dec while the Swiss rows are of 28 Dec. (The earlier file nzz-readings-1979-1982.csv left Frankfurt 1979-12 out.)
- IBM: 31 Dec 1979 close 64 5/8 from the Vortag column of the 2 Jan New York table; Yahoo 1979-12 15.386 -> ratio 4.20.
- Tokyo/IBJ: not read for this month (the earlier notes state that the Tokyo list of these years has no Industrial Bank of Japan row; not re-checked here).
- **Left out: Schweizerische Bankgesellschaft I.** 28 Dec sequence '(3565) 3510 3505 3510 3505' (last print 3505) but the bracket of the 3 Jan table (1980-01-04, p17) is (3515); the SBG sequence of 3 Jan reads '(3515) 3530 3535 ...'. The two places disagree, and the cause is not visible; value left out.
- Pass agreement: 10 of 10 recorded values agree between pass 1 and pass 2; SBG disagrees (dropped).

## 1982-05

- Issue 1982-05-29 (Saturday/Sunday 29/30 May 1982): Swiss p24 "Kurse vom 28. Mai" (Zuerich, J. Vontobel), Frankfurt/Duesseldorf/Muenchen p27 (columns Vortag, Schluss), New York p26 ("Boersenkurse vom 28. Mai", columns Vortag, Eroeff., Hoechst, Tiefst, Vol, P/E, Schl.). 31 May was Whit Monday: all exchanges closed, so 28 May is the last trading day. Page numbers here are the image index + 1 as before.
- SKA line is "Inh. inkl. PS" (class I includes the PS from April 1982).
- Pass 1 and pass 2 were separate crops at different windows, read at separate times: 11 of 11 agree. SBG I 2915 ends with an L print (accepted by convention). No second place exists (the 1 June 1982 issue carries no Zurich table, see earlier notes).
- IBM control: 61.5 / 14.6989 = 4.184. IBJ: not read (the earlier notes state no IBJ in the Tokyo list of 1982; not re-checked).

## 1983-12

- Issues: 1983-12-30 (prints 29 Dec: Frankfurt p19 "Kurse vom 29. Dezember"), 1983-12-31 (Sat/Sun; prints 30 Dec; Auslandboersen p20-21; NO Swiss share table in that issue), 1984-01-03 (Monday 2 Jan, no tables), 1984-01-04 (p16 Swiss "Kurse vom 3. Januar", the Tendenzen text says the Zurich Boerse "startete ... ins neue Jahr"). Page numbers are image index + 1 of this session.
- Swiss: no table prints 30 Dec 1983; values are the Vortag brackets of the 3 Jan table (previous trading day = Fri 30 Dec). Eight values, each seen in two separate crops.
- Frankfurt: the 30 Dec table (31 Dec issue) says "geschlossen" in the Schluss column (FAZ index Schluss "geschl.") and its Vortag column does not move from the 28 Dec values (BMW 427, Daimler 651). The 29 Dec table (30 Dec issue) has Schluss BMW 426.50, Daimler-Benz 650.50, FAZ 351.83 = Vortag of the 30 Dec table. So 29 Dec is the last trading day; rows differ from the earlier agent's file by 0.5 DM.
- IBM 122 3/4 from the 31 Dec issue (p20); IBJ not read (see earlier notes).
- Pass agreement: 11 of 11 (Swiss values as brackets cannot be compared against a running sequence).

## 1984-12

- Issues: 1984-12-29 (Sat/Sun 29/30 Dec; Swiss p18 "Kurse vom 28. Dezember" printed page 19, Frankfurt/NY p21 printed page 22; page column = printed page), 1985-01-03 (NY printed p16 and Frankfurt p17, "Kurse vom 2. Januar" with Vortag columns), 1985-01-04 (p16 Swiss "Kurse vom 3. Januar", brackets = 28 Dec closes). Zurich closed 31 Dec-2 Jan, Frankfurt closed 31 Dec (its 2 Jan Vortag equals the 28 Dec Schluss), NY traded 31 Dec. Last trading days: Zurich/Frankfurt 28 Dec, NY 31 Dec.
- Swiss pass 1 = last unmarked print of the 28 Dec running text; pass 2 = bracket in the 1985-01-04 table. 7 of 7 agree (Nestle N: last print 300L accepted, bracket 3300).
- Left out: Swissair I. The 28 Dec line is "(1060) 1065 3 R 5 t": the closing print "5" (1065) is followed by a lone dagger on the next line; if it marks the 5 the last unmarked print is 3 = 1063, but the 3 Jan bracket is (1065). The two readings differ (1063 vs 1065), no further evidence; left out.
- Frankfurt pass 2 from a different issue; IBM 123 read in this session once (1985-01-03 table, Vortag column), second reading = the earlier agent's independent value 123 in nzz-readings-1983-1985.csv. IBM control: 123/29.4276 = 4.180. IBJ not read.
- Comparison to earlier file nzz-readings-1983-1985.csv: BMW 372, Daimler 592, IBM 123 identical.

## 1986-03

- Issue 1986-03-29 (Sat/Sun 29/30 March 1986): Swiss printed p24 "Kurse vom 27. Maerz" (Zuercher Boerse, running text), Frankfurt printed p27 "Kurse vom 28. Maerz". Easter 30 March: Zurich and Frankfurt closed 28 March (Good Friday) and 31 March; 27 March is the last trading day. The earlier file had no Swiss rows for 1986-03.
- Frankfurt: the single price column is the 27 Mar close (the second column reads "geschlossen"). Second reading is the earlier agent's independent value from another issue (both 550 and 1323).
- Swiss: two readings (overview crop and a 2.5x zoom crop); all 8 agree. No second place in the paper exists for the lines. Ambiguities: SBG I (5190 R 200 t) taken as 5190 because the t belongs to 200; SBV/SKA lines have lone t marks between prints.
- Not in the csv: IBM and IBJ. NYSE was closed on Good Friday and traded on 31 March, so the 27 March New York close is not the month end; Tokyo traded on 31 March. The month-end values are in nzz-readings-1986.csv (issue 1986-04-01).

## 1988-12

- Issues: 1988-12-30 (Zurich p37 "Kurse vom 29. Dezember"; Frankfurt p39, Tokyo p40, NY p41, all of 29 Dec), 1988-12-31 (Sat/Sun; Frankfurt/Tokyo p41-42 and NY p43 "Kurse vom 30. Dezember"; no Zurich table), 1989-01-03 (Tuesday; foreign tables "Kurse vom 2. Januar"; Zurich page not found in the pages checked), 1989-01-04 (p35 "Zuercher Boerse, Kurse vom 3. Januar"). Page = printed page.
- Zurich: 30 Dec 1988 (Friday) was a trading day but no issue prints its table; the Vortag brackets of the 3 Jan table (first trading day of 1989, Zurich closed 2 Jan) give the 30 Dec close. Eight values, each seen in two separate crops of the 4 Jan page. I did not compare against the 29 Dec running text because that is a different day. Plausibility vs 1988-11: SBV 363 -> 339, Sandoz 10575 -> 9575, Nestle I 6875 -> 7240, others within 6 percent.
- Frankfurt: the 30 Dec issue text says Frankfurt was closed on 30 Dec (last trading day of the year was 29 Dec); BMW 523 and Daimler 738 are the 29 Dec Schluss values, so quote date 29 Dec. Tokyo: closed 29-30 Dec; 28 Dec close 4350.
- Pass agreement: 8/8 Swiss, 4/4 foreign.

## 1990-12

- Issues: 1990-12-29 (Sat/Sun; Zurich printed p35 "Zuercher Boerse, Kurse vom 28. Dezember"; Frankfurt p37, Tokyo p38 "Kurse vom 28. Dezember"), 1991-01-03 (no Zurich table; Frankfurt p31, Tokyo p32, NY p33, "Kurse vom 2. Januar", Frankfurt/Tokyo with a 28.12. column, NY "Alle Vortagskurse vom 31. Dezember"), 1991-01-04 (p31 Zurich "Kurse vom 3. Januar" box: Vortag column = 28 Dec close). The earlier notes said 1990-12 could not be read; it can.
- Layout: since 1990 the box of the most traded shares with Tagesschluss column; only box shares: Sandoz bearer is not in the box (only N, PS) so Sandoz I is not recorded. All seven recorded Swiss values agree between the Tagesschluss of 28 Dec and the Vortag of 3 Jan. Frankfurt/Tokyo also from two issues.
- Last trading days: Zurich, Frankfurt, Tokyo 28 Dec; New York 31 Dec.
- Pass agreement: 11 of 11. IBM ratio 4.184.

## 1993-05

- Issues: 1993-05-29 (Sat/Sun; Swiss 'Permanent gehandelte Schweizer Aktien' box on image 44, running text on the same page, Frankfurt image 46 'Kurse vom 28. Mai', Tokyo image 47) and 1993-06-02 (Swiss image 42 and Frankfurt 46, Tokyo 47, NY 48, all 'Kurse vom 1. Juni'). 31 May 1993 was Whit Monday (Zurich, Frankfurt, New York closed (Memorial Day)); Tokyo traded. So 28 May is the last day for Zurich/Frankfurt; Tokyo 31 May. The Vortag columns of the 1 June tables equal the 28 May Schluss for all seven Swiss lines and both Frankfurt lines (pass 2).
- Nestle I, N and PS still separate lines in May 1993 (the unification came in June, see earlier notes). Swissair: no bearer line since 1993; N read in running text; Swissair bearer left out. CS Holding I and N both listed.
- Left out: IBM. The 1 June NY table (2 June issue, idx 48) has IBM Vortag 52 1/4 (31 May Memorial Day, so 28 May) but the 3/4 vs 1/4 fraction could not be settled against Yahoo (52.25 vs 52.75 give ratios 4.144 and 4.184 against 12.6076); the 29 May issue NY page was not located. Not recorded.
- Pass agreement: 10 of 10.

## 1995-12

- Issues: 1995-12-30 (Sat/Sun; Europa/Frankfurt printed p33 'Kurse vom 29. Dezember', Asien/Tokio p37; no Swiss share table), 1996-01-04 (Swiss share table printed p27 'Kurse vom 3. Januar' in the box layout 'Inland'/'Ausland', Vortag column), 1996-01-03 (not used). 
- Quote date: the Reuters piece 'Geschlossene Boersen' in the 30 Dec issue says Zurich, Basel, Geneva, Vienna, Amsterdam and Helsinki were closed ('feiertagshalber') on 29 Dec; Zurich was also closed 2 Jan. So the Vortag of the 3 Jan table is taken as the close of 28 Dec (not 29 Dec). If the Swiss closed table instead meant 29 Dec the values would be the same, no other print exists.
- Class: Nestle only N, SBG I and N, SBV I and N, Swissair N, Sandoz I, Ciba-Geigy I are listed; Nestle I, Swissair I and SKA/CS I are gone; CS Hold N left out: Vortag printed '118 3/4' or '118 7/8', the glyph is unclear in two crops. Sandoz N/Ciba N not requested. SBG/SBV N readings carry no independent control except Nestle N vs Yahoo (1276 vs 1275).
- IBM: not read (the NY list prints fractions in a font that is hard to tell apart, see 1995-1998 notes; the 3 Jan table Vortag would be 2 Jan, not 29 Dec).
- Pass agreement: 11 of 11 (Swiss: two crops; Frankfurt: crop + onvista + earlier file; IBJ: two crops).

## 1997-03

- Issue 1997-03-29 (Sat/Sun): Swiss 'Aktienmarkt Schweiz' printed p35 'Kurse vom 27. Maerz' (columns Jahres-H/T, Vortag, Tages-H/T, Volumen, Schluss; the legend says () = Tagesschlusskurs of the underlying, not relevant); Frankfurt p39 'Kurse vom 27./28. Maerz' (table header per block 'Kurse vom 27. Maerz'); Tokyo p34 'Kurse vom 27./28. Maerz' with the Tokyo block headed 28. Maerz. Easter 30 Mar: Zurich and Frankfurt closed 28 and 31 Mar; the Swiss text confirms 'am letzten, feiertagsbedingt verkuerzten Handelstag des Monats Maerz'; the last Swiss and Frankfurt day is 27 March.
- Classes: Nestle N only; Novartis I and N both read; SBG I, N (bearer share still listed), SBV I is gone (only SBV N), Swissair N (no bearer), CS Group N. Sandoz/Ciba no longer exist.
- Left out: CS Group N, SBV N (fraction glyph 1/2 vs 3/4 unclear: CS 172 3/4 or 172 1/2, SBV 307 3/4 or 307 1/2), no independent control. SBG N 259 1/2 kept because Yahoo ratio 12.08 matches 259.5 (259.75 would give 12.09, so the control is weak). SBG N, SBV N, CS N lines with the other classes (SBV I, CS I) do not exist in March 1997.
- IBM and IBJ: not recorded. The Tokyo block of 29 Mar is of 28 Mar (IBJ 1300 close); the March month end (31 Mar) is IBJ 1260 in the earlier file (issue 1997-04-01). IBM fractions not read in this period.
- Pass agreement: 8 of 8. Pass 2 Swiss values came from a second crop in a different window (Nestle, Novartis, Swissair, SBG: two separate crops each).
