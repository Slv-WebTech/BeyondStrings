# ConvoLens

See Conversations Differently.

A premium real-time encrypted chat app with replay, insights, and polished UI flows, built with React, Vite, Firebase, and Redux.

## Live Deployments

- Vercel: https://convolens-vs.vercel.app/

## Preview

![Login Screen](./screenshots/login-screen.svg)
![Live Chat](./screenshots/live-chat.svg)
![Replay Mode](./screenshots/replay-mode.svg)
![Chat Insights](./screenshots/chat-insights.svg)

## Core Features

- Shared-secret room login with Firebase anonymous auth
- AES-encrypted message content and encrypted display metadata
- Real-time messaging with delivery/read indicators
- Online presence, typing status, and heartbeat sync
- Formal and Romantic chat modes
- Light, Dark, and System theme support
- Wallpaper presets plus custom wallpaper upload
- Replay timeline with speed control and jump support
- Chat insights panel with AI-assisted summary fallback logic
- Search with next/previous navigation and match focusing
- Export chat as PNG and parse WhatsApp export text files
- Persistent user preferences via Redux Toolkit and redux-persist

## Reliability and UX Safeguards

- App-level React Error Boundary with recovery UI
- Version-aware service worker refresh handling
- Automatic cache cleanup on app version updates
- Automatic purge of invalid persisted Redux state
- In-app update toast before automatic reload

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS
- Firebase Auth + Firestore
- Redux Toolkit + redux-persist
- CryptoJS
- Framer Motion
- react-virtuoso
- html-to-image

## Project Setup

### 1) Clone and install

```bash
git clone https://github.com/Slv-WebTech/whatsapp-chats.git
cd whatsapp-chats
npm install
```

### 2) Configure environment

Create `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional AI settings
VITE_OPENAI_API_KEY=your_openai_key
VITE_OLLAMA_BASE_URL=http://127.0.0.1:11434
VITE_OLLAMA_MODEL=llama3.2:3b

# Optional app settings
VITE_MESSAGE_TONE_URL=
VITE_REDUX_PERSIST_SECRET=your_secret
```

### 3) Run locally

```bash
npm run dev
```

### 4) Build production bundle

```bash
npm run build
```

## Deployment Notes

### Vercel

- No custom base path is required.
- Build output is generated for root hosting automatically.
- Domain example: `https://convolens-vs.vercel.app/`

## Troubleshooting

### Blank screen after deploy

- Ensure asset paths in generated `dist/index.html` match your host path.
- For Vercel root hosting, assets should look like `/assets/...`.
- Hard refresh once to clear old shell from browser cache.

### App not updating after release

- Bump app version in `package.json` before deploy.
- Version changes trigger cache cleanup and update flow.

### Firebase auth or data errors

- Confirm Firebase env vars are present at build time.
- Ensure anonymous auth and Firestore are enabled.
- Validate Firestore security rules allow authenticated reads/writes.

## Firestore Rules (Example)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if request.auth != null;

      match /messages/{messageId} {
        allow read, write, delete: if request.auth != null;
      }

      match /typing/{typingId} {
        allow read, write, delete: if request.auth != null;
      }

      match /users/{userId} {
        allow read, write, delete: if request.auth != null;
      }
    }
  }
}
```

## Author

Vivek Sharma

## License

MIT
