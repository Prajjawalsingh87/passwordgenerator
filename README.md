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

## 🛠 Tech Stack

React 18 · Vite · Tailwind CSS

## ▶️ Run locally

```bash
git clone https://github.com/Prajjawalsingh87/passwordgenerator.git
cd passwordgenerator
npm install
npm run dev        # http://localhost:5173
```

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
