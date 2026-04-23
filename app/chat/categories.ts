/**
 * The 5 category chips on the homepage empty state + their 5 first-person
 * prompts each. The chip labels follow the FINDGOD verb-stack (short,
 * imperative, aspirational) and each prompt is a real thing a 16–30 yo
 * lost man would actually say — not a generic "help me with X" opener.
 *
 *   WRESTLE  — doubt, intellectual questions, "is any of this real?"
 *   OVERCOME — porn, phone, drinking, shame, anxiety (vices)
 *   BECOME   — purpose, manhood, discipline, calling
 *   HEAL     — father wounds, regret, failure, loneliness
 *   BEGIN    — where to start reading, praying, following Jesus
 *
 * Changing the copy here should NOT require touching any component —
 * both the chip renderer (ChatInterface) and the expanded panel
 * (CategoryPanel) read from this array.
 */

export type Category = {
  label: string;
  prompts: string[];
};

export const CATEGORIES: Category[] = [
  {
    label: "Wrestle",
    prompts: [
      "Why would a good God allow suffering?",
      "I can't tell if God is real or if I just want Him to be",
      "How do I know the Bible is actually true?",
      "What if I don't feel anything when I pray?",
      "Is it too late for me to come back?",
    ],
  },
  {
    label: "Overcome",
    prompts: [
      "I can't stop watching porn",
      "My phone is controlling me",
      "I'm drinking more than I should",
      "I'm stuck in a shame spiral",
      "Anxiety won't let me rest",
    ],
  },
  {
    label: "Become",
    prompts: [
      "What is a man actually for?",
      "How do I find my purpose?",
      "How do I build real discipline?",
      "I'm wasting my twenties and I know it",
      "What does strength look like in God's eyes?",
    ],
  },
  {
    label: "Heal",
    prompts: [
      "My father wasn't there",
      "I can't forgive myself",
      "I've hurt people I love",
      "I failed at something big",
      "I'm lonely even around people",
    ],
  },
  {
    label: "Begin",
    prompts: [
      "Where do I start reading the Bible?",
      "How do I actually pray?",
      "Who is Jesus, really?",
      "I want to come back to faith",
      "What's the gospel in one sentence?",
    ],
  },
];
