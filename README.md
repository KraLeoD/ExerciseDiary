# ExerciseDiary

Workout diary with GitHub-style activity heatmap, exercise tracking, and body weight logging.

Built with Expo (React Native Web) + Express + SQLite.

## Features

- Activity heatmap showing workout frequency
- Daily workout logging with exercises grouped by muscle group
- Exercise management (create, edit, delete)
- Per-exercise statistics with weight and reps charts
- Body weight tracking with trend chart
- Material Design 3 UI

## Running with Docker

```bash
docker compose up -d
```

The app will be available at `http://localhost:8851`.

Data is stored in `~/.dockerdata/ExerciseDiary/sqlite.db`.

## Development

### Backend

```bash
cd backend
npm install
DB_DIR=./data npm run dev
```

### Frontend

```bash
cd frontend
npm install
npx expo start --web
```

### Building for production

```bash
cd frontend
npx expo export --platform web
cd ../backend
npm start
```

## Database

Uses SQLite with three tables: `exercises`, `sets`, `weight`. The database file is fully compatible with the original Go version — you can import your existing `sqlite.db` without modification.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8851` | Server port |
| `HOST` | `0.0.0.0` | Server host |
| `DB_DIR` | `/data/ExerciseDiary` | Directory for sqlite.db |
