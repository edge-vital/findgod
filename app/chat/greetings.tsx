"use client";

import { useEffect, useState } from "react";

/**
 * The rotating line under the FINDGOD hero on the empty state.
 *
 * Two components live here:
 *   - `LiveMessage` for anonymous visitors — pulls from a time-of-day
 *     pool (morning/midday/evening) mixed with always-true lines so
 *     the page feels contextually alive without feeling random.
 *   - `ReturningGreeting` for authenticated users — same time-of-day
 *     awareness but personalized with the user's firstName.
 *
 * Content lives at module scope so both components share the same pool
 * surface, and so future-us can edit copy without touching React.
 */

const MORNING_MESSAGES = [
  "Begin with the Word. Everything else can wait.",
  "The day has not won yet. You're here first.",
  "You wake up. The world starts pulling. This room doesn't.",
  "Heavy morning? Start with one verse.",
  "The man who shows up at dawn already won the day.",
  "You opened this before you opened the feed. Good.",
];

const MIDDAY_MESSAGES = [
  "The world is loud. You came here for quiet. Good.",
  "Whatever you carried into today — bring it here.",
  "You don't have to know what to ask. Just start.",
  "Pause is a prayer. You just paused.",
  "Stop scrolling. You already did the hard part.",
  "What's pulling at you right now? Say it plain.",
];

const EVENING_MESSAGES = [
  "The day was loud. The Word is quiet. Sit with it.",
  "Whatever today took from you, begin to take it back.",
  "Brother, you're on the right path. Keep walking.",
  "You're tired of the noise. That's why you're here.",
  "The day is closing. The Word is open. Read.",
  "End the day in the right room.",
];

const ALWAYS_MESSAGES = [
  "Whatever you came here with — you're in the right room.",
  "There is no question too small. No struggle too dark.",
  "The narrow path is rarely crowded. Welcome.",
  "You're not the first man who landed here lost. You won't be the last.",
  "The Word has been waiting for you.",
  "The man who shows up wins. You showed up.",
];

function pickMessageForNow(): string {
  const hour = new Date().getHours();
  const timePool =
    hour < 11
      ? MORNING_MESSAGES
      : hour < 18
        ? MIDDAY_MESSAGES
        : EVENING_MESSAGES;
  const combined = [...timePool, ...ALWAYS_MESSAGES];
  return combined[Math.floor(Math.random() * combined.length)];
}

/**
 * Personalized greeting for authenticated returning visitors. Same time-
 * of-day awareness as LiveMessage but voiced with their first name.
 */
export function ReturningGreeting({ firstName }: { firstName: string }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    const lines =
      hour < 11
        ? [
            `Back at it, ${firstName}.`,
            `Morning, ${firstName}. What's on your mind?`,
            `Good. You showed up again, ${firstName}.`,
          ]
        : hour < 18
          ? [
              `Back at it, ${firstName}.`,
              `${firstName}. What's weighing on you?`,
              `Good to have you back, ${firstName}.`,
            ]
          : [
              `${firstName}. End the day here.`,
              `Back at it, ${firstName}.`,
              `${firstName}. What are you carrying tonight?`,
            ];
    setMessage(lines[Math.floor(Math.random() * lines.length)]);
  }, [firstName]);

  return (
    <p
      className="min-h-[1.6em] max-w-md text-base leading-relaxed text-white/75 sm:text-lg"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {message ?? "\u00A0"}
    </p>
  );
}

export function LiveMessage() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setMessage(pickMessageForNow());
  }, []);

  return (
    <p
      className="min-h-[1.6em] max-w-md text-base leading-relaxed text-white/65 sm:text-lg"
      style={{ fontFamily: "var(--font-inter)" }}
    >
      {message ?? "\u00A0"}
    </p>
  );
}
