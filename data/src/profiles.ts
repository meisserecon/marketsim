/**
 * Company profiles shown to players who do not know the companies.
 *
 * Like names, profiles must not leak the future. Each company has one or more versions, each
 * valid from a month on; the server shows the version for the game's current month. A text
 * may only say what was true and known at its `from` month and must stay true until the next
 * version starts.
 *
 * tagline  one line in the voice of the company's boss pitching it to investors at the time
 * about    one or two plain sentences: what the company sells and where it is from
 * logo, image, imageCaption  optional paths under /profiles/ in the web client (era-specific)
 */
import type { AssetProfile } from "@marketsim/shared";

export interface CompanyProfile {
  country: string;
  sector: string;
  versions: AssetProfile[];
}

export const PROFILES: Record<string, CompanyProfile> = {
  ibm: {
    country: "United States", sector: "Computers",
    versions: [
      { from: "1975-01", tagline: "Every large organisation in the world runs on our computers.", about: "The world's biggest computer maker. It builds and leases mainframes, the room-sized machines that banks, airlines and governments use to process their data, and sells typewriters and other office equipment." },
      { from: "1981-08", tagline: "From the data centre to the desk: now there is an IBM computer for everyone.", about: "The world's biggest computer maker. Its mainframes run the data processing of banks, airlines and governments, and it has just started selling a small personal computer for the office desk." },
      { from: "1995-01", tagline: "Our customers don't want boxes. They want their problems solved, and nobody knows their systems better than we do.", about: "Makes large computers, personal computers and software, and increasingly earns its money by running and advising the computer departments of big companies." },
      { from: "2005-05", tagline: "We left the commodity business to focus on what companies will pay a premium for.", about: "Provides computer services, software and large systems to companies and governments. It has sold its personal computer business." },
      { from: "2019-07", tagline: "Every big company is moving to the cloud, and we are the ones who can connect it with what they already run.", about: "Provides software, consulting and large computer systems to companies and governments, with a focus on cloud computing and artificial intelligence for business." },
    ],
  },
  brk: {
    country: "United States", sector: "Holding company",
    versions: [
      { from: "1980-03", tagline: "We buy good businesses and good shares, and then we keep them. We pay no dividend, because we think we can invest the money better than you can.", about: "A holding company from Omaha, Nebraska, run by the investor Warren Buffett. It owns insurance companies and a textile mill, and invests the insurers' money in shares of other companies. It has never split its share, so a single share is very expensive." },
      { from: "1985-08", tagline: "Our favourite holding period is forever.", about: "A holding company from Omaha, Nebraska, run by the investor Warren Buffett. It owns insurance companies, a candy maker, a newspaper and other businesses, and holds large blocks of shares in a few companies it admires. It has closed the textile mills it started with." },
      { from: "1999-01", tagline: "Insurance gives us other people's money to invest for years before we have to pay it back.", about: "A holding company from Omaha, Nebraska, run by the investor Warren Buffett. It is one of the world's biggest insurers and reinsurers, owns dozens of other businesses from furniture shops to ice cream, and holds large stakes in Coca-Cola, American Express and Gillette." },
      { from: "2010-03", tagline: "We have made an all-in bet on the economic future of the United States.", about: "A holding company from Omaha, Nebraska, run by the investor Warren Buffett. It owns insurers, one of the largest American railways, electricity and gas utilities and dozens of manufacturers and retailers, and holds large stakes in a few listed companies." },
      { from: "2026-01", tagline: "The businesses stay, the patience stays, and the cash is ready for the day prices are right.", about: "A holding company from Omaha, Nebraska, built by the investor Warren Buffett and now led by Greg Abel. It owns insurers, a large railway, energy utilities and dozens of manufacturers and retailers, and holds large stakes in a few listed companies." },
    ],
  },
  ge: {
    country: "United States", sector: "Industrial conglomerate",
    versions: [
      { from: "1975-01", tagline: "From light bulbs to jet engines, we build what a modern economy runs on.", about: "One of America's largest industrial companies. It makes power plant turbines, aircraft engines, locomotives, medical scanners, household appliances and light bulbs." },
      { from: "1981-04", tagline: "We will be number one or number two in every business we are in. If we cannot, we fix it, sell it or close it.", about: "One of America's largest industrial companies. It makes power plant turbines, aircraft engines, medical scanners, appliances and light bulbs, and has a growing finance arm that lends to customers and consumers." },
      { from: "1986-06", tagline: "We will be number one or number two in every business we are in. If we cannot, we fix it, sell it or close it.", about: "A conglomerate that makes power plant turbines, aircraft engines, medical scanners and appliances, owns the NBC television network, and runs one of the largest finance companies in the United States." },
      { from: "2015-04", tagline: "We are going back to what we do best: building big machines and keeping them running.", about: "Makes aircraft engines, power plant turbines and medical scanners, and services them over decades. It is selling most of its finance business." },
      { from: "2024-04", tagline: "Three out of four airliner flights take off with our engines.", about: "Builds and services jet engines for airliners and military aircraft. The power and healthcare businesses have been separated into companies of their own." },
    ],
  },
  xom: {
    country: "United States", sector: "Oil and gas",
    versions: [
      { from: "1975-01", tagline: "The world needs more energy every year. We find it, refine it and deliver it.", about: "The largest oil company in the world. It searches for oil and gas on every continent, refines it, and sells petrol through its Exxon and Esso stations." },
      { from: "1999-12", tagline: "Two of the best oil companies are now one, and nobody in this industry runs its operations more tightly.", about: "The largest oil company in the world after the merger of Exxon and Mobil. It produces oil and gas, refines them, makes chemicals and sells fuel under the Exxon, Mobil and Esso names." },
    ],
  },
  slb: {
    country: "France and United States", sector: "Oilfield services",
    versions: [
      { from: "1975-01", tagline: "Whoever drills for oil, anywhere in the world, calls us to find out what is down there.", about: "Works for the oil companies. It lowers measuring instruments into wells to tell them where the oil and gas are, and provides drilling technology and crews in oilfields around the world." },
    ],
  },
  intc: {
    country: "United States", sector: "Semiconductors",
    versions: [
      { from: "1980-01", tagline: "We put a whole computer on a chip, and every couple of years we double what it can do.", about: "A Californian maker of memory chips and of microprocessors, the chips that act as the brain of small computers and electronic devices." },
      { from: "1986-01", tagline: "The brain of nearly every personal computer in the world is ours.", about: "Designs and manufactures microprocessors, the chips at the heart of personal computers. It has given up memory chips to concentrate on them." },
    ],
  },
  ko: {
    country: "United States", sector: "Beverages",
    versions: [
      { from: "1975-01", tagline: "We want a Coca-Cola within arm's reach of everyone on earth.", about: "Sells the best-known soft drink in the world. It makes the syrup and owns the brand; local bottlers in almost every country mix, bottle and deliver the drinks." },
    ],
  },
  wmt: {
    country: "United States", sector: "Retail",
    versions: [
      { from: "1975-01", tagline: "We sell for less, in the small towns the big chains ignore.", about: "A chain of discount stores in small towns of the American South, run from Arkansas. It sells everyday goods at low prices and is opening new stores every month." },
      { from: "1991-01", tagline: "Everyday low prices. We pass every saving on to the customer, and the customers keep coming.", about: "The largest retailer in the United States. Its big discount stores sell everything from groceries to clothing and electronics, supplied by its own highly efficient distribution network." },
      { from: "2018-02", tagline: "Low prices in the store, at the kerb or at your front door.", about: "The largest retailer in the world, with thousands of stores in the United States and abroad and a growing online shop." },
    ],
  },
  ba: {
    country: "United States", sector: "Aircraft",
    versions: [
      { from: "1975-01", tagline: "Most of the world's airliners are ours, and every year more people fly.", about: "The leading maker of passenger jets, among them the 727, the 737 and the 747 jumbo jet. It also builds military aircraft and space systems for the US government." },
      { from: "1997-08", tagline: "Airliners, fighters, rockets and satellites: one company now builds them all.", about: "The largest aerospace company in the world after taking over McDonnell Douglas. It builds passenger jets, military aircraft, satellites and rockets." },
    ],
  },
  mo: {
    country: "United States", sector: "Tobacco and food",
    versions: [
      { from: "1975-01", tagline: "Marlboro is the best-selling cigarette in the world, and smokers are the most loyal customers there are.", about: "A cigarette maker whose main brand is Marlboro. It also owns the Miller brewery." },
      { from: "1989-01", tagline: "Cigarettes pay for everything, and with the money we have bought some of the best food brands in America.", about: "Sells Marlboro and other cigarettes around the world and, through General Foods and Kraft, coffee, cheese and packaged food. It also owns the Miller brewery." },
      { from: "2002-07", tagline: "Cigarettes pay for everything, and with the money we have bought some of the best food brands in America.", about: "Sells Marlboro and other cigarettes around the world and, through Kraft, coffee, cheese and packaged food. It has sold the Miller brewery." },
      { from: "2008-04", tagline: "A simple business that turns almost all its profit into dividends.", about: "Sells Marlboro and other cigarettes in the United States only. The food business and the international cigarette business have been separated into companies of their own." },
    ],
  },
  c: {
    country: "United States", sector: "Banking",
    versions: [
      { from: "1998-10", tagline: "Banking, insurance and investments under one roof, in a hundred countries. Nobody has built this before.", about: "The largest financial company in the world, formed by the merger of Citicorp and Travelers. It runs Citibank, the Travelers insurance business and the Salomon Smith Barney brokerage." },
      { from: "2005-07", tagline: "The biggest bank in the world, present in more countries than any other.", about: "A global bank with consumer banking and credit cards in dozens of countries and a large investment bank. It has sold its insurance businesses." },
      { from: "2009-01", tagline: "We are becoming a simpler and safer bank.", about: "A global bank that needed a rescue by the US government in the financial crisis. It is selling businesses and shrinking to its core of banking for companies and consumers." },
    ],
  },
  mcd: {
    country: "United States", sector: "Restaurants",
    versions: [
      { from: "1975-01", tagline: "The same burger, the same fries and the same smile, in every restaurant we open.", about: "The largest hamburger restaurant chain. Most restaurants are run by franchisees who pay rent and fees; and it keeps expanding outside the United States." },
    ],
  },
  dis: {
    country: "United States", sector: "Entertainment",
    versions: [
      { from: "1975-01", tagline: "Families trust our name, in the cinema, on television and in our parks.", about: "Makes family films and television programmes, runs the Disneyland and Walt Disney World amusement parks, and licenses Mickey Mouse and its other characters for toys and books." },
      { from: "1996-02", tagline: "We make the stories, and now we own the network that brings them into every living room.", about: "An entertainment group with film studios, amusement parks, merchandise and, since buying ABC, a national television network and the sports channel ESPN." },
      { from: "2010-01", tagline: "The best characters in the world belong to us, and each one can become a film, a ride and a toy.", about: "An entertainment group with film studios including Pixar and Marvel, amusement parks around the world, the ABC network and the sports channel ESPN." },
      { from: "2019-11", tagline: "A century of stories, now streamed straight to the family.", about: "An entertainment group with film studios, amusement parks, television networks and its own streaming service, Disney+." },
    ],
  },
  aapl: {
    country: "United States", sector: "Computers",
    versions: [
      { from: "1980-12", tagline: "We want to put a computer into the hands of ordinary people.", about: "A young Californian company that makes the Apple II, a small computer for homes, schools and small businesses. It has just sold its shares to the public for the first time." },
      { from: "1984-01", tagline: "A computer for the rest of us: you point, you click, and it just works.", about: "Makes personal computers. Its new Macintosh is operated with a mouse and pictures on the screen instead of typed commands." },
      { from: "1997-10", tagline: "Think different.", about: "Makes Macintosh computers, used above all by designers, publishers and schools. It has only a small share of the computer market." },
      { from: "2001-11", tagline: "A thousand songs in your pocket.", about: "Makes Macintosh computers and the iPod, a small music player." },
      { from: "2007-07", tagline: "A phone, a music player and the internet in one device that you operate with your fingers.", about: "Makes Macintosh computers, the iPod music player with its online music shop, and now a mobile phone, the iPhone." },
      { from: "2015-05", tagline: "A billion people carry our devices, and each of them is a customer for our services.", about: "Makes the iPhone, iPad tablets, Mac computers and a watch, and sells apps, music and storage to their users." },
    ],
  },
  msft: {
    country: "United States", sector: "Software",
    versions: [
      { from: "1986-03", tagline: "A computer on every desk and in every home, running Microsoft software.", about: "Writes software for personal computers. Its MS-DOS operating system runs IBM's personal computer and the many machines compatible with it, and it sells programs such as Word and Excel." },
      { from: "1995-09", tagline: "Windows is on nine out of ten personal computers, and Office is what people do their work with.", about: "The largest software company in the world. It sells the Windows operating system and the Office programs for personal computers." },
      { from: "2015-01", tagline: "Mobile first, cloud first: our software as a service on any device.", about: "Sells Windows and Office, increasingly as a subscription, the Xbox games console, and rents out computing power in its data centres." },
      { from: "2023-02", tagline: "Artificial intelligence will be a copilot in every program people use for work.", about: "Sells Windows and Office by subscription, runs one of the two largest cloud computing businesses, and is building artificial intelligence into its products." },
    ],
  },
  csco: {
    country: "United States", sector: "Network equipment",
    versions: [
      { from: "1990-02", tagline: "Companies have computers that cannot talk to each other. We make the boxes that connect them.", about: "A young Californian company that makes routers, the devices that link computer networks together." },
      { from: "1996-01", tagline: "The internet runs on our equipment, and the internet is doubling every year.", about: "The leading maker of routers and switches, the equipment that carries data across company networks and the internet." },
    ],
  },
  amzn: {
    country: "United States", sector: "Internet retail",
    versions: [
      { from: "1997-05", tagline: "Earth's biggest bookstore. We spend to grow now and will profit later.", about: "Sells books over the internet from Seattle and ships them to customers' homes. It is growing very fast and is deliberately losing money to do so." },
      { from: "1999-07", tagline: "We want to be the place where people can find and buy anything online.", about: "An internet shop that sells books, music, films, electronics and toys and ships them to customers' homes. It is growing fast and losing money." },
      { from: "2007-11", tagline: "We lower prices, more customers come, more sellers join, and we lower prices again.", about: "The largest internet retailer. It sells its own stock and lets other merchants sell through its site, and rents out computing power to other companies." },
      { from: "2015-04", tagline: "Our shop is what people know. Our cloud is what the internet runs on.", about: "The largest internet retailer, with a membership programme for fast delivery, and the largest provider of cloud computing to other companies." },
    ],
  },
  ebay: {
    country: "United States", sector: "Internet marketplace",
    versions: [
      { from: "1998-09", tagline: "The world's online marketplace: we own no stock and ship nothing, we just take a fee on every sale.", about: "Runs a website where people auction things to each other, from collectibles to used cars. Unlike most internet companies it makes a profit." },
      { from: "2002-10", tagline: "The marketplace and the way to pay for it now belong together.", about: "Runs the largest online marketplace for goods sold by individuals and small merchants, and owns PayPal, a service for paying over the internet." },
      { from: "2015-07", tagline: "A marketplace for everything that is not on a supermarket shelf.", about: "Runs an online marketplace for goods sold by individuals and small merchants. The payment service PayPal has been separated into a company of its own." },
    ],
  },
  nvda: {
    country: "United States", sector: "Semiconductors",
    versions: [
      { from: "1999-01", tagline: "We make video games look real.", about: "Designs graphics chips that draw three-dimensional images in personal computers, mainly for games. Other companies manufacture the chips for it." },
      { from: "2017-01", tagline: "The chips we built for games turn out to be what artificial intelligence needs.", about: "Designs graphics chips for games and, increasingly, for data centres, where they are used to train artificial intelligence. Other companies manufacture the chips for it." },
    ],
  },
  tsla: {
    country: "United States", sector: "Cars",
    versions: [
      { from: "2010-06", tagline: "We will prove that an electric car can be better than a petrol car.", about: "A small Californian company that builds an expensive electric sports car and plans a family saloon. It loses money and has just sold shares to the public for the first time." },
      { from: "2012-06", tagline: "The best car in the world happens to be electric.", about: "Builds the Model S, an electric luxury saloon, and is setting up its own network of fast chargers." },
      { from: "2017-07", tagline: "An electric car that ordinary families can afford, built by the hundred thousand.", about: "Builds electric cars, now including a cheaper model for the mass market, as well as batteries and solar panels." },
    ],
  },
  mercedes: {
    country: "Germany", sector: "Cars and trucks",
    versions: [
      { from: "1975-01", tagline: "We build the cars that demanding drivers want, and the trucks that carry the world's goods.", about: "A Stuttgart company that builds Mercedes-Benz cars and is one of the world's biggest makers of heavy trucks." },
      { from: "1986-01", tagline: "From the car to aerospace and electronics: an integrated technology group.", about: "Builds Mercedes-Benz cars and trucks and has bought its way into aircraft engines, aerospace and, with AEG, electrical equipment." },
      { from: "1998-11", tagline: "A merger of equals: the first truly global car company.", about: "Formed by the merger of Daimler-Benz and the American Chrysler Corporation. It builds Mercedes-Benz, Chrysler, Jeep and Dodge cars and heavy trucks." },
      { from: "2007-10", tagline: "We are concentrating on what we do best: premium cars and trucks.", about: "Builds Mercedes-Benz cars and is the world's biggest maker of heavy trucks. It has sold Chrysler." },
      { from: "2022-02", tagline: "Fewer cars, more luxury.", about: "Builds Mercedes-Benz cars and vans. The truck business has been separated into a company of its own." },
    ],
  },
  bmw: {
    country: "Germany", sector: "Cars",
    versions: [
      { from: "1975-01", tagline: "Sheer driving pleasure: we build cars for people who love to drive.", about: "A Munich maker of sporty, expensive cars and of motorcycles." },
      { from: "1994-03", tagline: "With Rover and Land Rover we now cover the whole market, from the small car to the luxury saloon.", about: "A Munich maker of sporty, expensive cars and of motorcycles. It has bought the British Rover Group with the Rover, Land Rover and Mini brands." },
      { from: "2000-06", tagline: "Premium and nothing else.", about: "A Munich maker of sporty, expensive cars and of motorcycles. It has sold Rover and Land Rover and kept the Mini." },
    ],
  },
  pcln: {
    country: "United States", sector: "Online travel",
    versions: [
      { from: "1999-03", tagline: "Name your own price.", about: "Runs a website where customers say what they are willing to pay for a flight or a hotel room, and airlines and hotels with empty seats and rooms decide whether to accept." },
      { from: "2005-07", tagline: "The whole world is starting to book its hotels online, and Europe is where we are growing fastest.", about: "An online travel agency for flights and hotels. It has bought Booking.com, a European hotel booking site." },
    ],
  },
  sony: {
    country: "Japan", sector: "Consumer electronics",
    versions: [
      { from: "1975-01", tagline: "We make things nobody has seen before, and then everybody wants one.", about: "A Japanese maker of televisions, radios and tape recorders, known for its Trinitron colour television and for its inventiveness." },
      { from: "1979-07", tagline: "We make things nobody has seen before, and then everybody wants one.", about: "A Japanese maker of televisions, video recorders and audio equipment. Its newest product is the Walkman, a cassette player small enough to carry around." },
      { from: "1989-11", tagline: "We make the machines, and now we own the music and the films to play on them.", about: "A Japanese maker of televisions, video cameras and audio equipment that has bought the record company CBS Records and the Hollywood studio Columbia Pictures." },
      { from: "1995-01", tagline: "Electronics, music, films and now games.", about: "A Japanese maker of televisions, cameras and audio equipment that also owns a record company and a Hollywood studio and makes the PlayStation games console." },
    ],
  },
  siemens: {
    country: "Germany", sector: "Electrical engineering",
    versions: [
      { from: "1975-01", tagline: "From the power station to the telephone: wherever electricity is at work, so are we.", about: "Germany's largest electrical engineering company. It builds power plants, telephone exchanges, medical equipment, industrial controls and household appliances." },
      { from: "2007-01", tagline: "Energy, industry and healthcare: we are concentrating on what the world will need more of.", about: "A German engineering company that builds power plant equipment, factory automation, trains and medical scanners. It has given up mobile phones and telephone network equipment." },
      { from: "2020-10", tagline: "We make factories, buildings and trains smarter.", about: "A German engineering company focused on factory automation, building technology and trains. It holds a majority of the medical technology company Siemens Healthineers; the energy business has been separated into a company of its own." },
    ],
  },
  nokia: {
    country: "Finland", sector: "Telecommunications",
    versions: [
      { from: "1994-07", tagline: "Connecting people: soon everyone will carry a telephone, and we intend to make it.", about: "A Finnish company that has turned itself from a maker of paper, rubber and cables into a maker of mobile phones and the networks they use." },
      { from: "2014-05", tagline: "We build the networks the mobile world runs on.", about: "A Finnish maker of equipment for mobile and fixed telephone networks. It has sold its mobile phone business to Microsoft." },
    ],
  },
  glencore: {
    country: "Switzerland", sector: "Mining and commodity trading",
    versions: [
      { from: "2011-05", tagline: "We dig up, buy, ship and sell the raw materials the world is made of.", about: "A Swiss commodity trader and miner based in Baar. It trades and produces copper, zinc, coal, oil and grain, and has just sold shares to the public for the first time." },
      { from: "2013-05", tagline: "From the mine to the customer, in one hand.", about: "A Swiss commodity trader and one of the world's largest mining companies after its merger with Xstrata. It produces and trades copper, zinc, coal, nickel, oil and grain." },
    ],
  },
  xstrata: {
    country: "Switzerland", sector: "Mining",
    versions: [
      { from: "2002-03", tagline: "The world is building, and it needs our coal, our copper and our zinc.", about: "A mining company based in Zug and listed in London. It owns coal, copper, zinc and alloy mines and grows by buying other miners. The commodity trader Glencore is its largest shareholder." },
    ],
  },
  nestle: {
    country: "Switzerland", sector: "Food",
    versions: [
      { from: "1975-01", tagline: "People everywhere have to eat, and all over the world they trust our brands.", about: "The largest food company in the world, based in Vevey. It sells Nescafé instant coffee, milk products, baby food, chocolate and Maggi soups in almost every country." },
    ],
  },
  novartis: {
    country: "Switzerland", sector: "Pharmaceuticals",
    versions: [
      { from: "1996-11", tagline: "Two great Basel companies become one world leader in the life sciences.", about: "Formed by the merger of Sandoz and Ciba-Geigy in Basel. It makes medicines, crop protection products and seeds, and nutrition products." },
      { from: "2000-11", tagline: "We are now a pure healthcare company.", about: "A Basel company that develops and sells medicines, including low-priced copies of drugs whose patents have expired. The agricultural business has been separated into a company of its own." },
      { from: "2023-10", tagline: "New medicines and nothing else.", about: "A Basel company that develops and sells patented medicines. The business with low-priced copies of older drugs has been separated into a company of its own." },
    ],
  },
  sandoz: {
    country: "Switzerland", sector: "Pharmaceuticals and chemicals",
    versions: [
      { from: "1975-01", tagline: "Medicines, dyes and seeds from Basel for the whole world.", about: "One of the three big Basel chemical companies. It makes medicines, dyes and chemicals, seeds, and nutrition products such as Ovomaltine." },
      { from: "1995-07", tagline: "Medicines, nutrition and seeds: we are concentrating on life.", about: "A Basel company that makes medicines, nutrition products and seeds. The chemicals and dyes business has been separated into a company of its own." },
    ],
  },
  ubs: {
    country: "Switzerland", sector: "Banking",
    versions: [
      { from: "1975-01", tagline: "The world brings its savings to Switzerland, and we are the largest bank in Switzerland.", about: "The Schweizerische Bankgesellschaft, based in Zurich, is the largest of the three big Swiss banks. It manages the wealth of private clients from all over the world, lends to Swiss companies and households, and trades securities." },
      { from: "1998-06", tagline: "Two Swiss banks become one of the largest in the world, and the largest manager of private wealth anywhere.", about: "Formed by the merger of Bankgesellschaft and Bankverein. It manages the wealth of private clients around the world, runs an investment bank and is the leading bank in Switzerland." },
      { from: "2009-01", tagline: "We are going back to what clients come to us for: looking after their wealth.", about: "A Swiss bank that had to be rescued by the state in the financial crisis after large losses in its investment bank. It manages the wealth of private clients around the world and is the leading bank in Switzerland." },
      { from: "2023-06", tagline: "One Swiss bank, twice the size.", about: "The largest Swiss bank and the largest manager of private wealth in the world. It has taken over its rival Credit Suisse." },
    ],
  },
  sbv: {
    country: "Switzerland", sector: "Banking",
    versions: [
      { from: "1975-01", tagline: "A Swiss bank that has always looked beyond Switzerland.", about: "The Schweizerischer Bankverein, based in Basel, is one of the three big Swiss banks. It manages private wealth, lends to companies and is active in the international securities and currency markets." },
    ],
  },
  "credit-suisse": {
    country: "Switzerland", sector: "Banking",
    versions: [
      { from: "1975-01", tagline: "Founded to finance Switzerland's railways, we now finance Swiss industry and look after the wealth of clients from all over the world.", about: "The Schweizerische Kreditanstalt, based in Zurich, is one of the three big Swiss banks. It lends to companies and households, manages private wealth and trades and issues securities." },
      { from: "1989-01", tagline: "A Swiss bank with a Wall Street investment bank under the same roof.", about: "CS Holding, based in Zurich, owns the Schweizerische Kreditanstalt, one of the three big Swiss banks, and a large stake in the international investment bank CS First Boston." },
      { from: "1994-01", tagline: "We have built the bank with the most branches in Switzerland and an investment bank that competes worldwide.", about: "A Zurich holding company that owns the Kreditanstalt, the Volksbank and Bank Leu in Switzerland and the investment bank CS First Boston." },
      { from: "1998-01", tagline: "Banking and insurance from one hand: we have joined forces with Winterthur.", about: "The Credit Suisse Group, based in Zurich, runs a Swiss bank, a global investment bank, an asset manager and, since its merger with Winterthur, one of the large Swiss insurance companies." },
      { from: "2007-01", tagline: "One bank: private banking, investment banking and asset management, everywhere.", about: "A Zurich bank that manages private wealth around the world and runs a large investment bank. It has sold the Winterthur insurance business." },
      { from: "2021-04", tagline: "We are cutting risk in the investment bank and putting wealth management first.", about: "A Zurich bank that manages private wealth around the world and runs an investment bank. It has just suffered large losses from the collapse of an investment firm it lent to and of supply-chain finance funds it sold to its clients." },
    ],
  },
  ibj: {
    country: "Japan", sector: "Banking",
    versions: [
      { from: "1985-01", tagline: "We finance the companies that have made Japan the envy of the world.", about: "A Tokyo bank that provides long-term loans to Japan's large industrial companies and holds shares in many of them." },
    ],
  },
  enron: {
    country: "United States", sector: "Energy",
    versions: [
      { from: "1985-01", tagline: "Natural gas is the fuel of the future, and we own the pipelines that carry it.", about: "A Houston company that owns one of the largest networks of natural gas pipelines in the United States and builds power plants." },
      { from: "1997-01", tagline: "We are not a pipeline company any more. We make markets in energy, and soon in much more.", about: "A Houston company that buys and sells natural gas and electricity for delivery months and years ahead, and owns pipelines and power plants." },
    ],
  },
  lehman: {
    country: "United States", sector: "Investment banking",
    versions: [
      { from: "1994-05", tagline: "A Wall Street name since 1850, and independent again.", about: "A New York investment bank that trades bonds and helps companies and governments raise money. It has just been separated from American Express." },
      { from: "2004-01", tagline: "Record earnings, year after year.", about: "A New York investment bank that trades bonds and shares, advises on takeovers, and is one of the biggest dealers in securities backed by mortgages and in commercial property." },
    ],
  },
  worldcom: {
    country: "United States", sector: "Telecommunications",
    versions: [
      { from: "1989-01", tagline: "Long-distance calls for less. We grow by buying one small competitor after another.", about: "A Mississippi company that resells long-distance telephone service to small businesses at a discount." },
      { from: "1995-05", tagline: "Telephone, data and the internet from one company, anywhere in the world.", about: "A fast-growing long-distance telephone company that has been built by a long series of takeovers." },
      { from: "1998-09", tagline: "A phone company built for the age of the internet.", about: "The second-largest long-distance telephone company in the United States after taking over MCI, and the owner of a large part of the internet's main lines." },
    ],
  },
  "pets-com": {
    country: "United States", sector: "Internet retail",
    versions: [
      { from: "2000-02", tagline: "Because pets can't drive.", about: "Sells pet food and supplies over the internet and delivers them to the door. It is famous for the sock puppet in its television advertising, and it is spending far more than it earns to win customers." },
    ],
  },
};

/** Profile of gold. */
export const GOLD_PROFILE: CompanyProfile = {
  country: "", sector: "Precious metal",
  versions: [
    { from: "1975-01", tagline: "It pays nothing, it cannot go bankrupt, and people have trusted it for five thousand years.", about: "One troy ounce of gold, about 31 grams. Gold pays no interest or dividend. People buy it when they fear inflation, war or the failure of banks, and sell it when they feel safe." },
  ],
};

/** Profile of a Treasury bond maturing in the given year. */
export function bondProfile(year: number): CompanyProfile {
  return {
    country: "United States", sector: "Government bond",
    versions: [
      {
        from: "1975-01",
        tagline: `Lend the US government money and get 100 back on 1 January ${year}.`,
        about: `A promise by the US Treasury to pay 100 dollars on 1 January ${year}. It pays nothing before that, so it costs less than 100 today and the difference is your interest. If interest rates rise in the meantime the price falls, and if they fall it rises; the further away ${year} is, the stronger the effect. Held until ${year}, it pays exactly what was promised.`,
      },
    ],
  };
}
