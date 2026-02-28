# 📈 PortfolioTrack

Investment portfolio tracker — stocks, ETFs, crypto.

## Tech Stack
- React Native + Expo 51 (iOS, Android, Web)
- React Navigation (bottom tabs)
- AsyncStorage (local data persistence)
- Yahoo Finance + CoinGecko (free live prices)

## Deploy: Vercel (frontend)
Connect this repo to Vercel. Settings:
- Build Command: `expo export --platform web`
- Output Directory: `dist`
- Install Command: `npm install --legacy-peer-deps`
- Root Directory: `.` (repo root)

## Deploy: Railway (price API backend)
Connect this repo to Railway. Settings:
- Root Directory: `server`
- Railway auto-detects Node.js

After Railway deploys, copy the URL and add to Vercel:
- Env variable: `EXPO_PUBLIC_API_URL` = your Railway URL

## Local Development
```bash
npm install --legacy-peer-deps
npx expo start --web
```
