# Swiss dividends from the NZZ archive: notes

Status: PARTIAL. Nestle (20 of 22 years, 1994/1999/2000 missing), Bankgesellschaft (all 19 years, 1979-1997),
Swissair (1 year), SKA (7 years of amounts, no payment months), Sandoz (17 years, financial years 1979-1995, see the Sandoz section),
Bankverein (18 of 19 years, FY1997 missing; see the Bankverein section). Ciba-Geigy: nothing yet.
Output: `raw-swiss-dividends.csv` (company codes: nestle, ubs = Bankgesellschaft, sbv, credit-suisse, swissair, sandoz, ciba-geigy).
Every line cites the NZZ issue date and page. Amounts are as declared, gross, per the share class printed, not adjusted.

## Method that worked

The archive search (OCR text) is good for the companies' own paid notices, poor for tables. The reliable recipe:

1. Find the day of the payment notice. Search a phrase that the notice contains, in a window of a few weeks around the meeting:
   - Nestle: `"Zahlung der Dividende"` (header "NESTLE AG, CHAM und VEVEY / Zahlung der Dividende") or `"Cham und Vevey"`; May to June.
   - Bankgesellschaft: `"Dividende brutto"` (1990-1998), `"pro Inhaberaktie"` (1980-1987), `Dividendenzahlung` (some years); April.
   - The meeting report in the business section ("GV der Schweizerischen Bankgesellschaft") gives the meeting day; the notice is printed 0 to 3 days later.
2. Restrict the search to the notice's single day and use a distinctive word from the notice; the result snippet starts at that word and often
   contains the key sentence in clean OCR: `zahlbar` (Nestle: "gemaess Beschluss der Generalversammlung vom X ... zahlbar ab Y"), `brutto`
   (amount per share), `"Zahlung erfolgt"` and `spesenfrei` (Bankgesellschaft: "Die Zahlung erfolgt ab ..." / "Coupons Nr. N ... sind ab Y spesenfrei").
3. Where the snippet does not give the number or date, open the page in the viewer, zoom with a synthetic ctrl+wheel event (8-10 ticks at the
   notice) and read the notice from a screenshot. Notices are large and legible at that zoom.
4. Cross-check: the 35% withholding tax printed in the notice (Fr. 40.25 on 115, Fr. 11.20 on 32 ...) must equal 35% of the gross.

Practical problems: the viewer is slow (10-30 s per issue), the browser tool froze several times and the "zoom" action of the screenshot tool
leaves the tab at a wrong viewport; I stopped using it. Back navigation hangs; the "Trefferliste" button works.

## Calibration

Nestle, declared amount (NZZ) / divisor (1000 before Sept 1992, 100 after) against `nestle.csv`:
1981 (FY1980): Fr. 75 -> 0.075 (file 0.075); 1982: 85 -> 0.085 (0.085); 1983: 96 -> 0.096 (0.096); 1984: 109 -> 0.109 (0.109);
1986: 145 (0.145); 1987: 145 (0.145); 1988: 150 -> 0.15 (0.15); 1989: 175 (0.175); 1990: 200 (0.2); 1991: 200 (0.2); 1992: 215 (0.215);
1993: 23.50 / 100 = 0.235 (0.235); 1995: 26.50 (0.265); 1996: 26.50 (0.265); 1997: 30 (0.30); 1998: 35 (0.35); 2001: 55 (0.55).
All 20 years read agree exactly with the company's own table, so the reading method is sound. 1985 (115) is derived from the printed tax
(Fr. 40.25) because the gross figure itself was not in the OCR snippet; it also agrees (0.115).
Bankgesellschaft 1982 (Fr. 100), 1988 (Fr. 120) and 1995 (Fr. 32) were read from page images and cross-read between OCR and image.
Plausibility against the raw month-end prices: Nestle 85/3305 = 2.6% (Apr 1982), 175/7540 = 2.3% (Apr 1989); SBG 100/2930 = 3.4% (1982),
120/3240 = 3.7% (1989); Swissair 40/1040 = 3.8% (1989). All inside 0.5-6%.

## Nestle: payment months (by year of payment)

| paid | meeting | from | notice |
|---|---|---|---|
| 1980 | 22 May | 27 May | NZZ 27.05.1980 p25 |
| 1981 | 14 May | 18 May | 18.05.1981 p10 |
| 1982 | 13 May | 18 May | 17.05.1982 p22 |
| 1983 | 19 May | 24 May | 24.05.1983 p39 |
| 1984 | not read | 21 May | 21.05.1984 p39 / 29.05.1984 p43 |
| 1985 | 23 May | 28 May | 28.05.1985 p8 |
| 1986 | not read | 20 May | 20.05.1986 p53 |
| 1987 | 21 May | 25 May | 25.05.1987 p27 |
| 1988 | 19 May | 24 May | 24.05.1988 p26 |
| 1989 | not read | 29 May | 29.05.1989 p42 |
| 1990 | 31 May | **5 June** | 05.06.1990 p41 |
| 1991 | not read | **3 June** | 03.06.1991 p13 |
| 1992 | 21 May | 25 May | 25.05.1992 p20 |
| 1993 | 27 May | **June** (day lost in OCR; notice printed 1 June) | 01.06.1993 p44 |
| 1994 | missing | | no notice found |
| 1995 | 1 June | **6 June** | 06.06.1995 p30 |
| 1996 | 30 May | **5 June** | 05.06.1996 p30 |
| 1997 | 5 June | **11 June** | 11.06.1997 p29 |
| 1998 | 28 May | **3 June** | 03.06.1998 p44 |
| 1999 | missing | | no notice found (searches for "Cham und Vevey", "Zahlung der Dividende", "Nestle AG" gave only warrants) |
| 2000 | missing | | no notice found |
| 2001 | 5 April | **11 April** | 11.04.2001 p71 |

So the assumed May is wrong for 1990, 1991, 1993, 1995-1998 (June) and 2001 (April). Nestle also paid dividends on participation
certificates (PS) in 1986-1993; and the twin share Unilac (US-$ 0.70 in 1980) is a separate security, not recorded.
Class: bearer (I) until the unification of the classes in 1993, then the single registered share (N). The 1:10 split of 1.9.1992 is visible:
FY1991 Fr. 215 (paid May 1992), FY1992 Fr. 23.50 (paid June 1993).

## Bankgesellschaft (ubs): all years found, April (May in 1993, 1994, 1995)

Bearer / registered / PS per year in `raw-swiss-dividends.csv`. Sequence of the bearer share: 100 (FY1979-FY1982), 110 (FY1983), 115 (FY1984),
120 (FY1985), 160 (FY1986, "inklusive Jubilaeumsbonus", 125-year anniversary; the split between ordinary dividend and bonus is not stated in the notice),
120 (FY1987, FY1988), 135 (FY1989, FY1990, FY1991), then, after the 1992 split of the bearer share (the price series divides by a further 5 from July 1992; the notices themselves do not state
the split ratio): 29 (FY1992), 32 (FY1993, FY1994, FY1995, FY1996), 50 (FY1997).
Payment dates: 28 Apr 1980 (late, linked to a rights issue), 3 Apr 1981, 19 Apr 1982, 11 Apr 1983, 11 Apr 1984, 22 Apr 1985, 14 Apr 1986,
13 Apr 1987, 11 Apr 1988, 18 Apr 1989, 30 Apr 1990, 22 Apr 1991, 1992 not read (notice 24 April), 5 May 1993, 5 May 1994, 3 May 1995, 18 Apr 1996,
22 Apr 1997, 27 Apr 1998.
Unusual:
- FY1986 160 includes the anniversary bonus (see above); no separate bonus line could be made.
- FY1997 Fr. 50 / 10: the notice says "Geschaeftsjahr 1997, abgeschlossen per 30. September" (short financial year before the merger?). The
  notice gives no reason; Fr. 50 is higher than Fr. 32 of the preceding years. Last SBG dividend; paid 27 April 1998, the merger with the Bankverein was
  completed in June 1998.
- Subscription rights: capital increases of the Bankgesellschaft are announced in prospectuses at 11.04.1980 (p43), 03.04.1981 (p58),
  06.04.1984 (p42-43), 19.04.1985 (p45-46), and 1982 (option reductions on 26.04.1983 p20 are a notice to option holders, not a dividend).
  Their terms (ratios, issue price) were not read, so no "rights" lines were recorded.
- The notice of 24.04.1992 p61 (FY1991: I 135, N 27) was read as OCR text only; payment date not read.
- The FY1990 notice (18.04.1991) prints "Coupons Nr. 5"; the neighbouring years print 3 (1990) and 27 (1993), i.e. different numbering series.
  Irrelevant for amounts.

## Kreditanstalt (credit-suisse)

Only a retrospective table was read: the exchange-offer prospectus of CS Holding (NZZ 17.04.1989 p33) lists the combined dividend of one
SKA bearer share with its attached participation certificate for 1982-1988: 82.50, 94, 100, 106, 107, 108, 108 (PS part 2.50, 4, 5, 6, 7, 8, 8).
The NZZ price series quotes this unit as "I+PS" (see `normClass` in `nzz.ts`), so these combined amounts are the right match for the prices.
The payment months were not read (SKA general meetings were in spring). CS Holding's own registered shares (nominal Fr. 100) paid 5, 8, 10, 12, 14, 16, 16
francs (5% to 16%) 1982-1988 per the same prospectus; not recorded (different security). A 1993 notice of 21.04.1993 p27 lists "Fr. 26 / 130 / 26"
(likely SKA/CS Holding PS, registered, bearer), not verified.

## Swissair

FY1989: bearer share Fr. 40, Genussschein Fr. 8, coupon 56, paid from 30 April 1990 (NZZ 30.04.1990 p47). The same page shows a 1992 snippet
(02.05.1992 p50: "Fr. 72 ... Fr. 36") that belongs to Forbo, not to Swissair. Further years not read.

## Sandoz

FY1980: Fr. 65 per share (bearer), Fr. 13 per PS, coupon 47, "von heute an" in a notice dated Basel, 18 May 1981 (NZZ 18.05.1981 p10).
A report of 06.05.1982 p19 gives the general meeting of 1982 as 5 May 1982; no payment notice found.

## Not done / why

Bankverein: the NZZ notices could not be found with the phrases that work for the other banks (searches "Dividendenzahlung", "des Schweizerischen
Bankvereins", "Dividende brutto" in the meeting windows give other companies or prospectuses). The 1982 market report of 03.04.1982 p23 prints the Bankverein
bearer share ex dividend ("307xD") on 2 April 1982, which fixes the ex-date but not the amount. General meeting 1997 was on 16 May 1997 (NZZ 25.04.1997 p68).
Ciba-Geigy, Sandoz (other years), Swissair (other years): the search phrases "CIBA-GEIGY AG", "Generalversammlung der Ciba-Geigy", "SANDOZ AG" gave no notices;
the OCR spells the name in many ways. Next step would be to find the meeting day from the report of the general meeting and then query the next day
with `Dividende`, `Coupon`, `brutto`, `spesenfrei` as for the Bankgesellschaft.

## Reliability

Nestle and Bankgesellschaft values are read from the companies' own paid notices and, for Nestle, agree 20 of 20 with the company's table;
the Bankgesellschaft values satisfy the printed 35% tax arithmetic where checked. Other lines (SKA table, Swissair 1989) are single readings.

## Sandoz (second pass): financial years 1979-1995 all found

Payments of 1980 to 1996, 17 of 17 years. Per-line sources in `raw-swiss-dividends.csv` (company `sandoz`). The older Sandoz paragraph above (FY1980 only) is superseded.

Phrases that worked (archive OCR search, whole 1980-1997 range, quoted):
- `"Kasse der Sandoz AG"` finds the payment notice of 1982 to 1985 (sentence "an der Kasse der Sandoz AG sowie bei saemtlichen Geschaeftsstellen ...").
- `"Generalversammlung der Aktionaere der Sandoz"` (the OCR also writes SANDOZ in capitals) finds the notices of 1986 to 1995 in one search over 1985-1996.
  Notice header "Dividende fuer das Geschaeftsjahr N", "Von heute an wird Coupon Nr. N ..." or "Der Coupon Nr. N ... koennen ab <Tag> eingeloest werden".
- `"Generalversammlung der Sandoz"`, `"Generalversammlung der Sandoz AG"`, `"Aktionaere der SANDOZ"` find meeting reports (1980, 1983, 1988, 1996). The 1996 notice was found with `"Sandoz AG"` in the days after the meeting.
- FY1979 and FY1987 come from the meeting reports only (no notice found). Everything else is from the company's own notice.
Mechanics: result item -> open page -> synthetic ctrl+wheel on the notice (8 to 10 ticks) -> screenshot. Every notice prints gross, 35 % tax and net; they agree in all years read (e.g. 150 / 52.50 / 97.50).

Year table (gross per bearer share "Aktie" as printed; amount; paid; yield = amount / printed month-end bearer price of the payment month, April 1996 / May in the other years):

| FY | amount | paid | yield | source |
|---|---|---|---|---|
| 1979 | 65 | May 1980 (meeting 7 May; month from meeting date) | 1.8 % | meeting report NZZ 08.05.1980 p23 |
| 1980 | 65 | 18 May 1981 | 1.6 % | notice NZZ 18.05.1981 p10 (earlier agent) |
| 1981 | 65 | 6 May 1982 | 1.6 % | notice 06.05.1982 p32 |
| 1982 | 72.50 | 6 May 1983 | 1.5 % | notice (archive label 04.05.1983 p31, dated 6 May) |
| 1983 | 80 | 21 May 1984 | 1.2 % | notice 21.05.1984 p12 |
| 1984 | 90 | 8 May 1985 | 1.1 % | notice 08.05.1985 p58 |
| 1985 | 100 + 20 anniversary bonus = 120 | 21 May 1986 | 1.0 % (0.8 % ordinary) | notice 20.05.1986 p58 |
| 1986 | 105 | 7 May 1987 | 0.9 % | notice 07.05.1987 p30 |
| 1987 | 110 | May 1988 (meeting 3 May; month from meeting date) | 0.9 % | meeting report 04.05.1988 p33 |
| 1988 | 120 | 12 May 1989 | 1.1 % | notice 12.05.1989 p15 |
| 1989 | 150 | 14 May 1990 | 1.3 % | notice 14.05.1990 p6 |
| 1990 | 150 | 17 May 1991 | 1.2 % (old basis; May 1991 new-basis price 2520 x 5) | notice 17.05.1991 p16 |
| 1991 | 35 | 15 May 1992 | 1.2 % | notice 15.05.1992 p41 |
| 1992 | 47 | 10 May 1993 | 1.4 % | notice 10.05.1993 p18 |
| 1993 | 58 | 16 May 1994 | 1.6 % (April 1994 price 3710, old basis) | notice 16.05.1994 p28 |
| 1994 | 12 | 15 May 1995 | 1.5 % | notice 15.05.1995 p6 |
| 1995 | 15 | 26 April 1996 | 1.1 % | notice 26.04.1996 p44; meeting report 24.04.1996 p25 ("von 12 auf 15 Fr.") |

All yields lie between 0.8 and 1.8 percent (Sandoz was a low-yield share), none outside 0.5-6 percent. The series is smooth except at the split years:
65, 65, 65, 72.5, 80, 90, 120 (with bonus), 105, 110, 120, 150, 150, then 35 after the 1991 split, 47, 58, then 12 after the 1994 split, 15.

Splits and capital information met on the way:
- Nominal as stated in the meeting reports: bearer share Fr. 250, PS Fr. 50 (1983 and 1988). The notices of the 1980s have columns "Aktie" and "Partizipationsschein" only; the registered share is not listed
  separately, so no registered-share rows were recorded. From the 1991 payment on the notice has one column "Aktie und Partizipationsschein" (same amount), recorded as I and PS lines.
- 1985: the Fr. 20 per share (Fr. 4 per PS) anniversary bonus (100 years) is paid on the same coupon 52 as the dividend: separate `anniversary_bonus` line, gross total 120, net 78.
- 1991: the meeting of 15 May 1991 decided a nominal-value increase, the 1-for-5 split and a rights/option offer (NZZ 23.05.1991 p73, 07.06.1991 p13 and p56). FY1990 (150, paid 17 May 1991) is on the old basis;
  FY1991 (35) is the first dividend on the new basis, i.e. 175 on the old basis (+17 percent).
- 1994: the meeting of 5 May 1994 decided the second split (NZZ 13.05.1994 p16; registered share split reported 25.10.1994 p40). FY1993 (58, paid 16 May 1994) is on the old basis, FY1994 (12) on the new one
  (60 old-basis equivalent).
- Coupon numbers: 47 (1981), 48, 49, 50, 51, 52 (1986), 54 (1987), 56 (1989), 57, 58 (1991); new series Coupon 1 (1992), 2, 3 (1994), 27 (1995), 28 (1996).
- The page labelled 04.05.1983 p31 carries a notice dated "Basel, den 6. Mai 1983"; the archive's issue date for that page seems wrong (the same text is also found at 06.05.1983 p54).
  I took 6 May as the payment day and 5 May as meeting date (meeting report 06.05.1983 p19 datelined 5 May).
- No subscription-right terms were read.

Years missing: none. Weak points: FY1979 and FY1987 have no payment day (month from meeting date; the notices of those years were not found).

## Schweizerischer Bankverein (SBV): financial years 1979-1996 found, 1997 missing

Payments of 1980 to 1997: 18 of 19 years found. FY1997 (paid April 1998, just before the merger) was not found. Rows in `raw-swiss-dividends.csv` (company `sbv`).

Phrases that worked:
- The SBV notice is a boxed advertisement headed "Schweizerischer Bankverein / Societe de Banque Suisse / Societa di Banca Svizzera / Dividende fuer <financial year>".
  `"Dividende fuer 1981"`, `"Dividende fuer 1982"`, `"Dividende fuer 1983"`, `"Dividende fuer 1986"`, `"Dividende fuer 1987"` found the notice in a window of about 20 March to 20 April of the following year;
  for FY1988 `"Dividende fuer das Geschaeftsjahr 1988"` did it. The OCR hid the heading in other years. FY1979 was found with `"Namen- und Inhaberaktien"` in the window around 26 March 1980.
- `"Generalversammlung unserer Aktionaere"` in a window around the meeting finds the sentence "Die Generalversammlung unserer Aktionaere vom <Tag> hat die Dividende ..." (FY1984, FY1985, FY1986, FY1989).
- `"Coupons Nr. N ab Inhaberaktien"` (N = 2 in 1991, 3 in 1992; the coupon series restarted at 1 in 1990) found FY1990 and FY1991.
- `Wahldividende` (single word, March-June 1993), `"Namenaktien von je Fr. 50 Nennwert"` (1993-94 window) and `"Banca Svizzera Dividende"` found FY1992, FY1993 and FY1994; `"CHF 50 Nennwert"` and
  `"Dividende fuer das Geschaeftsjahr 1995"` found the 1996 choice dividend; `"Generalversammlung des Schweizerischen Bankvereins"` found the invitations and the 1997 nominal repayment.
- `"Coupons Nr. 40"` for 1981 found the capital increase prospectus with the dividend table.

Year table (gross per bearer share; nominal Fr. 100; paid; yield = amount / printed month-end bearer price of the payment month):

| FY | amount | paid | yield | source |
|---|---|---|---|---|
| 1979 | 10 | 28 March 1980 | 2.7 % | notice 26.03.1980 p22 |
| 1980 | 10 | April 1981 (meeting 31 March; month from meeting date) | 2.7-3.0 % | prospectus table NZZ 13.04.1981 p37 (10.- every year 1976-1980) |
| 1981 | 10 | 1 April 1982 | 3.4 % | notice 31.03.1982 p11 |
| 1982 | 10 | 31 March 1983 | 3.1 % | notice 30.03.1983 p27 |
| 1983 | 11 | 5 April 1984 | 3.2 % | notice 04.04.1984 p43 |
| 1984 | 12 | 4 April 1985 | 3.1 % | notice 03.04.1985 p36 |
| 1985 | 13 | 4 April 1986 | 2.2 % | notice 03.04.1986 p10 |
| 1986 | 13 | 2 April 1987 | 3.0 % | notice 01.04.1987 p43 |
| 1987 | 13 | 31 March 1988 | 3.9 % | notice 30.03.1988 p48 |
| 1988 | 13 | 6 April 1989 | 4.1 % | notice 05.04.1989 p73 |
| 1989 | 14 | 12 April 1990 | 4.9 % | notice 11.04.1990 p28 |
| 1990 | 14 | 2 May 1991 | 4.1 % | notice 02.05.1991 p40 |
| 1991 | 14 | 16 April 1992 | 5.2 % | notice 15.04.1992 p28 |
| 1992 | 14 (choice dividend) | cash from 3 May 1993 | 3.8 % | notice 16.04.1993 p60 |
| 1993 | 16 bearer / 8 registered (choice dividend) | cash from 16 May 1994 | 4.1 % | notice 29.04.1994 p56 |
| 1994 | 16 bearer / 8 registered | 24 April 1995 | 4.2 % | notice 20.04.1995 p30 |
| 1995 | 16 bearer / 8 registered (choice dividend) | cash from 28 May 1996 (ex 13 May) | 3.4 % | notice 13.05.1996 p35 |
| 1996 | no dividend; Fr. 10 per registered share nominal repayment | 28 July 1997 | 2.4 % (registered share price 409) | notice 15.05.1997 p62 |
| 1997 | not found | | | |

All yields lie inside 0.5-6 percent. The highest are 1989 (4.9 %, April 1990 price 285) and 1991 (5.2 %, April 1992 price 271); the lowest 1985 (2.2 %, price 580 after the 1986 rise).
The series 10, 10, 10, 10, 11, 12, 13, 13, 13, 13, 14, 14, 14, 14, 16, 16, 16 is smooth.

Unusual and important:
- From FY1992 the Bankverein paid a **choice dividend** (Wahldividende): the shareholder chose cash (net of 35 % tax: 9.10 on 14, 10.40 on 16 per bearer share) or new shares for a fixed price with dividend
  entitlements as subscription rights (FY1992: 35 entitlements per new bearer share at Fr. 300; FY1993: 34 entitlements; FY1995: 41 entitlements per new registered share of CHF 50 at CHF 213.20).
  The CSV records the declared gross amount and the cash date. Warrants ("Optionen") on bearer and registered shares were issued alongside in 1993, 1994 and 1996; not recorded as lines.
- 14 April 1993: the meeting converted the participation certificates (Fr. 100) 1:1 into bearer shares of Fr. 100 and split the registered share of Fr. 100 into two of Fr. 50; trading in the old registered
  share ended on 15 April 1993 (NZZ 15.04.1993 p26). FY1992 is therefore the last dividend on PS; from FY1993 the two classes carry different amounts (bearer Fr. 100 -> 16, registered Fr. 50 -> 8).
- 13 May to 28 June 1996: the bearer share was converted into two registered shares (the "Einheitsnamenaktie", nominal CHF 50). The FY1995 notice is the last dividend on the bearer share; per registered share it is 8.
- FY1996: no dividend. Instead the meeting of 13 May 1997 decided a repayment of nominal value of CHF 10 per registered share (CHF 50 to CHF 40), paid on 28 July 1997 net, without withholding tax;
  recorded as `nominal_repayment`, amount 10.
- Capital increase of spring 1981 (meeting 31 March 1981): 810,700 bearer and 841,900 registered shares of Fr. 100, 396,000 PS of Fr. 100 (NZZ 13.04.1981 p37); issue ratio and price not read.
  Options for PS holders were issued in 1983 (terms not read).
- Ex date of FY1981: the notice says 1 April 1982; the earlier agent's market table note (307xD on 2 April) shows the day after.
- The 1979 notice (26.03.1980) has the registered share ex dividend on 26 March and the bearer share and PS on 28 March, the day of payment.

Missing: FY1997. The meeting was on 15 April 1998, the last one of the Bankverein (NZZ 16.04.1998 p25 reports it without the dividend). Searches "Dividende fuer 1997", "je Namenaktie", "CHF 40 Nennwert",
Wahldividende and "Schweizerischer Bankverein" for 14 to 30 April 1998 found only other companies. FY1980 is from a prospectus table and the meeting date, not from a payment notice.

Reliability: all amounts and dates were read from page images (OCR snippets only to find the page); gross/tax/net agree arithmetically where read (the net lines of FY1979, FY1984, FY1985, FY1987 and the
registered-share tax of 1996 were not read). I judge the Bankverein series reliable. The weaker points: FY1980 (table, not notice) and the interpretation of the choice dividends (the gross amount is what
the paper calls the dividend).
