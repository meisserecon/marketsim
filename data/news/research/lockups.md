# IPO lock-ups: terms, expiry and the share in the expiry month

Research of 17 October 2026 for the question whether the IPO stories should name the lock-up so that attentive players can anticipate the selling. Two agents, one per group; every figure with its source. Share and index moves are month-end changes from the game data (data/out) and the S&P 500 (data/reference). Per-share prices quoted here are research material: the metrics rule keeps them out of story text.

## Summary

| Company | Lock-up | Expiry | Share vs S&P 500, expiry month | Month after |
|---|---|---|---|---|
| Apple | 90 days (selling holders, 3.8m shares); 9 months (18 insiders, 32m of 54.6m shares) | 12 Mar 1981; 12 Sep 1981 | -7.5% vs +3.6%; -24.2% vs -5.4% | |
| Microsoft | 120 days, 21.1m of 24.7m shares | about 11 Jul 1986 | -7.3% vs -5.9% | 0.0% vs +7.1% |
| Cisco | not found | | | |
| Lehman | none (spin-off) | | | |
| Netscape | 6 months, 22.8m employee shares | about 5 Feb 1996 | -37.9% vs +0.7% | -19.1% vs +0.8% |
| Amazon | 180 days, 20.8m of 23.9m shares | 11-12 Nov 1997 | -18.9% vs +4.5% | +21.7% vs +1.6% |
| eBay | 120 days, 24.5m of 39.7m shares | 22 Jan 1999 | +15.1% vs +4.1% | +20.3% vs -3.2% |
| Nvidia | 180 days, 18.0m of 28.6m shares | 20 Jul 1999 | +5.3% vs -3.2% | +39.9% vs -0.6% |
| Pets.com | 180 days, 13.4m of 29.5m shares | 8 Aug 2000 | -40.4% vs +6.1% | -22.6% vs -5.3% |
| Xstrata | not found | | | |
| Tesla | 180 days, 79.5m of 93.1m shares | 25 Dec 2010 (first trading day 27 Dec: -15%) | -24.6% vs +6.5% | -9.5% vs +2.3% |
| Glencore | cornerstone investors 6 months; employees 1 to 5 years in stages | 24 Nov 2011; 24 May 2012 | -11.5% vs -0.5%; -24.0% vs -6.3% | -2.7% vs +0.9%; -11.6% vs +4.0% |

Not tradable in the game: theglobe.com (180 days to 12 May 1999, insiders sold in a follow-on a week later), VA Linux (180 days to 7 June 2000), Facebook (releases in stages August 2012 to May 2013; record low on the first), Alibaba (March and September 2015; below the IPO price after the second).

# Group A

# Lock-ups for aapl, msft, csco, lehman, netscape, amzn

Every figure was read on 2026-10-17. Monthly changes are month-end to month-end, computed from the game's own files: data/out/<id>.json (adjusted prices) and data/reference/sp500.json (S&P 500 price index). "Expiry month" means the month in which the lock-up ended. Some per-share figures below come from sources; under the arcs rule on metrics they belong in this research file only, not in story text.

Were lock-ups customary? Yes, already in 1980. Apple's December 1980 offering had underwriter lock-ups (90 days for the selling shareholders, nine months for 18 insiders). Microsoft's 1986 offering had a 120-day lock-up. By the mid-1990s the standard term was 180 days (Netscape 1995, Amazon 1997). Separately, Rule 144 gave restricted (privately placed) shares a 90-day floor after the offering, whatever the lock-up said.

---

## aapl - Apple Computer, IPO 12 Dec 1980

**Summary: two lock-ups. The selling shareholders (about 3.78M shares) were locked until 12 Mar 1981 (90 days). Eighteen officers, directors and major holders (32.0M shares, of 54.6M outstanding) were locked for nine months, until 12 Sep 1981, but could sell up to 10% of their holdings after 90 days at $33 or more. In the game the share fell 7.5% in March 1981 and 24.2% in September 1981, while the index rose 3.6% and fell 5.4%.**

- Source: an Apple S-1 for its employee option plans, "Preliminary Prospectus dated December 31, 1980". It restates the lock-ups from the 12 Dec 1980 IPO (prospectus File No. 2-69797). The SEC released it under FOIA request 18-02062: https://www.sec.gov/files/18-02062-FOIA.pdf (read 2026-10-17), section "Shares Eligible for Future Sale", p. 5-6 of the prospectus. The scan was OCR'd, so a few digits are uncertain; noted where it matters.
  - 54,621,932 shares outstanding after the IPO. The 5,000,000 shares sold in the IPO were freely tradable.
  - "The Selling Shareholders in the initial public offering have agreed that they will not, without the prior written consent of Morgan Stanley & Co. Incorporated and Hambrecht & Quist, offer, sell ... any of the Company's Common Stock owned by them (an aggregate of 3,775,816 shares) until March 12, 1981." The OCR reads "3,i75,816"; the second digit is most likely 7.
  - "Eighteen officers, directors and major shareholders of the Company holding an aggregate of 32,026,443 shares ... will not offer, sell ... for a period of nine months after December 12, 1980, except for sales occurring more than 90 days thereafter of amounts ... not exceeding 10% of the total number of shares ... held on December 12, 1980 ... at cash prices of not less than $33.00 per share." The IPO price was $22, so $33 is 1.5 times the offer price.
  - 31,753,231 restricted shares became eligible for sale under Rule 144 from 12 Mar 1981, subject to the agreements above.
  - About 7,144,764 "intrastate" shares became saleable in the open market after a nine-month period. Apple might also register up to 500,000 of them on or after 12 Apr 1981.
- What followed: the 1981 timeline in Apple's corporate history says that in May 1981 a "second offering of 2.6 million shares of common stock is completed." Who sold them is not stated, but this was the first big insider sale after the 90-day point. Apple Corporate Timeline (Apple-produced document, mirrored): https://downloads.reactivemicro.com/Users/Grant_Stockley/AppleCorporateTimeline.pdf (read 2026-10-17).
- Press coverage of either expiry: none found.
- Game data (data/out/aapl.json; data/reference/sp500.json):
  - Mar 1981 (90-day expiry): aapl -7.5%, S&P +3.6%. Apr 1981: aapl +15.8%, S&P -2.3%.
  - May 1981 (2.6M-share secondary): aapl +16.7%, S&P -0.2%. Jun 1981: aapl -21.5%, S&P -1.0%.
  - Sep 1981 (nine-month expiry): aapl -24.2%, S&P -5.4%. Oct 1981: aapl +31.1%, S&P +4.9%. Aug 1981 had already been -19.5% (S&P -6.2%).

---

## msft - Microsoft, IPO 13 Mar 1986

**Summary: 120-day lock-up of the company, the selling stockholders, officers and directors, about 21.07M shares (of 24.7M outstanding after the offering). It ran from the prospectus date of 13 Mar 1986 to about 11 Jul 1986. In the game the share fell 7.3% in July 1986 (S&P -5.9%) and was flat in August (S&P +7.1%).**

- Source: the Microsoft prospectus of 13 March 1986 (2,795,000 shares: 2,000,000 from the company and 795,000 from selling stockholders; Goldman Sachs and Alex. Brown were the representatives). Wayback copy: http://web.archive.org/web/20190214180418id_/http://www.lannigan.org:80/pdf/Microsoft_prospectus.pdf (read 2026-10-17). The original link https://www.lannigan.org/pdf/Microsoft_prospectus.pdf returned error 522 on 2026-10-17. The link was found via https://www.networkworld.com/article/949284/30-years-ago-a-look-back-at-microsoft-s-ipo.html (read 2026-10-17).
  - "The Company, and the Selling Stockholders, officers, and directors, holding in the aggregate approximately 21,070,000 shares of Common Stock, have agreed with the Underwriters not to offer, sell, or otherwise dispose of any shares of Common Stock for a period of 120 days after the date of this Prospectus without the prior written consent of the Representatives ..." ("Shares Eligible for Future Sale" and "Underwriting").
  - After the offering, existing holders kept 21,996,017 shares. 20,542,086 of them belonged to affiliates. About 230,000 were freely saleable at once, and about 21,766,000 became Rule 144-eligible 90 days after the prospectus. Microsoft also intended to register about 2.9M option-plan shares and 0.3M employee-purchase-plan shares about 90 days after the offering. Shares outstanding after the offering: 24,715,113.
  - The prospectus is dated 13 Mar 1986, so 120 days later is 11 Jul 1986 (my computation).
- Press coverage of the expiry: none found. Network World (link above) says institutions "sold off roughly half their shares" in the first weeks. That is unrelated to the lock-up.
- Game data: Jul 1986: msft -7.3%, S&P -5.9%. Aug 1986: msft 0.0%, S&P +7.1%. For context, Jun 1986 was msft -12.1%, S&P +1.4%.

---

## csco - Cisco Systems, IPO 16 Feb 1990

**Summary: lock-up terms NOT FOUND. The prospectus is not on EDGAR (Cisco's EDGAR filings start in 1995), and I found no press source giving the terms. If the term was 180 days, which is customary for the time but unconfirmed, it would have ended about 15 Aug 1990. In the game the share fell 2.9% in August 1990 (S&P -9.4%) and 9.1% in September 1990 (S&P -5.1%).**

- EDGAR: Cisco's submissions index (https://data.sec.gov/submissions/CIK0000858877.json, read 2026-10-17) starts in Feb 1995. There is no 1990 S-1 or 424B.
- IPO facts: 2.8M shares at $18, according to the San Francisco Chronicle in 1990 as quoted in https://oreilly.com/library/view/the-power-presenter/9780136933793/preface.xhtml (read 2026-10-17). Date 16 Feb 1990 per Cisco heritage, https://heritage.cisco.com/tag/leadership/page/2 (read 2026-10-17).
- Related but not a lock-up: the founders Bosack and Lerner sold stock after the IPO and left on 28 Aug 1990 (Lerner was fired, Bosack resigned). Accounts put their total sales at $170M or about $200M; the figures conflict. https://en.wikipedia.org/wiki/Leonard_Bosack and https://www.ebsco.com/research-starters/business-and-management/cisco-systems-goes-public (read 2026-10-17). These are later secondary accounts, not lock-up terms.
- Game data: May 1990 (a 90-day point would fall about 17 May): csco +4.1%, S&P +9.2%. Aug 1990: csco -2.9%, S&P -9.4%. Sep 1990: csco -9.1%, S&P -5.1%. Oct 1990: csco +31.1%, S&P -0.7%.
- Recommendation: do not name a lock-up length in the Cisco story unless another source turns up.

---

## lehman - Lehman Brothers, spin-off from American Express, May 1994

**Summary: not a normal IPO, so there was no underwriter lock-up. American Express distributed about 98.25M Lehman shares to its own shareholders as a dividend on 31 May 1994 (one Lehman share for every five AmEx shares). The only lock-up-like restriction was on employee shares from the Phantom Share conversion (up to 3,387,963 shares), and it "lapse[s] ratably over a three-year period". No dates for the lapses are given. In the game the share fell 16.7% in June 1994, the first month of regular trading (S&P -2.7%).**

- Source: Lehman final prospectuses dated 29 Apr 1994 (424B3, filed 4 May 1994): https://www.sec.gov/Archives/edgar/data/806085/0000950123-94-000851.txt (read 2026-10-17).
  - The only "offering" was 441,600 shares, sold by American Express to Lehman executive officers at about $25.53 for about $11.3M. Everything else was the Distribution: 98,254,243 shares to AmEx holders. Shares outstanding afterwards: 105,776,664.
  - The distributed stock was "freely transferable, except for shares ... received by persons who may be deemed to be 'affiliates' ... and shares owned by those employees ... who acquired shares through certain employee benefit plans and pursuant to the Phantom Share Conversion". Affiliates were expected to hold less than 1%.
  - Employee Ownership Plan: "There is also a restriction on transferability of the Common Stock which employees will receive upon conversion of Phantom Shares. Generally, such restrictions will lapse ratably over a three-year period."
  - Nippon Life (about 11.2% fully diluted) was not locked up. Its shares were "freely transferable" after April 1994, subject to a right of first refusal by AmEx and Lehman on sales above 2% of the voting stock in any six-month period.
- Distribution date and ratio: AmEx 10-Q 1994, https://www.sec.gov/Archives/edgar/data/0000004962/000000496294000031/0000004962-94-000031.txt (read 2026-10-17). Record date 20 May 1994, paid 31 May 1994; Lehman traded "when issued" from 2 May 1994.
- Story angle: the selling pressure in a spin-off comes from the parent's shareholders dumping shares they never chose to own. That is the opposite of a lock-up. I found no press source that documents this for Lehman in June 1994.
- Game data: Jun 1994: lehman -16.7%, S&P -2.7%. Jul 1994: lehman +5.0%, S&P +3.1%.

---

## netscape - Netscape Communications, IPO 9 Aug 1995

**Summary: about 22.8M employee shares were locked for six months (180 days) after the August 1995 IPO, which puts the end at about 5 Feb 1996. Executive selling began on 5 Feb 1996, consistent with a 180-day term. CEO Barksdale sold 1.28M shares, Andreessen 360,000, and five other executives about 1M, all between 5 and 29 Feb. In the game the share fell 37.9% in February 1996 and 19.1% in March, while the S&P rose 0.7% and 0.8%.**

- Prospectus: not on EDGAR. Netscape's filings (https://data.sec.gov/submissions/CIK0000944458.json, read 2026-10-17) start in May 1996, so I could not read the exact prospectus wording.
- Lock-up: "about 22.8 million employee shares were restricted from sale until six months after the August IPO." Bloomberg Business News in The Seattle Times, 16 Mar 1996, "Netscape Execs Sold Shares As Stock Fell": https://archive.seattletimes.com/archive/19960316/2319160/netscape-execs-sold-shares-as-stock-fell (read 2026-10-17).
  - The same article says Barksdale sold about 1.28M shares (17% of his holdings) for about $81M at $51-71 between 5 and 29 Feb, keeping 6.46M. Andreessen sold 360,000 (about 18%) for about $21.9M, keeping 1.6M. Five other executives sold about 1M shares for about $65M "over the same 25-day period". Prices are adjusted for the 2-for-1 split, and the share closed at $43 on 15 Mar. A newsletter publisher called the selling during the decline "a little ominous".
- Contemporaneous anticipation: Timothy C. May, Cypherpunks list, 7 Dec 1995: "Analysts are also closely looking at the February '96 end of the 'lockout' in some stock sales by Netscape employees ... a lot of the shares that went to employees, etc., cannot be sold for 180 days after the IPO." https://diswww.mit.edu/menelaus/cpunks/44933 (read 2026-10-17). This is a mailing-list post, not a reliable financial source, but it shows the date was watched in advance.
- Expiry date: 9 Aug 1995 plus 180 days is 5 Feb 1996 (my computation), which matches the 5 Feb start of the executive sales above.
- Game data: Feb 1996: netscape -37.9%, S&P +0.7%. Mar 1996: netscape -19.1%, S&P +0.8%. Before that, Jan 1996 was +18.2% (S&P +3.3%); after, Apr 1996 was +47.9% (S&P +1.3%).

---

## amzn - Amazon.com, IPO 15 May 1997

**Summary: 180-day lock-up from the 15 May 1997 prospectus, of all executive officers, directors and certain stockholders and employees (about 20.83M of 23.86M shares outstanding). It ended about 11 Nov 1997, when about 19.33M shares became saleable. In the game the share fell 18.9% in November 1997 (S&P +4.5%) and rose 21.7% in December (S&P +1.6%). The Motley Fool reported at the time that shorts betting on the expiry were disappointed.**

- Source: final prospectus, 424B1 filed 15 May 1997: https://www.sec.gov/Archives/edgar/data/1018724/0000891020-97-000868.txt (read 2026-10-17).
  - "Pursuant to certain 'lock-up' agreements, all the executive officers, directors and certain stockholders and employees of the Company, who collectively hold an aggregate of approximately 20,826,909 Restricted Shares, have agreed not to offer, sell ... for a period of 180 days from the date of this Prospectus." The company also agreed to 180 days with Deutsche Morgan Grenfell, which "may, in its sole discretion and at any time without notice, release all or any portion" of the shares.
  - "On the date of the expiration of the lock-up agreements, an additional 19,331,253 of the Restricted Shares will be eligible for immediate sale (of which 17,246,669 shares will be subject to certain volume, manner of sale and other limitations under Rule 144)." About 31,793 shares became saleable at 90 days. About 681,300 more followed between Nov 1997 and May 1998.
  - The offering was 3,000,000 shares, leaving 23,858,702 outstanding. The Bezos family held a majority after the offering (Jeff Bezos 41%, family and trusts 10%). An S-8 for about 9.53M option shares was planned about 180 days after the prospectus.
  - 15 May 1997 plus 180 days is 11 Nov 1997; sales were allowed from day 181, 12 Nov 1997 (my computation).
- Press coverage: Motley Fool, Fool Portfolio Report, 16 Dec 1997, https://g.foolcdn.com/FoolPort/1997/FoolPort971216.htm (read 2026-10-17). It said "Amazon bears were counting on the November stock lock-up termination to bring Amazon shares toppling ... many people even shorted the stock based on this event alone"; "at the end of six months 18 million shares were released from the lock-up"; and "some of the shares were sold, but not enough to cause more than a short-term blip ... The fateful day came and went during the third week of November, and Amazon's stock -- well, the stock rose." The Fool puts the day in the third week; the prospectus arithmetic gives 11-12 Nov, which is the second week.
- Game data: Nov 1997: amzn -18.9%, S&P +4.5%. Dec 1997: amzn +21.7%, S&P +1.6%. The month-end data shows a fall in November despite the Fool's "the stock rose", so the drop presumably came on other days of the month. Daily prices were not checked.


# Group B

# Lock-ups, batch B

Method. The terms come from the final prospectus on SEC EDGAR (424B4/424B2) where one exists. For Glencore they come from the HKEX-filed prospectus, and for Xstrata from the company's own archived press releases. Expiry dates are counted from the prospectus date as stated in the document; where I computed the date myself, it says "computed". Share counts are as printed in the prospectus, so before any later stock splits. Game figures are month-end changes taken from `data/out/<id>.json` (adjusted, USD) and `data/reference/sp500.json` (S&P 500 price index). For Xstrata and Glencore the game prices are GBP converted to USD, so their monthly changes include the pound/dollar move. Everything was read 2026-10-17.

---

## ebay (eBay, IPO 24 Sep 1998)

**Summary:** a short 120-day lock-up on about 24.5m of 39.7m shares, ending 22 Jan 1999. The share kept rising: +15.1% in January 1999 and +20.3% in February, against +4.1% and -3.2% for the S&P 500.

- **Terms.** Existing stockholders and optionholders agreed not to sell "for a period of 120 days following the date of the final Prospectus ... without the prior written consent of Goldman Sachs & Co." "Beginning 121 days after the date of the final Prospectus, 24,549,579 of these shares will be eligible for sale in the public market". Option holders were also bound ("Holders of options ... are also subject to 120-day lock-up agreements"; options then outstanding: 3,124,914). Shares outstanding after the offering: 39,739,073, of which 3,500,000 were sold in the IPO. Prospectus dated 24 September 1998. Source: eBay 424B4, https://www.sec.gov/Archives/edgar/data/1065088/0001012870-98-002475.txt (read 2026-10-17)
- **Who held them.** As of 30 June 1998: Pierre Omidyar 15,229,425 (38.3% after the offering), Jeffrey Skoll 10,200,000 (25.7%), the Benchmark funds 8,791,836 (22.1%), Meg Whitman 2,400,000 (6.0%). Directors and officers as a group held 86.6% after the offering. Same source.
- **Expiry.** 120 days after 24 Sep 1998 is Friday **22 Jan 1999** (computed). The first possible sale day was the 121st day, so in practice Monday 25 Jan 1999. A German contemporaneous report gives a different date: insiders were bound "nicht vor dem 29. Januar 1999 zu verkaufen" (Computerwoche, 16 Feb 1999), https://www.computerwoche.de/article/2660442/hp-verkauft-anteile-an-ebay.html (read 2026-10-17). That article reports HP selling 108,507 eBay shares worth $25.9m after the expiry, and says the share was up 13-fold since the IPO. I did not resolve the 22 vs 29 January discrepancy; the prospectus says 120 days.
- **Press.** No English-language coverage of the expiry found. An investor Q&A of 1999 cites eBay's lock-up as unusually short ("only four months"): https://internetnews.com/it-management/emailbag-monday-lock-ups-insider-selling-jds-uniphase-ndb (read 2026-10-17)
- **Game data.** Jan 1999: eBay **+15.1%** (4.2307 to 4.8686), S&P **+4.1%**. Feb 1999: eBay **+20.3%**, S&P **-3.2%**. eBay peaked in April 1999 (+51.6%) and then fell 15%, 15% and 36% in May, June and July 1999. That slide is the closest thing to "selling after the lock-up" in the data, but it came three months after the expiry. In April 1999 there was also a follow-on offering, which I did not research.
- **For the story:** the lock-up was real, but in this mania it did not hurt. An attentive player who sold before it would have missed a strong rise.

## nvda (Nvidia, IPO 22 Jan 1999)

**Summary:** a 180-day lock-up on 17,991,627 of 28,595,976 shares (all officers and directors among them), ending 20 Jul 1999. The share was +5.3% in July (S&P -3.2%) and +39.9% in August (S&P -0.6%). No sell-off.

- **Terms.** Holders, "including all officers and directors", agreed not to sell "without the prior written consent of Morgan Stanley & Co. Incorporated for a period of 180 days after the date of this Prospectus". The restricted shares were to become available in stages: "(i) 10,000 shares ... immediately; (ii) 4,990,000 shares will be eligible for sale 90 days after the date of this Prospectus; (iii) 17,991,627 shares will be eligible for sale upon expiration of lock-up agreements 180 days after". Offering: 3,500,000 shares; outstanding after: 28,595,976. The prospectus is dated 21 Jan 1999, as its own text says "Until February 15, 1999 (25 days after the date of this Prospectus)". Source: Nvidia 424B4, https://www.sec.gov/Archives/edgar/data/1045810/0001012870-99-000192.txt (read 2026-10-17)
- **Who held them.** As of 31 Dec 1998: Sequoia Capital 3,095,902 (10.8% after the offering), Jen-Hsun Huang 3,100,000 (10.8%), Chris Malachowsky 3,062,500 (10.7%), Curtis Priem 3,062,500 (10.7%), Sutter Hill Ventures 2,786,090 (9.8%). Directors and officers as a group held 56.9%. Same source.
- **Expiry.** 180 days after 21 Jan 1999 is **20 Jul 1999** (computed). There was also a 90-day tranche of 4.99m shares around 21 Apr 1999.
- **Press.** None found.
- **Game data.** Jul 1999: **+5.3%** (S&P **-3.2%**). Aug 1999: **+39.9%** (S&P **-0.6%**). For the 90-day tranche, Apr 1999 was **-13.6%** (S&P +3.8%).
- **For the story:** a case where the lock-up came and went without harm.

## pets-com (Pets.com, IPO 11 Feb 2000)

**Summary:** a 180-day lock-up on 13,420,045 of 29,544,737 shares (45.4%), held by Amazon, Hummer Winblad, Disney's Catalyst and management, ending 8 Aug 2000. The share was **-40.4%** in August (S&P +6.1%) and -22.6% in September (S&P -5.3%).

- **Terms.** "Our directors, officers, employees and other stockholders have entered into lock-up agreements ... [not to sell] without the prior written consent of Merrill Lynch ... for a period of 180 days following the effective date". Release schedule: "180 days after the date of the final prospectus ... 13,420,045". Further releases were 3,134,557 through 5 Nov 2000, 2,454,941 through 8 Dec 2000, 1,195,097 through 18 Jan 2001 and 1,840,097 thereafter. The summary table puts the first block at 45.4% of outstanding. Offering: 7,500,000 shares; outstanding after: 29,544,737. Prospectus dated 10 February 2000. Source: Pets.com 424B4, https://www.sec.gov/Archives/edgar/data/1100683/0000891618-00-000749.txt (read 2026-10-17)
- **Who held them.** As of 18 Jan 2000: Amazon.com 8,973,029 (30.4% after the offering), Hummer Winblad 4,677,115 (15.8%), founder Gregory McLemore 1,499,360 (5.1%), Bowman Capital 1,382,782 (4.7%), Catalyst Investments (a Disney affiliate, address Burbank) 1,102,400 (3.7%), CEO Julie Wainwright 925,618 (3.1%). Directors and officers as a group held 54.8%. Same source.
- **Expiry.** 180 days after 10 Feb 2000 (a leap year) is **8 Aug 2000** (computed).
- **Press.** I found no coverage of the expiry itself. Context: the stock "quickly fell below $1 and stayed there until its demise", https://money.cnn.com/gallery/technology/2015/03/02/dot-com-flops/ (read 2026-10-17). The board approved the wind-down on 4 Nov 2000 (FY2000 10-K, https://www.sec.gov/Archives/edgar/data/1100683/000109581101002065/f71096e10-k.txt, read 2026-10-17).
- **Game data.** Aug 2000: **-40.4%** (1.625 to 0.9688, the first month-end below $1), S&P **+6.1%**. Sep 2000: **-22.6%**, S&P **-5.3%**.
- **For the story:** this is the clearest case in the batch. The share broke below $1 in the lock-up month while the market rose. The selling cannot be shown from the sources, only the coincidence.

## xstrata (Xstrata, London listing March 2002)

**Summary:** **lock-up terms not found.** The offering is documented: 169m new shares at 870p, 25m more through the over-allotment option, 252.6m shares in issue, London dealings from 25 Mar 2002. Glencore kept about 40%. I could not find whether Glencore, or anyone else, agreed to a lock-up, or for how long.

- **What is documented.** "Issue of 169 million ordinary shares at a price of 870p per ordinary share ... Conditional dealings will commence on the London Stock Exchange at 8.00am on 20 March 2002" (Xstrata release, Zug, 20 Mar 2002, archived), https://web.archive.org/web/20020623233226/http://xstrata.com:80/press_print.php?id=pr&nb=200203201.en.html (read 2026-10-17). The stabilising manager J.P. Morgan exercised the option, so 25m extra shares were issued in total. "Dealings ... expected to commence on the London Stock Exchange at 8.00 am on 25 March 2002 ... total number of issued ordinary shares ... 252.6 million" (release of 22 Mar 2002), https://web.archive.org/web/20020623233733/http://xstrata.com:80/press_print.php?id=pr&nb=200203221.en.html (read 2026-10-17). Raised about £840m, with Glencore to own about 40%: https://www.miningmonthly.com/international-coal-news/news/1282173/xstrata-ipo-debuts (read 2026-10-17).
- **Where I looked without success:** web searches; Xstrata's archived press releases for Mar-Oct 2002 (disclosures by Capital Group, Fidelity and the CEO's trust only, nothing on a lock-up); part of the archived 2002 annual report. The full IPO announcements (PDF) were not archived. The UK prospectus is not online that I could find. One lead for the curator: the March 2002 prospectus or the 2002 annual report's "relationship agreement" section, if a library copy is available.
- **Game data.** The game's Xstrata series starts in 2002-05, so the listing months are missing. For orientation only, *if* a customary six-month lock-up had applied (an assumption, not a finding), it would have ended about 25 Sep 2002. Sep 2002: Xstrata **+2.0%**, S&P **-11.0%**; Oct 2002: **+3.2%**, S&P +8.6%. Do not use this in the story without the terms.

## tsla (Tesla, IPO 29 Jun 2010)

**Summary:** a 180-day lock-up on 79,467,957 of 93,109,393 shares (85.35%), held by Musk, Daimler's Blackstar, Abu Dhabi's Al Wahda, VantagePoint, Valor and employees. It ended 25 Dec 2010, and on the first trading day (27 Dec) the stock fell 15%. The share was **-24.6%** in December (S&P +6.5%) and -9.5% in January (S&P +2.3%).

- **Terms.** "We, the selling stockholders, all of our directors and officers and the other holders of shares of common stock ... outstanding immediately prior to this offering have agreed that, without the prior written consent of each of Goldman, Sachs & Co., Morgan Stanley & Co. Incorporated, J.P. Morgan Securities Inc., and us, we and they will not, during the period ending 180 days after the date of this prospectus" sell. The lock-up could be extended by up to 34 days. Release table: "79,467,957 or 85.35% — 180 days after the date of this prospectus due to contractual obligations and lock-up agreements"; 13,300,000 (14.28%) were tradable immediately. Toyota's private-placement shares carried their own 180-day lock-up, and employees in the directed share programme 180 days too. Outstanding after the offering and placement: 93,109,393. Prospectus dated 28 June 2010. Source: Tesla 424B4, https://www.sec.gov/Archives/edgar/data/1318605/000119312510149105/d424b4.htm (read 2026-10-17)
- **Who held them (before the offering → after).** Elon Musk 28,303,341 (selling 908,958 in the IPO; 29.05% after), Blackstar Investco/Daimler 7,484,074 (8.04%), Al Wahda Capital 7,297,139 (7.84%), VantagePoint 7,138,273 (7.41% after selling 239,016), Valor Equity 4,910,679 (5.27%). Same source.
- **Expiry.** 180 days after 28 Jun 2010 is Saturday **25 Dec 2010** (computed; Bloomberg says "the end of the lock-up period on Dec. 25"). The first trading day was Monday 27 Dec.
- **Press.** "Tesla shares fell $4.54, or 15 percent, to $25.55 ... the steepest drop since July 6 ... The end of the lock-up period on Dec. 25 allows Tesla's early investors to sell for the first time since the company's June 28 initial public offering". Capstone analyst Carter Driscoll rated the stock a sell (Bloomberg via Gasgoo, 28 Dec 2010), https://autonews.gasgoo.com/articles/news/tesla-falls-the-most-since-july-after-lock-up-ends-stock-rated-a-sell-1018249 (read 2026-10-17). See also AutoGuide, 28 Dec 2010 ("fell roughly 15 percent on Monday"), https://www.autoguide.com/auto-news/2010/12/tesla-shares-fall-15-after-investors-dump-holdings.html (read 2026-10-17), and Motley Fool, 27 Dec 2010, https://www.fool.com/investing/general/2010/12/27/tesla-motor-shares-plunged-what-you-need-to-know.aspx (read 2026-10-17).
- **Game data.** Nov 2010: **+61.8%** (S&P -0.2%), the run-up beforehand. Dec 2010: **-24.6%** (2.3553 to 1.7753), S&P **+6.5%**. Jan 2011: **-9.5%**, S&P **+2.3%**.
- **For the story:** the textbook case. A big run-up came first, then the lock-up ended on Christmas Day and the share fell 15% on the first trading day.

## glencore (Glencore, London/Hong Kong, admission 24 May 2011)

**Summary:** a staggered lock-up. Cornerstone investors (5.1% of the shares) and the company were bound for six months, to about 24 Nov 2011. Employee shareholders (66.8%) were bound for one to four years, and executive directors (16.8%) for five years, with releases on each anniversary. At the first anniversary, 24 May 2012, about 40% of the company became free to sell (my computation from the prospectus table). In the game the share was -11.5% in Nov 2011 (S&P -0.5%) and **-24.0% in May 2012** (S&P -6.3%), then -11.6% in June 2012 (S&P +4.0%).

- **Terms (prospectus, Section X, paragraph 17).**
  - The company: no new shares until "the expiry of six months after UK Admission".
  - Executive directors: "to and including the fifth anniversary of Admission"; the share of their holding still restricted falls from 100% in year 1 to 80%, 60%, 40% and 20% in years 2 to 5. Their shares were 16.8% of the issued capital.
  - Other existing (employee) shareholders, 66.8% of the capital in total: a one-year lock-up on 22.2% of capital (100% restricted in year 1); a two-year lock-up on 12.0% (100% in year 1, then 50%); a four-year lock-up on 32.6% (100% in year 1, then 75%, 50% and 25%).
  - Cornerstone investors: "during the period ending six months following UK Admission"; 5.1% of the capital. They agreed to coordinate any sale within a month after expiry through the banks "so that a disorderly or false market ... is not created".
  - The Kazzinc consideration shares were locked up for six months from issue.
  - The figures assume the mid-point of the price range. Source: Glencore prospectus as filed with HKEX, Section VIII para 8 and Section X para 17, https://www.hkexnews.hk/listedco/listconews/sehk/2011/0513/00805_1074520/ewpglencore-20110511-33.pdf and https://www.hkexnews.hk/listedco/listconews/sehk/2011/0513/00805_1074520/ewpglencore-20110511-31.pdf (read 2026-10-17)
- **Pricing RNS, 19 May 2011.** "Glencore's directors and employees will continue to hold approximately 83.1 per cent ... subject to various lock-up arrangements"; "The shares subscribed for by cornerstone investors will be locked up for 6 months post-Admission"; 6,922,713,511 shares in issue at Admission; conditional dealings from 19 May, admission on 24 May 2011. https://www.investegate.co.uk/announcement/rns/glencore--glen/glencore-international-plc-ipo-successfully-priced/2640217 (read 2026-10-17)
- **Free at the first anniversary (computed):** 22.2 + (12.0 × 50%) + (32.6 × 25%) + (16.8 × 20%) ≈ **39.7% of the issued capital**, from 24 May 2012.
- **Press.** At launch, IPO-Book warned that the cornerstones' stakes "could markedly depress the share price as the lock-ups near their expiry date" (10 May 2011), https://www.ipo-book.com/?p=1385 (read 2026-10-17). The April 2011 pre-launch terms (5-year lock-up for the board, 2 to 4 years for senior management, 360 days for others) are in FinanceAsia, 15 Apr 2011, https://financeasia.com/article/glencore-confirms-ipo-of-up-to-11-billion/254576 (read 2026-10-17). I found no report of insider selling at the November 2011 or May 2012 dates. When the last big restriction lapsed in May 2015, Bernstein's Paul Gait said "So far it doesn't seem to have been the case" that executives were selling (Miningmx/Bloomberg, 19 May 2015; that article wrongly calls it a 2013 listing), https://www.miningmx.com/off-the-wires/12979-glencore-share-option-restaints-to-expire/ (read 2026-10-17).
- **Game data (USD, so the pound/dollar move is included).** Nov 2011: **-11.5%**, S&P **-0.5%**. Dec 2011: **-2.7%**, S&P +0.9%. May 2012: **-24.0%**, S&P **-6.3%**. Jun 2012: **-11.6%**, S&P **+4.0%**. May 2012 was also the euro-crisis month, and the Xstrata merger was being fought over. The data cannot separate the lock-up from those causes, and the press did not attribute the fall to it.

---

## Story-only IPOs (no game data; public figures)

### theglobe.com (IPO 13 Nov 1998)
**Summary:** a 180-day lock-up to 12 May 1999, followed a week later by a follow-on offering in which insiders sold 2.5m shares at $20, against $27.69 three weeks earlier.
- **Terms.** "The Company and its executive officers, directors and certain of its current stockholders have agreed that ... for a period of 180 days after the date of this Prospectus [12 Nov 1998], without the prior written consent of Bear, Stearns & Co. Inc., they will not ... sell". All 6.69m pre-IPO shares were restricted (9,791,339 outstanding after the offering, 3,100,000 sold in it). The 424B4 is at https://www.sec.gov/Archives/edgar/data/1066684/0000950130-98-005514.txt (read 2026-10-17). The follow-on prospectus restates the end date: "would not sell any common stock ... before May 12, 1999".
- **At expiry.** A follow-on offering was dated 19 May 1999: 6,000,000 shares at $20.00, of which the company sold 3.5m and selling stockholders 2.5m. Michael Egan's Dancing Bear Investments sold 1,730,654; the founders sold 120,000 (Todd Krizelman) and 80,000 (Stephan Paternot). The last sale price on 19 May 1999 was $20.0625. The preliminary prospectus had planned 8m shares, and on 29 Apr the share was $27.69 split-adjusted (2-for-1 split on 14 May 1999). Sources: 424B4 of 20 May 1999, https://www.sec.gov/Archives/edgar/data/1066684/0000950130-99-003196.txt, and the preliminary prospectus, https://www.sec.gov/Archives/edgar/data/1066684/000095013099002568/0000950130-99-002568.txt (both read 2026-10-17). New 90-day lock-ups followed, with 8.7m affiliate shares eligible from 18 Aug 1999.
- **Press.** I found no specific article about the expiry.

### VA Linux (IPO 9 Dec 1999)
**Summary:** a 180-day lock-up on 22.9m of the 35.3m pre-IPO shares, with sales possible from 7 Jun 2000 (LWN said 6 June and "35 million shares - a full 85% of the company").
- **Terms.** Directors, officers, other stockholders and optionholders were locked up "for a period of 180 days after the effective date" (Credit Suisse First Boston could release). "Of the remaining 35,301,586 shares, 22,949,202 shares will become eligible for sale on June 7, 2000, the 181st day after the effective date". Prospectus dated 9 Dec 1999; 424B2 at https://www.sec.gov/Archives/edgar/data/1096199/0000891618-99-005600.txt (read 2026-10-17).
- **Press.** LWN, 18 May 2000: VA "comes out the next day (June 6) when 35 million shares - a full 85% of the company - will be unlocked". It added that lock-up expiries "do not necessarily spell disaster". https://static.lwn.net/2000/0518/commerce.php3 (read 2026-10-17). I found no article on the price move at expiry.

### Facebook (IPO 18 May 2012)
**Summary:** a staggered lock-up of up to 1.91bn shares from Aug 2012 to May 2013. On the first expiry (16 Aug 2012, 271m shares) the stock fell 6.2% to a record-low close of $19.87. On the largest (14 Nov 2012) it rose about 12% to $22.36.
- **Schedule (AP, 15 Aug 2012).**
  - About 16 Aug 2012: 271m shares (Accel, Goldman Sachs, Microsoft, Thiel, Hoffman, Breyer, Pincus and others).
  - 15 Oct to 13 Nov: about 243m employee shares and options.
  - 14 Nov: 1.22bn shares and options, about a third of them Zuckerberg's.
  - December: another tranche; May 2013: Mail.ru and DST.
  - At the time 421m shares traded; IPO price $38.
  - Source: https://www.mprnews.org/story/2012/08/15/facebook-insiders-can-sell-stock-as-lock-up (read 2026-10-17)
- **16 Aug 2012.** "Lockup Expirations Dip Facebook Stock To $19.87, Lowest Closing Price Yet" (-6.2%; about 157m shares traded), https://techcrunch.com/2012/08/16/facebook-stock-dips-below-20-for-the-first-time (read 2026-10-17). See also the Christian Science Monitor, https://www.csmonitor.com/Business/Latest-News-Wires/2012/0816/Facebook-shares-hit-new-low-as-lock-up-period-expires (read 2026-10-17).
- **Oct/Nov 2012.** TechCrunch said 234m shares became eligible on 31 Oct and the price fell about 5%. On 14 Nov about 773m shares plus RSUs were freed, and the stock rose: "Early investor lockup expires but Facebook gains anyway", closing $22.36 (+$2.50, about 12%), https://thedailybeast.com/early-investor-lockup-expires-but-facebook-gains-anyway and https://techcrunch.com/2012/11/14/running-of-the-facebook-bulls (read 2026-10-17). Sources differ on the 14 Nov count: 773m/852m (TechCrunch) vs 1.22bn including options (AP).

### Alibaba (IPO 19 Sep 2014, $68)
**Summary:** two expiries. On 18 Mar 2015 (six months), about 437m insider shares were freed (Law360 headline: about 18%); the stock was -0.9% at $83.70 in early trading. On 19/21 Sep 2015 (one year), about 1.6bn shares (63%, about $105bn) were freed; the stock fell 2.8% to $63.90, below the IPO price. Ma, Tsai and SoftBank pledged to hold; Yahoo was the open question.
- **March 2015.** "Insiders owning a total of 437 million Alibaba shares" could sell, while about 100m employee shares stayed locked until the May results; shares down 0.9% to $83.70 in early trading (Reuters via Yahoo, 18 Mar 2015), https://au.news.yahoo.com/alibaba-shares-fall-lock-period-124154233.html (read 2026-10-17). Benzinga put it at 429m shares, https://benzinga.com/z/5299012 (read 2026-10-17). Law360, "18% Of Alibaba Shares Soon Up For Grabs As Lock-Up Expires", https://law360.com/articles/630025 (read 2026-10-17).
- **September 2015.** "Lockup on 63% of Alibaba shares ended Saturday": about 1.6bn shares worth about $105bn. Alibaba fell 2.8% to $63.90 on Monday 21 Sep, 32% below its first-day close. Ma and Tsai (about 269m shares) pledged to keep theirs; SoftBank (798m) said in May it would hold; Yahoo (384m, 15%) had made no pledge (Bloomberg, 22 Sep 2015), https://dubaieye1038.com/news/business/alibaba-falls-as-lockup-ends-putting-focus-on-yahoos-stake (read 2026-10-17). Ma and Tsai had borrowed about $2bn against their shares instead of selling, per Fortune, 4 Sep 2015, https://fortune.com/2015/09/04/is-alibabas-jack-ma-looking-to-borrow-2-billion-against-his-stock (read 2026-10-17).

---

## Cross-cutting observations for the curator
- In the game data, a fall in the expiry month against a rising market shows up for Tesla (Dec 2010) and Pets.com (Aug 2000). Glencore's May 2012 anniversary fall is large but coincides with the euro crisis. eBay and Nvidia rose through their expiries.
- Tesla's case is the best teaching story: the date is exact, the press is explicit, there was a run-up first, and the fall came on the first trading day.
- Xstrata's terms are unknown, so leave lock-ups out of its story unless the prospectus turns up.
