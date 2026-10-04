/**
 * The ages of the game: the grand arcs made explicit. When the clock enters the first month of
 * an age, players see a screen that looks back at the age that ended and sets the scene for the
 * new one. `intro` is read at the start of the age and must not know what is coming; `lookBack`
 * is read when the age is over and may say how it went.
 */
export interface Age {
  id: string;
  name: string;
  /** First and last month, "YYYY-MM". The last age has no end. */
  from: string;
  to?: string;
  /** One line under the title. */
  motto: string;
  intro: string;
  lookBack: string;
}

export const AGES: Age[] = [
  {
    id: "cold-war",
    name: "The Cold War",
    from: "1979-12",
    to: "1990-01",
    motto: "Two superpowers, twenty percent interest and a gold rush",
    intro:
      "The world is split in two. Soviet troops have just entered Afghanistan, American diplomats are held hostage in Tehran, and both sides point thousands of nuclear missiles at each other. At home, prices are rising more than ten percent a year, oil has doubled, and people are queueing to buy gold. Lending money to the American government pays more than ten percent a year. Shares have gone nowhere for a decade, and hardly anyone you know owns any.",
    lookBack:
      "It began with gold at 800 dollars and interest rates at twenty percent, and ended with a hamburger: in January 1990 Muscovites queued for hours at the first McDonald's in the Soviet Union. In between, the Federal Reserve broke inflation, interest rates fell for years, and shares had one of their best decades, the crash of October 1987 included. The Berlin Wall is open, and Japan looks set to own the world.",
  },
  {
    id: "peace-dividend",
    name: "The Peace Dividend",
    from: "1990-02",
    to: "1995-07",
    motto: "The end of history, or so they say",
    intro:
      "The Cold War is over and the West has won. A political scientist named Francis Fukuyama calls it the end of history: from now on, he says, every country will become a market democracy. Germany is about to be one country again, Eastern Europe is opening up, and governments talk of a peace dividend, the money they will no longer have to spend on armies. Japan's stock market is the biggest in the world, and its banks are worth more than anyone else's.",
    lookBack:
      "History did not end. Iraq invaded Kuwait within months, Yugoslavia fell apart in war, and the Soviet Union dissolved. But the peace dividend was real: inflation and interest rates kept falling, world trade opened up, and after a short recession the economy grew without a break. Japan, the giant of 1990, spent these years sinking. And in offices everywhere a new machine appeared on the desks, connected to something called the internet.",
  },
  {
    id: "new-economy",
    name: "The New Economy",
    from: "1995-08",
    to: "2002-12",
    motto: "This time it is different",
    intro:
      "A small company called Netscape, which gives away a program for looking at pages on the internet and has never made a profit, has just sold shares to the public, and their price doubled on the first day. People say the old rules no longer apply: computers and networks will make the economy grow faster for ever, and a company's value lies in how many people look at its pages, not in what it earns. Your neighbours have started to talk about their shares.",
    lookBack:
      "For five years it worked. Technology shares rose tenfold, companies without income were worth billions, and anyone who doubted was told he did not get it. In March 2000 it stopped. Over the next two and a half years technology shares lost more than three quarters of their value, hundreds of dot-coms vanished, and Enron and WorldCom turned out to have invented their profits. The internet was real all the same, and a few of the survivors would go on to be worth more than anyone dreamed in 1999.",
  },
  {
    id: "safe-as-houses",
    name: "Safe as Houses",
    from: "2003-01",
    to: "2009-03",
    motto: "Bricks and mortar never fall",
    intro:
      "After the dot-com crash nobody wants to hear about shares that promise the future. People want something solid. Interest rates are at their lowest in forty years, so borrowing is cheap, and house prices are rising everywhere from Florida to Spain. Banks have found clever ways to turn mortgages into securities and sell them around the world. A house, everyone agrees, is the one investment that cannot lose its value.",
    lookBack:
      "House prices in America rose until 2006 and then fell, for the first time in living memory, everywhere at once. The mortgages that banks had packaged and sold turned out to be worth far less than anyone thought, and nobody knew who held them. In September 2008 Lehman Brothers went bankrupt, and within weeks governments had to rescue the biggest banks in the world, UBS and Citigroup among them. Shares lost more than half their value, and the world went into its deepest recession since the 1930s.",
  },
  {
    id: "free-money",
    name: "Free Money",
    from: "2009-04",
    to: "2022-10",
    motto: "When borrowing costs nothing",
    intro:
      "The banks have been rescued, but the economy is in ruins: millions have lost their jobs and their homes. To get things moving, the central banks have cut interest rates to zero and are creating new money to buy bonds, something never tried on this scale. Savers earn nothing on their accounts. Many people have sworn never to touch shares again. And in everybody's pocket there is, or soon will be, a telephone that is really a computer.",
    lookBack:
      "It became the longest boom in history. With interest at zero for more than a decade, money flowed into shares, houses and anything else that promised a return, and the companies behind the smartphone and its apps became the most valuable ever seen. Even a pandemic that shut down the world in 2020 only interrupted it, because governments and central banks answered with more money than ever. In 2022 the bill arrived: prices rose at the fastest rate in forty years, interest rates went up at record speed, and shares and bonds fell together.",
  },
  {
    id: "age-of-ai",
    name: "The Age of AI",
    from: "2022-11",
    motto: "A machine that answers back",
    intro:
      "A small research company in San Francisco has put a program on the internet that answers questions in whole sentences, writes poems and computer code, and passes exams. A million people try it in the first days. Nobody knows yet what it is good for, whose jobs it will change, or who will make money from it. Interest rates are the highest in fifteen years, and investors, burnt by a bad year, are looking for the next big thing.",
    lookBack:
      "",
  },
];

/** The age a month belongs to. */
export function ageAt(month: string): Age {
  let found = AGES[0];
  for (const a of AGES) if (a.from <= month) found = a;
  return found;
}

/** The age that begins in exactly this month, if any. */
export function ageStartingAt(month: string): Age | undefined {
  return AGES.find((a) => a.from === month);
}

/** The age before the given one. */
export function previousAge(age: Age): Age | undefined {
  const i = AGES.indexOf(age);
  return i > 0 ? AGES[i - 1] : undefined;
}
