# DogMate Mobile

Expo (React Native) companion app for DogMate. Talks to the same backend API
as the web app.

## Status

Working foundation — not yet feature-complete with the web app.

**Done:**
- Auth: login, register, session persisted in SecureStore, auto-restore on launch
- Browse: paginated dog list with pull-to-refresh
- Dog detail: image gallery, facts, health/pedigree, stud fee, message-owner button
- Messages: conversation list + live chat (Socket.io with JWT handshake)
- Profile: account info + sign out

**Not yet built:** add/edit dog with photo upload, matching, map, breeds
directory, reviews, admin, native push notifications (Expo Notifications).

## Development

```bash
cp .env.example .env    # then adjust the API URL
npm install
npm start               # Expo dev server; press i for iOS sim, a for Android
```

- iOS simulator reaches a local backend at `http://localhost:5000/api`
- Android emulator must use `http://10.0.2.2:5000/api`
- A physical phone (Expo Go) needs your machine's LAN IP, or point it at the
  deployed Railway backend

## Structure

```
src/
  app/            expo-router screens
    _layout.tsx   root stack + auth gate
    login.tsx / register.tsx
    (tabs)/       Browse, Messages, Profile
    dog/[id].tsx  dog detail
    chat/[id].tsx live chat
  lib/
    api/          axios client (SecureStore token) + endpoint modules
    store/        zustand auth store
    types.ts      API types (mirrors frontend/types)
  constants/      brand colors (mirrors web Tailwind palette)
```

## Builds & stores

Use [EAS](https://docs.expo.dev/eas/): `npx eas build` for iOS/Android
binaries, `npx eas submit` for store submission. Requires an Expo account;
Apple Developer ($99/yr) and Google Play ($25 once) accounts for distribution.
