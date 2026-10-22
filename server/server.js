require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const taskRoutes = require("./routes/taskRoutes");
const taskStore = require("./models/taskStore");

const app = express();
const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI;
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  const databaseReady = !mongoUri || mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ok" : "unavailable",
    storage: mongoUri ? "mongodb" : "local-file",
    databaseReady,
  });
});
app.use("/api/tasks", taskRoutes);

app.use((err, _req, res, _next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body contains invalid JSON" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

async function startServer() {
  if (mongoUri) {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } else {
    console.log(`MongoDB URI not set; using local task file at ${taskStore.localFilePath}`);
  }

  app.listen(port, () => {
    console.log(`Task API listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start Task API:", error);
  process.exitCode = 1;
});
