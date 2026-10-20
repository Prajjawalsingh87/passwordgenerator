# 🔐 Password Generator

Generate strong, random passwords in one click. Built with React, Vite and Tailwind CSS.

**🔗 Live:** https://passwordgenerator-three-steel.vercel.app

## ✨ Features

- **Cryptographically secure** randomness (`crypto.getRandomValues`), not `Math.random`
- Length from **8 to 64** characters with a slider
- Choose **uppercase, lowercase, numbers and symbols**; at least one character of each chosen type is always included
- **Strength meter**: Weak / Fair / Good / Strong
- **One-click copy** with "Copied to clipboard" feedback, and a regenerate button
- Long passwords wrap instead of overflowing on phones
- **Passphrase mode**: random words from a built-in list of 604 common words, with word count (3–10), separator (hyphen, space, dot, underscore or none), and options to capitalize words and add a number
- **Entropy in bits** for both passwords and passphrases, which drives the strength meter
- **Recent list**: the last 5 results from this session with copy buttons and a Clear button (kept in memory only, never saved)
- **Installable & offline**: install it to your home screen or desktop with the **Install app** button; it keeps working without a connection
- **Light / dark theme**: follows your system by default; the toggle in the top bar remembers your choice

## 🛠 Tech Stack

React 18 · Vite · Tailwind CSS · vite-plugin-pwa (Workbox)

## ▶️ Run locally

```bash
git clone https://github.com/Prajjawalsingh87/passwordgenerator.git
cd passwordgenerator
npm install
npm run dev        # http://localhost:5173
```

## 📲 Install & offline (PWA)

`vite-plugin-pwa` generates `manifest.webmanifest` and a Workbox service worker (`sw.js`) at build time.
The service worker precaches the built app so it opens offline, and updates itself automatically when a
new version is deployed. The **Install app** button only appears when the browser offers installation
(the `beforeinstallprompt` event). Icons (`public/pwa-*.png`, maskable and Apple touch icons) are rendered
from the app's SVG logo. `vercel.json` serves `sw.js`, `registerSW.js` and the manifest with
`Cache-Control: no-cache` so updates are picked up promptly.

## 🌗 Theme

The app follows `prefers-color-scheme` until you pick a theme with the toggle (`src/shell/`); the choice is
saved in `localStorage` (`color-theme`) and applied before first paint. Dark-mode colours are CSS variables in
`src/theme.css`, wired into Tailwind by `tailwind.theme.js`, so the light design keeps Tailwind's stock colours.

## 🚀 Deployment

Deployed on **Vercel**; every push to `main` deploys to production.


## October 2026 improvements

Optionally exclude look-alike characters (`I`, `l`, `1`, `O`, `0`, `o`). Every enabled character group is still represented. Clipboard failures explain how to copy manually. Passwords stay in memory and are not saved to browser storage.


## Terminal verification and deployment

```bash
npm ci
npm run lint
npm run build
npm run dev
```

Node.js 24 is used on Vercel. The production build is written to `dist/`.

```bash
vercel link --project passwordgenerator
vercel deploy          # preview
vercel deploy --prod   # publish production
```

The local `.vercel/` link is ignored by Git. Deployment credentials belong in
the CLI's login session, never in this repository.
