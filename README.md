# AudioPlayer — React + TypeScript

**[Live demo](https://kolomiets94.github.io/audioplayer/)**

A full-stack educational audio player built with React, TypeScript and Express. The project demonstrates an interactive audio interface, client-side state management, authentication and REST API integration.

## Features

- Custom HTML5 Audio player: play/pause, seeking, ±10-second controls and volume
- Track search
- Favorites persisted per authenticated user
- Registration and login with JWT authentication
- Password hashing with bcrypt
- User profile with editable name and avatar preview
- Responsive desktop and mobile interface
- Optimistic favorite updates with rollback when an API request fails

## Tech stack

**Frontend:** React 18, TypeScript, Redux Toolkit, React Redux, Axios, SCSS Modules, HTML5 Audio API

**Backend:** Node.js, Express, JSON Web Token, bcrypt, CORS, Morgan

## Technical highlights

- Audio playback logic is encapsulated in a reusable `useAudio` hook.
- Redux Toolkit manages application state.
- Express exposes REST endpoints for authentication, tracks and favorites.
- Protected API requests send the JWT in the Authorization header.
- Favorites are stored per authenticated user.
- The frontend rolls back an optimistic favorite update if the API request fails.

## Project structure

```text
.
├── audio-player/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── store/
│       ├── styles/
│       ├── types/
│       └── utils/
└── express-backend/
    ├── server.js
    └── package.json
```

## Run locally

Requires Node.js and npm.

**Backend**
```bash
cd express-backend
npm install
npm run dev
```

The API runs at `http://localhost:8000`.

**Frontend** — in a separate terminal:
```bash
cd audio-player
npm install
npm start
```

The React application runs at `http://localhost:3000`.

An optional `JWT_SECRET` environment variable can be configured for local development. Do not use demo secrets in production.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/register` | Register a user and return a JWT |
| POST | `/api/login` | Authenticate and return a JWT |
| GET | `/api/tracks` | Get tracks (protected) |
| GET | `/api/favorites` | Get the current user's favorites |
| POST | `/api/favorites` | Add a favorite |
| DELETE | `/api/favorites` | Remove a favorite |

## Notes and limitations

This is a portfolio/educational project. Demo data is stored in JSON files rather than a production database. For production use, secrets should be managed securely and persistent storage should be moved to a database.

## More projects

- [TravelBlog — React + TypeScript SPA](https://github.com/Kolomiets94/travel-blog)
- [VKMarusya — React 19 + TypeScript catalogue](https://github.com/Kolomiets94/VKMarusya)
- [Frontend portfolio](https://github.com/Kolomiets94)

## Author

**Alexander Kolomiets** — Junior Frontend Developer (React / TypeScript)

- GitHub: https://github.com/Kolomiets94
- Email: Kolomiets94@yandex.ru
- Telegram: @Kolomiets94
