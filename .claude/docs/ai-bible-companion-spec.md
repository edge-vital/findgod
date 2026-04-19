# AI Bible Companion — MVP Product Spec

> The flagship digital product of FINDGOD. This document defines what it is, what it does, what makes it different, and how it launches. Written for a non-technical founder — no jargon without explanation.

---

## What Is It? (The One-Liner)

**An AI-powered Bible companion that answers your hardest questions with scripture, challenges you daily, and builds the spiritual discipline most men never had.**

Think: if the Stoic app, Duolingo's streak system, and a wise pastor who never sleeps had a baby — and it only spoke in biblical truth.

---

## Why Does It Exist?

The 16-30 year old man we're building for has questions he'll never ask in church:

- "Is it too late for me?"
- "What does the Bible actually say about pornography?"
- "I failed again. Is there any point?"
- "How do I stop being angry all the time?"
- "My dad wasn't there. What does God say about that?"

He won't ask a pastor. He won't google it. But at 1 AM, alone, anxious — he'll type it into an app on his phone. That's the moment we need to be there.

**This is the emotional bond layer** of the FINDGOD ecosystem. Men use it daily. It walks them through real struggles with real scripture. It becomes personal. Then the streetwear makes that bond visible in public.

---

## What Makes This Different From Everything Else?

### The Competitive Landscape (what already exists)

| App | What It Does | Gap FINDGOD Fills |
|---|---|---|
| **Hallow** | Catholic prayer + meditation. Celebrity narrators. $70/year. 10K+ sessions. | Catholic-positioned. Soft/meditative tone. Not masculine. Not AI-powered Q&A. |
| **Glorify** | Devotionals + journaling + worship music. $10/mo. | General Christian. Morning routine focus. Not AI. Not masculine. |
| **YouVersion** | Bible text + reading plans. Free. 600M+ installs. | A utility, not a companion. No AI conversation. No personality. |
| **Bible Chat / Bible Answers AI** | AI Q&A about scripture. Various pricing. | Generic AI chatbot. No brand, no voice, no daily ritual, no community, no merch loop. Feels like ChatGPT with a Bible skin. |
| **Stoic app** | Daily journaling + stoic philosophy. 4M+ users. | Stoic, not Christian. But the DAILY RITUAL mechanics are exactly right. |
| **Duolingo** | Language learning with gamification. 128M MAU. | Not remotely related to faith — but the STREAK and HABIT mechanics are the gold standard. |

### FINDGOD's Unique Angles (what nobody else does)

**1. "A Question a Day From God" (the signature feature)**

Every other Bible app starts with YOU asking a question. FINDGOD reverses it. Every morning, the app asks YOU a hard question:

> "When was the last time you forgave someone who didn't deserve it?"
> "What are you running from right now?"
> "If your friends judged you only by your actions last week, what would they see?"
> "Read Proverbs 27:17. Who is sharpening you? Name one man."

You journal your answer. The AI reads it and responds with a scripture and a short reflection. This creates a DAILY RITUAL — not just a tool you open when you have a question, but a habit that pulls you back every single morning.

**Why this matters:** Duolingo proved that a daily question + streak = massive retention. Hallow and Glorify both try streaks, but they feel like checking a box. FINDGOD's daily question feels like being CHALLENGED by someone who knows you. That emotional weight is what drives the bond.

**2. The voice is FINDGOD's voice — not generic AI**

Every existing AI Bible chat feels like ChatGPT wearing a clerical collar. Soft. Careful. Hedging. Boring.

FINDGOD's AI speaks in the brand voice: direct, masculine, scripture-forward, never soft, never corny. It doesn't say "that's a great question!" It says: "Read James 1:5. Then stop asking permission to grow up."

This is a system-level instruction to the AI (a "system prompt" — basically the personality we program into it). The user never sees it. They just feel that the app talks to them like a mentor, not a chatbot.

**3. The merch loop (nobody else has this)**

When a man uses FINDGOD every day for a month and it genuinely helped him through anxiety, a breakup, a fear — he doesn't just "like" the brand. He has an emotional bond with it. That's when the $85 hoodie stops being merchandise and becomes identity. He wants the world to see what saved him.

No AI Bible app thinks about merch. No Christian merch brand has a daily-use app. The loop is the moat.

**4. Struggle-specific, not curriculum-based**

Hallow and Glorify are structured: "Day 1 of the Prayer Journey." FINDGOD meets you where you ARE. Anxious? Angry? Addicted? Grieving? Lost? Each struggle has a scripture pathway, and the AI adapts based on what you've shared before.

---

## MVP Features (What We Build First)

"MVP" means the smallest version of the app that's useful and testable. We ship this, get real men using it, and expand from there. We don't build everything at once.

### Must-Have (MVP)

| Feature | What It Does |
|---|---|
| **Daily Question** | One hard question every morning at 6 AM. User journals their answer. AI responds with scripture + reflection in the FINDGOD voice. This is the core loop. |
| **Ask Anything** | Free-text chat. "What does the Bible say about [anything]?" AI answers with scripture references, in the brand voice. Not a generic chatbot — a mentor. |
| **Streak Counter** | Consecutive days you've answered the Daily Question. Displayed prominently. Losing it hurts. Keeping it feels like discipline. (Duolingo proved this — 7-day streak users are 3.6x more likely to stay long-term.) |
| **Scripture of the Day** | One verse delivered with a 2-3 sentence reflection. Doubles as the Daily Word newsletter content. |
| **Dark Cinematic UI** | The app MUST look and feel like the FINDGOD brand. Deep black, muted gold accents, Playfair serif headings, minimal, editorial. It should feel like opening a monastery journal on your phone. |
| **Mobile-Responsive Web App** | Start as a website (not a native app) that works perfectly on phones. Way cheaper and faster to build than iOS/Android apps. Users access it at findgod.com. |
| **Simple Auth** | Email + password signup. Or passwordless (magic link — you click a link in your email to log in, no password needed). Keep it dead simple. |

### Nice-to-Have (Post-MVP, add as we learn)

| Feature | Why It's Deferred |
|---|---|
| **Audio Mode** | AI reads answers aloud in a deep, calm male voice. Huge for gym/driving. Deferred because voice synthesis costs money and adds complexity. |
| **Struggle Pathways** | Structured multi-day paths for specific struggles (anxiety, lust, grief, anger, purpose). Deferred because we need user data to know which struggles to build first. |
| **Brotherhood Board** | Anonymous prayer request wall. Men post struggles, others pray for them. Deferred because moderation is hard and we need a community to moderate it. |
| **Reading Plans** | 7/14/30-day guided scripture plans. Deferred because the Daily Question + Ask Anything already provide daily structure. Plans come once we see what users actually want. |
| **Push Notifications** | "Your daily question is waiting." Requires native app (PWA or App Store). Deferred to Phase 2. |
| **Streak Freeze** | Pay $1 or complete a bonus challenge to save your streak when you miss a day. Duolingo's streak freeze reduced churn by 21%. Deferred to post-launch once streaks are established. |
| **Leaderboards** | Compete with friends on streak length. Social accountability. Deferred because we need users first. |
| **Journal History** | Browse all your past Daily Question answers. Deferred because it's valuable but not needed for launch. |
| **Native iOS/Android App** | Real App Store presence. Deferred because web app is 10x cheaper to build and iterate on. We go native once we prove the product works and have the revenue to justify the $5-20K+ cost. |

---

## How It Works (User Journey)

### First Visit — "The Onboarding"

1. Man lands on findgod.com (probably from Instagram bio link)
2. Sees the landing page → clicks "Start" or "Try It Free"
3. Quick signup: email + password (or magic link)
4. **First question appears immediately** — no tutorial, no tour, no "welcome to the app" BS. Just the question:

> "What's one thing you're carrying right now that you've never told anyone?"

5. He types his answer. The AI responds with a scripture and a short reflection.
6. He's hooked. First streak day earned.

### Daily Loop — "The Ritual"

1. Wake up. Phone buzzes (email notification — push notifications come later).
2. Open findgod.com. Daily Question is waiting.
3. Read the question. Journal the answer. Get the AI response.
4. Streak counter goes up. Feels good. Like discipline.
5. Optional: browse Scripture of the Day. Ask a question if something's on his mind.
6. Close the app. Go on with his day. Come back tomorrow.

**Time spent per session: 3-7 minutes.** Short enough to not feel like homework. Deep enough to actually change something.

### The Ask — "The Mentor"

At any time, outside the Daily Question, he can type anything:

- "I keep looking at porn and I hate myself for it"
- "My girlfriend just left me"
- "Does God actually care about me?"
- "What should I do with my life?"
- "Explain Romans 8:28 to me like I'm 18"

The AI responds with:
1. A direct, empathetic-but-not-soft acknowledgment
2. 1-3 relevant scripture references with the actual verses quoted
3. A short reflection in the FINDGOD voice
4. Sometimes a follow-up question to go deeper

What it does NOT do:
- Give medical or professional mental health advice (always includes a disclaimer for serious issues)
- Take political stances
- Be soft or corny
- Say "that's a great question!"
- Give answers without scripture backing

---

## Pricing Model

| Tier | Price | What You Get |
|---|---|---|
| **Free** | $0 forever | Daily Question (1/day), Ask Anything (10 questions/day), Scripture of the Day, Streak counter |
| **Premium** | $4.99/month or $39.99/year | Unlimited Ask Anything, audio mode (when built), struggle pathways (when built), journal history, streak freeze, advanced daily insights |

**Why this pricing:**
- Free tier is generous enough to deliver real value and build the emotional bond. If a man uses FINDGOD free for 3 months and it genuinely helps him, he'll either upgrade or buy a hoodie. Either way, the mission is served.
- $4.99/mo is low enough to not feel predatory, high enough to cover AI costs. For reference: Hallow charges $70/year, Glorify charges $120/year. We're significantly cheaper.
- 10 free questions/day is the sweet spot. Most men will never hit that limit. The ones who do are power users who WANT to pay for more.

---

## Tech Stack (in plain English)

Here's what each piece does, no jargon:

| Tool | What It Does | Cost |
|---|---|---|
| **Next.js on Vercel** | The framework and hosting for the website/app. Same thing the landing page already runs on. Free tier handles thousands of users. | Free to start |
| **OpenAI API or Claude API** | The AI brain. We send it the user's question + our brand voice instructions + relevant Bible context, and it sends back the answer. | ~$0.01-0.05 per conversation (very cheap) |
| **Supabase** | Handles user accounts (login/signup), stores journal entries, tracks streaks. Think of it as the database. Free tier supports 50,000+ users. | Free to start |
| **Stripe** | Processes payments for the premium tier. Industry standard, takes ~3% per transaction. | 2.9% + $0.30 per payment |

**Total monthly cost at launch with <1,000 users: under $50.**
**Total monthly cost at 10,000 users: ~$200-500** (AI API is the main cost, scales with usage).

---

## The AI "Brain" — How It Thinks

This is the secret sauce. The AI doesn't just "answer Bible questions." It has a personality and a framework.

### System Prompt (the invisible instructions)

When a user asks a question, we send the AI a hidden set of instructions that the user never sees. This is called a "system prompt." It tells the AI:

1. **Who you are:** "You are the FINDGOD Bible companion. You speak with scripture-anchored sharpness — direct, masculine, never soft, never corny."
2. **How to answer:** "Always ground your response in specific scripture. Quote the verse. Use ESV or NKJV. Be direct. Be empathetic but not weak. Challenge the user to go deeper."
3. **What NOT to do:** "Never give medical advice. Never take political stances. Never say 'that's a great question.' Never hedge or be vague. Never use corny church language."
4. **Context awareness:** "You have access to the user's recent journal entries and past questions. Use this context to give personalized responses. If they told you they're struggling with anger last week, and they ask about peace this week, connect the dots."

### Bible Knowledge Layer

We include a curated database of scripture organized by topic (fear, anxiety, lust, purpose, fatherhood, anger, grief, money, etc.) so the AI always pulls from real verses, not hallucinated ones. This is critical for theological accuracy.

### Theological Guardrails

- Every answer includes at least one direct scripture reference
- Controversial theological topics (Calvinism vs. Arminianism, eschatology, etc.) get a "here are the perspectives" treatment, not a stance
- A pastor/theologian reviews the AI's outputs periodically (monthly at first) to catch errors
- Footer on every AI response: "This is AI-assisted guidance. Always confirm with scripture and consult a pastor for serious matters."

---

## MVP Build Timeline

| Week | Milestone |
|---|---|
| 1 | Design the UI mockups (screens for: Daily Question, Ask Anything, streak counter, signup). Get founder approval on how it LOOKS before writing code. |
| 2-3 | Build the core: user signup, Daily Question display, journal input, AI response system, streak tracking. |
| 4 | Build the Ask Anything chat interface. Connect the AI brain with the brand voice system prompt. |
| 5 | Build the Scripture of the Day feature. Polish the mobile experience. |
| 6 | Private beta with 20-50 real users from the email list. Fix what breaks. |
| 7-8 | Launch publicly on findgod.com. Announce to full email list + Instagram. |

**Total timeline: ~8 weeks from start to public launch.**

This can be built with AI-assisted coding (Claude Code, Cursor) with you directing, OR one good full-stack developer on Upwork ($2-4K for the MVP). I can help you write the contractor brief or build it directly — your call.

---

## Success Signals (Not Rigid KPIs)

Not numbers you're chasing — just directional signs that tell you "this is working":

- Men are coming back daily (daily active users growing, not just signups)
- Streaks are lasting 7+ days for a meaningful chunk of users
- DMs and emails arrive saying "this helped me" or "I needed this"
- Free users are converting to premium without being pressured
- Journal entries are getting longer and more honest over time (means trust is building)
- Men are sharing screenshots of their Daily Question responses on their stories

**The one signal that matters most:** a man messages you and says "this brought me back to God." Save that message. It's worth more than any metric.

---

## Risks

| Risk | Mitigation |
|---|---|
| AI says something theologically wrong | Scripture database + guardrails + monthly pastor review + disclaimer footer |
| AI gives harmful advice on mental health | Hard-coded redirect to crisis resources for mentions of self-harm, suicide, abuse. Never try to be a therapist. |
| Users treat it as a replacement for church/community | Regularly prompt users toward real community (Brotherhood events, Skool group, local church). The app is a bridge, not a destination. |
| AI costs spike with heavy usage | Rate limit free tier (10 questions/day). Cache common questions. Use cheaper models for simple queries, premium models for complex ones. |
| Users don't come back after Day 1 | The Daily Question email/notification is the re-engagement lever. Streak psychology is proven (Duolingo data: 3.6x retention at 7-day streaks). |

---

## What I Need From You to Start Building

1. **Approve this spec** — does the vision feel right? Anything you'd add, cut, or change?
2. **Pick the build approach:** I help you build it with AI tools (free, slower) vs. hire a contractor on Upwork ($2-4K, faster)?
3. **Get Supabase set up** — free account at supabase.com. Takes 5 minutes. I'll need the project URL and keys to connect it.
4. **Pick the AI provider:** OpenAI (GPT-4o) or Anthropic (Claude)? Both work. Claude tends to be better at nuanced, voice-consistent writing. OpenAI is slightly cheaper.
5. **Write 20 Daily Questions** — or I'll draft them and you approve. These are the first 20 mornings of someone's FINDGOD experience. They need to hit hard.

---

## Sources & Competitive References

- [Hallow App](https://hallow.com/) — Catholic prayer/meditation, $70/year, 10K+ sessions
- [Glorify App](https://glorify-app.com/) — Devotionals + journaling, $10/mo
- [Bible Chat](https://thebiblechat.com/) — AI Bible Q&A
- [Bible Answers AI](https://bibleanswers.ai/) — AI Bible Q&A
- [Stoic App](https://www.getstoic.com/) — Daily journaling + stoic philosophy, 4M+ users
- [Duolingo Gamification](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo) — Streak mechanics, 128M MAU, 37% DAU/MAU ratio
- [Duolingo Retention Strategy](https://www.trypropel.ai/resources/duolingo-customer-retention-strategy) — Streak freeze reduced churn 21%, 7-day streak = 3.6x retention
- [Faithtime.ai](https://www.faithtime.ai/) — Gamified Bible companion, 2026
- [Faith Guide](https://faithguide.com/) — Free AI Bible chat
