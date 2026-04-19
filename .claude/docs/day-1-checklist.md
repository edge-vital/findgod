# FINDGOD — Day 1 Checklist

Print this. Check boxes as you go. This is about 3-4 hours of work total.

---

## 🎉 PROGRESS UPDATE (as of 2026-04-17)

**findgod.com is LIVE on the internet** with a working AI Bible Companion. This checklist was written before the chat existed — much of it is now obsolete. Current live status:

### ✅ What's shipped
- **findgod.com** deployed to Vercel with SSL (GoDaddy DNS configured, Shopify records removed, Gmail MX preserved)
- **AI chat** at the URL — Claude Sonnet 4.6 via Vercel AI Gateway (OIDC auth)
- **6-part response format** (Verdict → Reasoning → Scripture → Action → Close → Questions) enforced via `lib/findgod-system-prompt.ts`
- **2-message free limit** with signup wall — scripture anchor + "Don't walk away now" + value stack + "I'm in" CTA
- **5 category pills** (Fear, Lust, Anxiety, Purpose, Doubt) + **Instagram CTA card**
- **Crisis safety guardrails** (988, Crisis Text Line, RAINN) for self-harm / abuse mentions
- Strategic sequence refined: **clothing comes LAST, not first** (Yeezy / Fear of God Essentials model — see `business-bible.md` → "Clothing Philosophy")
- Brand direction gallery at `/concepts/v3` (15 variations) awaiting founder's final pick

### 🚧 Still user-action pending
- Sign up for Beehiiv (Phase 1 below) and configure API keys in Vercel env
- LLC formation → USPTO trademark under LLC
- Final brand direction pick from `/concepts/v3`
- Brief Fiverr designers for logo
- Activate @findgod Instagram account + first post

### 📋 Next-session handoff
See `.claude/docs/handoff.md` for full current status, open loops, and operating notes.

---

## Phase 1 — Setup Accounts (30 minutes)

- [ ] **Sign up for Beehiiv** at [beehiiv.com](https://www.beehiiv.com). Free account. Name your publication: **"The Daily Word"**. This is your email list tool. Free forever at this scale.
- [ ] **Sign up for Canva Pro** if you don't already have it (~$13/mo, cancel anytime). Or use the free version — fine to start.
- [ ] **Open your Midjourney account** (or ChatGPT Plus / DALL-E) — this is how you'll generate the cinematic post images.

---

## Phase 2 — Temporary Brand (45 minutes)

- [ ] **Create a temporary wordmark in Canva:**
  - Open Canva → new design → 1080x1080 square
  - Text: **FINDGOD** (all caps, single word)
  - Font: **Playfair Display** or **Times New Roman** (both feel classical/timeless)
  - Color: pure black on white
  - Letter-spacing: wide
  - Save as PNG (transparent background) + JPG
  - This is temporary. A real designer will make the final logo this week. Don't overthink it.

- [ ] **Update @findgod.com Instagram profile:**
  - Profile photo: Black square with FINDGOD wordmark centered
  - Name field: **FINDGOD**
  - Bio: **"Strength. Wisdom. Brotherhood. Truth. / The Daily Word ↓"**
  - Link: your Beehiiv signup URL (once set up) — use it as the link-in-bio until findgod.com is deployed

---

## Phase 3 — Generate First Post Images (60 minutes)

- [ ] Open `.claude/docs/content-bank.md`
- [ ] Copy the image prompt from Post 1
- [ ] Paste into Midjourney / DALL-E / ChatGPT
- [ ] Generate 4 variations, pick the best one
- [ ] Download at 1080x1350 (IG portrait format) or 1080x1080 (square)
- [ ] Repeat for Posts 2 through 10
- [ ] Store them all in a folder on your desktop called `findgod-post-images`

**Tip:** If an image comes out too bright or too cartoonish, add these words to the prompt: *"editorial photography, film grain, muted tones, high contrast, dark moody, cinematic."*

---

## Phase 4 — Post #1 Goes Live (15 minutes)

- [ ] Open Instagram → new post
- [ ] Upload Post 1 image
- [ ] Copy Post 1 caption from `.claude/docs/content-bank.md` exactly
- [ ] Add hashtags
- [ ] Post it
- [ ] **Screenshot it. Save the screenshot. It's the first step of history.**

---

## Phase 5 — Engagement Loop (30 minutes)

Pick 20 accounts you'll engage with daily. These need to be in or near our lane. Save this list somewhere you'll see it every morning.

**Starter list (add/remove based on your preference):**

- [ ] @jontyson
- [ ] @ruslankd
- [ ] @prestonperry
- [ ] @jackiehillperry
- [ ] @dailystoic
- [ ] @jordan.b.peterson
- [ ] @artofhomage (AOH streetwear)
- [ ] @godisdope
- [ ] @living_christian
- [ ] @thewayuk
- [ ] @pastorjoby (Joby Martin)
- [ ] @wholemanministry
- [ ] @hallowapp
- [ ] @fearlessmotivationapp
- [ ] @thegoodquotes
- [ ] [fill in 5 more you personally like]

**How to engage:**

- Leave thoughtful comments on their latest 2-3 posts
- NOT "amen" or emojis
- Write something actually useful: a related scripture, a sharp observation, a question
- Spend ~2 minutes per account = 40 minutes total per day
- Over time, their audiences start to recognize your name

---

## Phase 6 — Protective Moves This Week (can take 2-3 days)

- [ ] **File USPTO trademark search for "FINDGOD"** at [uspto.gov](https://www.uspto.gov) — use the TEAS Plus form, Class 25 (clothing) + Class 9 (software apps). Total cost: ~$350. I can draft the description for you this week — just ask.
- [ ] **Brief 3 designers on Fiverr/Upwork** for a real logo. Give each the same brief: "I need a masculine, dark, cinematic wordmark for a Christian brand called FINDGOD. References: Daily Stoic, Alo, A24 films. Deliverables: wordmark, monogram mark, favicon, 1 hero image treatment." Budget: ~$150-200 per designer = $450-600 total. Pick the best one in a week.

---

## Where to Find Things in This Project

Everything strategic lives in the `.claude/` folder so Claude can read it automatically every session:

- **Strategy:** `.claude/docs/business-bible.md`, `.claude/docs/strategic-plan.md`
- **Customer:** `.claude/docs/icp.md`
- **Brand voice:** `.claude/rules/brand-guidelines.md`
- **First 10 posts:** `.claude/docs/content-bank.md`
- **This checklist:** `.claude/docs/day-1-checklist.md`
- **Code rules:** `.claude/rules/coding-style.md`
- **The website:** Project root (Next.js project — `app/`, `public/`, `package.json` all live here)

---

## What I Can Build For You Next (just ask)

1. **Deploy the landing page to findgod.com** on Vercel (requires installing the Vercel CLI first — I'll ask before installing)
2. **Posts 11-30** — rest of the content bank so you're never posting live
3. **The first "Daily Word" email** sequence (welcome email + first 7 days of daily emails)
4. **USPTO trademark filing description** — ready-to-paste
5. **AI Bible Companion MVP spec** — so we know exactly what we're building in Track B
6. **Streetwear designer brief** — so you can hire a designer this week

Tell me which one to tackle next.
