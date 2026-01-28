# Android Build Error - Solutions

## Problem
`TypeError: Cannot read property 'decode' of undefined` and `"main" has not been registered` errors on Android.

## ✅ RECOMMENDED SOLUTIONS (Choose One)

### Option 1: Use Expo Go (Easiest - No Build Needed)
1. Install **Expo Go** app from Google Play Store on your phone/emulator
2. Run: `npx expo start`
3. Scan the QR code with Expo Go app
4. App runs directly without native build

**Pros:** No build issues, instant testing, hot reload works  
**Cons:** Limited to Expo Go APIs

### Option 2: Create Development Build (Full Native Access)
```bash
cd frontend
npx expo install expo-dev-client
npx expo prebuild --clean
npx expo run:android
```

This creates a custom development build with full native capabilities.

### Option 3: Use Web Version (For Testing)
```bash
cd frontend
npm install --save-dev crypto-browserify stream-browserify
npx expo start --web
```

Access app at `http://localhost:8081` in your browser.

### Option 4: Disable Hermes Engine (Last Resort)
Edit `android/gradle.properties`:
```properties
hermesEnabled=false
```

Then rebuild:
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

## What Was Fixed
- Simplified `index.js` to just `import 'expo-router/entry';`
- Removed problematic polyfill imports  
- Removed `_layout.tsx` polyfill import
- Updated `tsconfig.json` to include JS files
- Changed `package.json` main entry to `expo-router/entry`

## Current Status
Your code is now clean and minimal. The remaining issue is specifically with Android native bundle registration, which is bypassed by using Expo Go or creating a proper development build.
