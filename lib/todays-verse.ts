/**
 * Today's Word — a hand-picked rotation of scripture for the empty-state
 * card on findgod.com. Picks one verse per UTC day so that everyone hitting
 * the page on the same calendar day sees the same verse (the "Today's"
 * promise actually means today, not "random verse").
 *
 * Translation: ESV. Verses chosen to fit the FINDGOD voice — strength,
 * battle, peace, repentance, sons-of-God themes. Avoid the saccharine
 * "blessed!" verses; lean into the war and the rest.
 *
 * Swap, add, or remove verses freely. Just keep the array length consistent
 * day-over-day or you'll change which verse "today" maps to.
 */

export type DailyVerse = {
  ref: string;
  text: string;
};

const VERSES: DailyVerse[] = [
  {
    ref: "1 Corinthians 16:13",
    text: "Be watchful, stand firm in the faith, act like men, be strong.",
  },
  {
    ref: "Proverbs 27:17",
    text: "Iron sharpens iron, and one man sharpens another.",
  },
  {
    ref: "Joshua 1:9",
    text: "Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.",
  },
  {
    ref: "Ephesians 6:11",
    text: "Put on the whole armor of God, that you may be able to stand against the schemes of the devil.",
  },
  {
    ref: "2 Timothy 1:7",
    text: "For God gave us a spirit not of fear but of power and love and self-control.",
  },
  {
    ref: "Psalm 27:1",
    text: "The Lord is my light and my salvation; whom shall I fear?",
  },
  {
    ref: "Psalm 23:4",
    text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.",
  },
  {
    ref: "James 1:12",
    text: "Blessed is the man who remains steadfast under trial, for when he has stood the test he will receive the crown of life.",
  },
  {
    ref: "Romans 8:31",
    text: "If God is for us, who can be against us?",
  },
  {
    ref: "Matthew 6:33",
    text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you.",
  },
  {
    ref: "Proverbs 3:5",
    text: "Trust in the Lord with all your heart, and do not lean on your own understanding.",
  },
  {
    ref: "Isaiah 40:31",
    text: "They who wait for the Lord shall renew their strength; they shall mount up with wings like eagles.",
  },
  {
    ref: "John 16:33",
    text: "In the world you will have tribulation. But take heart; I have overcome the world.",
  },
  {
    ref: "2 Corinthians 12:9",
    text: "My grace is sufficient for you, for my power is made perfect in weakness.",
  },
  {
    ref: "Romans 12:2",
    text: "Do not be conformed to this world, but be transformed by the renewal of your mind.",
  },
  {
    ref: "Galatians 6:9",
    text: "Let us not grow weary of doing good, for in due season we will reap, if we do not give up.",
  },
  {
    ref: "Hebrews 12:1",
    text: "Let us also lay aside every weight, and sin which clings so closely, and let us run with endurance the race that is set before us.",
  },
  {
    ref: "Psalm 46:10",
    text: "Be still, and know that I am God.",
  },
  {
    ref: "Matthew 11:28",
    text: "Come to me, all who labor and are heavy laden, and I will give you rest.",
  },
  {
    ref: "Psalm 51:10",
    text: "Create in me a clean heart, O God, and renew a right spirit within me.",
  },
  {
    ref: "1 Peter 5:8",
    text: "Be sober-minded; be watchful. Your adversary the devil prowls around like a roaring lion, seeking someone to devour.",
  },
  {
    ref: "Proverbs 4:23",
    text: "Keep your heart with all vigilance, for from it flow the springs of life.",
  },
  {
    ref: "Romans 5:3",
    text: "We rejoice in our sufferings, knowing that suffering produces endurance.",
  },
  {
    ref: "1 Corinthians 10:13",
    text: "No temptation has overtaken you that is not common to man. God is faithful, and he will not let you be tempted beyond your ability.",
  },
  {
    ref: "2 Timothy 2:3",
    text: "Share in suffering as a good soldier of Christ Jesus.",
  },
  {
    ref: "Hebrews 4:12",
    text: "The word of God is living and active, sharper than any two-edged sword.",
  },
  {
    ref: "James 4:7",
    text: "Submit yourselves therefore to God. Resist the devil, and he will flee from you.",
  },
  {
    ref: "Psalm 91:1",
    text: "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty.",
  },
  {
    ref: "Proverbs 16:9",
    text: "The heart of man plans his way, but the Lord establishes his steps.",
  },
  {
    ref: "John 14:27",
    text: "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you.",
  },
  {
    ref: "Lamentations 3:22",
    text: "The steadfast love of the Lord never ceases; his mercies never come to an end.",
  },
  {
    ref: "Psalm 1:1",
    text: "Blessed is the man who walks not in the counsel of the wicked, nor stands in the way of sinners.",
  },
  {
    ref: "1 John 1:9",
    text: "If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.",
  },
];

/**
 * Returns today's verse based on UTC day-of-year. Server-side computation
 * means every visitor on the same calendar day sees the same verse (until
 * their device crosses midnight UTC).
 */
export function getTodaysVerse(now: Date = new Date()): DailyVerse {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start) / 86_400_000);
  return VERSES[day % VERSES.length];
}

/**
 * Returns today's date as a short uppercase label (e.g. "MAY 7") for the
 * card header. Uses the server's locale, but Vercel's runtime is en-US.
 */
export function getTodaysDateLabel(now: Date = new Date()): string {
  return now
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}
