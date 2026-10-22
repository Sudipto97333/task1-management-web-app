# Daymark Task Manager

A responsive task management website with a React frontend and an Express API. By default, the API stores tasks in a local JSON file, so the app runs without a MongoDB installation. You can optionally configure MongoDB for database-backed storage.

## Requirements

- Node.js 18.11 or later
- npm
- MongoDB only if you choose MongoDB storage

## Run locally

1. Install the backend dependencies:

   ```powershell
   cd server
   npm install
   Copy-Item .env.example .env
   ```

   Leave `MONGODB_URI` empty to save tasks in `server/data/tasks.json`, or set it to your MongoDB connection URI.

2. In a terminal at the project root, start the API:

   ```powershell
   npm --prefix server run dev
   ```

3. In another terminal, start the frontend:

   ```powershell
   npm --prefix client install
   npm --prefix client run dev -- --host 127.0.0.1
   ```

4. Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

In VS Code, you can also run **Run Task Management Website** from the task runner to start both services.

## API

The backend runs at `http://localhost:5000`. See [server/README.md](server/README.md) for the health check and task endpoint details. The frontend defaults to `http://localhost:5000/api`; set `VITE_API_URL` in `client/.env` to change it.
