# 🐠 Traquarium

A gamified hydration tracker: drink water, fill your aquarium, keep Bubbles the fish happy, earn coins and decorate your tank.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with your iPhone Camera app to open it in **Expo Go** (phone and computer on the same Wi-Fi).
If it can't connect, try `npx expo start --tunnel`.

## Structure

- `App.js` – app shell + bottom tab navigation
- `src/store.js` – app state, game rules, daily rollover, local persistence (AsyncStorage)
- `src/data.js` – decorations, achievements, moods, constants
- `src/components/` – aquarium, goal editor, shared UI
- `src/screens/` – Home (aquarium), Shop, Progress (stats), Settings
