# Task Management API

Express and Mongoose REST API for the Task Management app.

## Requirements

- Node.js 18.11 or later
- Node.js local file storage, or MongoDB with a connection URI

## Setup

From the project root, install the API dependencies and create a local environment file:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

For local use without MongoDB, leave `MONGODB_URI` empty: tasks will persist in `server/data/tasks.json`. To use MongoDB instead, set `MONGODB_URI` to your database connection URI. Then start the API:

```powershell
npm run dev
```

The API listens on `http://localhost:5000` by default. `CLIENT_ORIGIN` accepts a comma-separated list of allowed frontend origins.

## Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Check API status |
| `GET` | `/api/tasks` | List tasks, newest first |
| `POST` | `/api/tasks` | Create a task |
| `PATCH` | `/api/tasks/:id` | Update one or more task fields |
| `DELETE` | `/api/tasks/:id` | Delete a task |

Task objects contain `title` (required, up to 200 characters), `description` (optional, up to 2000 characters), and `completed` (boolean, default `false`). Task responses also include MongoDB's `_id`, `createdAt`, and `updatedAt` fields.
