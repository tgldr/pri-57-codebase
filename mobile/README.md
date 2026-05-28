# Pridge Mobile (React Native + Firebase)

This folder contains the React Native app scaffold for Pridge using Expo and Firebase.

## 1) Install dependencies

```bash
cd mobile
npm install
```

## 2) Configure Firebase env vars

```bash
cp .env.example .env
```

Fill all `EXPO_PUBLIC_FIREBASE_*` values from Firebase project settings.

## 3) Run the app

```bash
npm run start
```

Then open iOS simulator, Android emulator, or Expo Go.

## Notes

- `src/firebase.js` initializes Firebase App, Auth, and Firestore.
- `app/index.js` provides a minimal inventory screen that reads/writes to:
  - `users/{uid}/inventory_items`
- Current UID is a placeholder (`demo-user`) to keep setup simple. Replace with real auth state once onboarding/auth flow is wired.
