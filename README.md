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
