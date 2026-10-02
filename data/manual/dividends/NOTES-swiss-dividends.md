# Swiss dividends from the NZZ archive: notes

Status: PARTIAL. Nestle (20 of 22 years, 1994/1999/2000 missing), Bankgesellschaft (all 19 years, 1979-1997),
Swissair (1 year), SKA (7 years of amounts, no payment months), Sandoz (1 year). Bankverein, Ciba-Geigy: nothing yet.
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
the Bankgesellschaft values satisfy the printed 35% tax arithmetic where checked. Other lines (SKA table, Swissair 1989, Sandoz 1980) are single readings.
