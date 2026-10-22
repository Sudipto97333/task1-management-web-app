# Daymark frontend

## Run locally

```powershell
cd client
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). The frontend expects the API at `http://localhost:5000/api`; set `VITE_API_URL` in a local `.env` file to use a different API URL.

Start the API in a separate terminal. MongoDB is optional: leave `MONGODB_URI` empty in `server/.env` to persist tasks in a local JSON file, or set it to use MongoDB.
