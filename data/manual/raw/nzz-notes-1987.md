# NZZ readings 1987-02 to 1987-12: notes

131 values, 11 month ends, every value read twice (two passes with separate crops, pass 2 made without looking at pass 1) and compared by script. Rows: 8 Swiss (Nestle I and N, SBG, SBV, SKA, Swissair, Sandoz, Ciba-Geigy, all bearer except Nestle N) and 4 foreign (Daimler-Benz, BMW, IBJ, IBM) per month, minus IBJ 1987-08.

## Issues used (issue date, quote date, PDF pages = index+1)
| month | issue | quote date | Swiss | Frankfurt | Tokio | New York |
|---|---|---|---|---|---|---|
| 02 | 1987-02-28 | 02-27 | 25 | 27 | 27 | 29 |
| 03 | 1987-04-01 | 03-31 | 25 | 27 | 27 | 29 |
| 04 | 1987-05-02 | 04-30 | 25 | 27 | 27 | 29 |
| 05 | 1987-05-30 | 05-29 | 43 | 45 | 46 | 47 |
| 06 | 1987-07-01 | 06-30 | 41 | 43 | 44 | 45 |
| 07 | 1987-08-03 | 07-31 | 27 | 29 | 30 | 31 |
| 08 | 1987-09-01 | 08-31 | 41 | 45 | 46 | 47 |
| 09 | 1987-10-01 | 09-30 | 41 | 45 | 46 | 47 |
| 10 | 1987-10-31 | 10-30 | 45 | 47 | 48 | 49 |
| 11 | 1987-12-01 | 11-30 | 41 | 45 | 46 | 47 |
| 12 | 1987-12-31 | 12-30 | 39 | 43 | 44 | 45 |
Header of each table "Kurse vom <date>" was read. 1987-04: 1 May is a holiday; issue of 2 May prints 30 April for Swiss and Frankfurt; Tokio and New York tables of that issue are "Kurse vom 1. Mai", so IBJ and IBM use the Vortag column (30 April close). 1987-12: issue of 31 Dec prints 30 Dec for Swiss/Frankfurt/New York; the Tokio table shows only the column "28.12." (Tokyo closed 29-30 Dec), so IBJ is the 28 Dec close. The issue of 4 Jan 1988 was not used: onvista's last December Frankfurt close is 30 Dec, same as the 31 Dec issue (I did not verify whether Zurich traded on 31 Dec).

## Layout and convention
- Swiss: Zuercher Boerse running text, in this whole period (also from 28 Feb 1987; the earlier agents' remark that it changes is true only in the sense that forward/option quotes now carry month markers). Format `Name pH (Vortag) first price ... R second-session prices`. After a price a suffix marks forward/option deals with the delivery month (Mai, Jun, Jul, Aug, Sep, Okt/Nov/Dez/Jan/Feb/Maer, depending on the date), `kt`/`dt` = forward / premium deals, `L` = Losgeschaeft (trade in the call). Close used = last price of the day without a month mark and without kt/dt; L counted as cash. Participation certificate lines (PS) share the paragraph; SKA "I + PS" is one combined line (Inh. and PS quoted together) and "N + PS" another. Abbreviated figures ("1090" after "1100") are always written out in full in the paper in this period.
- This is a convention, not a printed closing price; the 'last unmarked price' can differ from an official close. The Vortag bracket of the next day was not systematically checked.
- Frankfurt, Tokio, New York: columns Jahres-H./T., Vortag, Tages-H., T., Tagesschluss. Tagesschluss = last quote (closing price). Frankfurt table is headed "Frankfurt", Tokio "Tokio", New York columns H, T, Schluss with volume.

## Controls
- IBM printed / Yahoo (data/raw/yahoo/ibm.csv): 02 4.177, 03 4.194, 04 4.187, 05 4.194, 06 4.207 (163 3/8), 07 4.184, 08 4.190, 09 4.184, 10 4.201, 11 4.203, 12 4.234. Range 4.177-4.234 against the expected about 4.18; the slow upward drift and December 4.234 reflect Yahoo's 31 Dec versus the 30 Dec printed close (IBM closed higher on 31 Dec). No month is off by a row or date error.
- Frankfurt Dec 1987 against onvista (mercedes-raw.csv, bmw-raw.csv, 30 Dec 1987): Daimler printed 575 DM / 23.5586 = 24.407 vs onvista 24.4072 (exact); BMW 447 / 50.8516 = 8.790 vs onvista 8.7904 (exact). So Tagesschluss in the NZZ Frankfurt list equals the onvista closing price. This is the only exact Frankfurt control in the period (JdG print rows end in 1986).
- Cross-month Swiss sanity: Nestle I 11025 (09) to 8350 (10) to 7850 (11), SBG 5050 to 3925 to 3400, Daimler 1066 to 813 to 623, IBM 150.75 to 123 to 111.25: the October crash is real, consistent between Zurich, Frankfurt and New York on the same date (30 Oct). Nestle I/N price ratio 1.9-2.0 stable. No splits or nominal changes seen in this period (Jahreshoch/-tief columns of the foreign lists and the Swiss text show none). Hero, Globus etc. not read.
- Nestle registered: priced 3975-5400 CHF, opens at about half the bearer. The 1988 opening of the register is outside this period.
- Nestle Namen controls from Yahoo exist only from 1990: not applicable.

## Double reading
- 132 values read in pass 1 (including IBJ 1987-08 = dash), 131 numeric. Pass 2 agreed on 129 of 131 (98.5 percent). Disagreements, both resolved by a third reading at 4x magnification:
  - 1987-05 Swissair I: pass 1 1265, pass 2 1260. Sequence "1265 1260JunL 1260 N": last price without month mark is 1260 (pass 1 had taken 1265 from before the Jun-marked quote). eye3 = 1260.
  - 1987-06 IBM: pass 1 163 3/4, pass 2 163 3/8. Third reading 163 3/8 = 163.375 (low 163 1/8, Vortag 165 1/2). eye3 = 163.375.
- Process note: for 1987-02 and 1987-03 the first-pass Swiss rows were found with trial crops while I was still working out the layout; before pass 2 I overwrote that first file for those 16 values with a clean pass-1 reading from fresh crops. Pass 2 for them was made afterwards with new crops. Those two months therefore had somewhat more looking than the others, but pass 1 and pass 2 are still separate readings.

## Dropped
- IBJ 1987-08: Tagesschluss column prints a dash for 31 Aug (Vortag 4080, T 4000); left out rather than substituting.
- Quote ambiguities where the final price is only given in a line continuing across columns (Nestle I 1987-07, 1987-10) were read across both column parts; both passes agree.

## Honest error estimate
Pass agreement 98.5 percent; the remaining risk is mainly the convention (last unmarked price versus an official close) in Swiss rows, probably a few CHF-ticks off in individual rows where L-marked or late forward-marked prices follow, and the same misread by me in both passes (misreading the same digit twice). Estimated 1-2 percent of the Swiss values off by one tick; foreign rows (printed Schluss columns, Dec Frankfurt exact) below 1 percent.
