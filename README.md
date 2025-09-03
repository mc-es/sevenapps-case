# Seven TODO

A simple, fast, and stylish **TODO** app (Expo + React Native).

> 🎥 **Demo video**
![Download the demo](https://github.com/mc-es/sevenapps-case/blob/master/assets/todo-intro.mp4)

> **Note**: This demo was recorded on an **Expo developer build**, so performance and visuals may slightly differ from a production release.

---

## Features

- **Landing**: animated blobs, glass (blur) card, footer, language switcher.
- **Lists**: create, rename, delete, search, “recently created” strip.
- **Tasks**: create/edit/delete, complete, change status, **priority** & **text search** filters.
- **Performance**: React Query cache, optimistic updates.
- **Theme**: NativeWind/Tailwind + Blur/Gradient.

---

## Tech Stack

- Expo, React Native, Expo Router
- SQLite + Drizzle ORM
- @tanstack/react-query
- Zustand (small UI state)
- i18next (multi-language)
- zod (validations)
- eslint-prettier (formatting and lintting)
- husky-commitlint-lintstage (conventional commit)
- Jest + @testing-library/react-native

---

## Setup

```bash
npm install
npm run start         # or: npx expo start
# Android: a, iOS: i
```

---

## Scripts

```bash
npm run start            # Expo
npm run android          # Android
npm run ios              # iOS
npm test                 # Tests
npm run check:deps       # Deps
npm run check:expo       # Expo
npm run format:prettier  # Prettier
npm run format:eslint    # Eslint
```

---

## Folder Structure (overview)

```
features/
  landing/ (components, hooks, screens)
  lists/   (components, hooks, screens)
  tasks/   (components, hooks, screens)
components/      # Button, InputBox, Container, Dialog, BottomSheet, Gradient...
queries/         # lists.ts, tasks.ts, keys.ts, utils.ts
db/              # schema + sqlite
providers/       # QueryClient + DB provider
store/           # zustand
types/           # types
tests/           # unit + integration
validations/     # zod schemas
i18n/            # translations
libs/            # twMerge and clsx
scripts/         # commit formating
```

---

## Testing

- **Unit**: hooks
- **Integration**: full screen flows (Landing, ListsScreen, TasksScreen)

Run:

```bash
npm test
```
