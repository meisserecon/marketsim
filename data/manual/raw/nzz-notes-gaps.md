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
