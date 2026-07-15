# DogMate Mobile

Expo (React Native) companion app for DogMate. Talks to the same backend API
as the web app.

## Status

Working foundation — not yet feature-complete with the web app.

**Done:**
- Auth: login, register, session persisted in SecureStore, auto-restore on launch
- Browse: paginated dog list with pull-to-refresh
- Dog detail: image gallery, facts, health/pedigree, stud fee, message-owner button
- Add/edit dog: shared listing form (components/DogForm.tsx) with camera-roll
  photo upload (up to 10), existing-photo removal on edit, searchable breed
  picker, native date picker, temperament chips
- Matches tab: pick one of your dogs, see scored matches with reasons and
  distance; taps through to the dog detail
- Map tab: dogs with coordinates on a UK map (react-native-maps), gender-
  colored pins, callouts through to dog detail
- Messages: conversation list + live chat (Socket.io with JWT handshake)
- Native push notifications: device registers on sign-in, new-message
  pushes arrive when the app is closed, tapping opens the conversation
- Profile: account info + sign out

**Not yet built:** breeds directory, reviews, admin.

### Map caveat

Expo Go renders the map with no setup (Apple Maps on iOS, Google Maps on
Android). Standalone **Android** builds (EAS preview/production) need a
Google Maps API key: enable "Maps SDK for Android" in Google Cloud, then add
`android.config.googleMaps.apiKey` to app.json. iOS standalone builds use
Apple Maps and need nothing.

### Push notification caveats

- Requires a physical device (no simulators) and an EAS project ID —
  run `npx eas init` once so `getExpoPushTokenAsync` can mint tokens.
- Android Expo Go no longer supports remote push (SDK 53+); use a
  development build (`npx eas build --profile development`) to test on
  Android. iOS Expo Go generally still works.
- No backend config needed: Expo's push service needs no keys, and dead
  tokens are pruned automatically.

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
