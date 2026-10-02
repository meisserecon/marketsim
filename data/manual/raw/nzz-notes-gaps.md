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
