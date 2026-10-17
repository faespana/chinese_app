# Worklog

---
Task ID: 1
Agent: Z.ai Code (main)
Task: Convert uploaded "Vocabulario Chino–Español" HTML landing into a mobile app (PWA) ready for Google Play / Android.

Work Log:
- Read the uploaded HTML (`upload/Vocabulario_Chino-Espanol_Landing_2026-10-18.html`): extracted app logic (flashcards, quiz, matching, list, card creator, localStorage progress) and the 364-word BUILTIN vocabulary JSON.
- Generated `src/lib/vocab-data.ts` with all 364 words (part A/B, 18 sections) via a Bun extraction script.
- Generated app icon with image-generation CLI (学 character + ñ bubble, navy/teal) and produced all PWA sizes with sharp: icon-192/512, maskable-512, apple-touch-icon, favicon-16/32 in `public/icons/`.
- Built core libs: `src/lib/vocab-utils.ts` (shuffle, diacritic-insensitive norm, zh-CN TTS speak, haptic vibrate) and `src/lib/vocab-store.ts` (zustand + persist to localStorage: learned ids, quiz best, custom cards).
- Built UI components in `src/components/vocab/`: AppHeader (stats + progress bar), FilterBar (part pills + Radix section select), BottomNav (5-tab floating nav with safe-area), Flashcards (framer-motion flip, TTS, learned toggle, keyboard shortcuts), Quiz (zh↔es, 4 options, best score), Matching (5 pairs, timer, shake feedback), WordList (toneless-pinyin search, pagination, learned/audio actions), CardCreator (create/duplicate-check, JSON export/import, delete with AlertDialog), PwaRegister (SW registration), VocabApp (orchestrator with hydration-safe mount).
- PWA packaging: `public/manifest.json` (standalone, portrait, icons incl. maskable, theme #0B1C2C), `public/sw.js` (precached app shell; network-first for navigations and /_next bundles, cache-first for public assets), layout metadata (manifest, appleWebApp, viewport-fit=cover, themeColor).
- Styling: globals.css additions (.cjk CJK font stack, shake keyframes, thin scrollbars, reduced-motion, native-app overscroll/tap-highlight).
- Fixed React 19 lint errors (set-state-in-effect) by switching to useSyncExternalStore mount gate + key-based remounts + state initializers; moved quiz best-score save into the event handler.
- Fixed quiz/matching CTAs hidden behind fixed bottom nav via scrollIntoView(block:center) effects.
- Fixed sticky footer on short pages (main flex-col + footer mt-auto).
- Fixed dev staleness: SW was serving cached /_next chunks → changed strategy to network-first for bundles, bumped cache to v2.
- E2E verified with Agent Browser (mobile 412x915 + desktop): card flip, learned marking persisting across reloads, full 10-question quiz round with result screen and best score, matching correct/wrong + timer, toneless search ("baogao" → 报告), custom card creation (364→365) with toast, reset-progress dialog, section filter (B.5 → 20 words, part pill auto-sync), OFFLINE reload with network disabled (full UI renders), service worker registration, manifest/icons served 200.

Stage Summary:
- Deliverable: mobile-first offline PWA at `/` — installable on Android (Chrome "Instalar app" prompt), ready to wrap as TWA (Bubblewrap) or Capacitor for Google Play.
- Artifacts: src/lib/vocab-{data,utils,store}.ts, src/components/vocab/* (9 components), public/manifest.json, public/sw.js, public/icons/* (6 files), updated layout.tsx/page.tsx/globals.css/next.config.ts.
- Verified: lint clean, dev.log clean (all 200s), all five game modes interactive, persistence works, offline works, mobile + desktop responsive.
- Note: Android packaging (APK/AAB) requires Android SDK outside this sandbox; the PWA passes TWA quality bars (manifest, icons 192/512+maskable, offline, HTTPS when deployed).
