require('dotenv').config();
console.log("Groq key loaded:", !!process.env.GROQ_API_KEY);

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');


// INIT APP (only once!)
const app = express();

// MIDDLEWARE - Must be before routes!
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
  credentials: true
}));
app.use(express.json());

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// DEBUG LOADING ROUTERS
console.log("Loading aiSystemsRouter...");
const aiSystemsRouter = require('./routes/aiSystems');
console.log("Loaded aiSystemsRouter");

console.log("Loading violationsRouter...");
const violationsRouter = require('./routes/violations');
console.log("Loaded violationsRouter");

console.log("Loading humanReviewsRouter...");
const humanReviewsRouter = require('./routes/humanReviews');
console.log("Loaded humanReviewsRouter");

console.log("Loading auditLogsRouter...");
const auditLogsRouter = require('./routes/auditLogs');
console.log("Loaded auditLogsRouter");

console.log("Loading aiEventsRouter...");
const aiEventsRouter = require('./routes/aiEvents');
console.log("Loaded aiEventsRouter");

console.log("Groq key loaded:", !!process.env.GROQ_API_KEY);

// DB POOL
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: process.env.PGSSLMODE === "disable" ? false : true
});

console.log("Connected to DB:", process.env.PGDATABASE);
// ROUTES
app.use('/ai-systems', aiSystemsRouter);
app.use('/violations', violationsRouter);
app.use('/human-reviews', humanReviewsRouter);
app.use('/audit-logs', auditLogsRouter);
app.use('/ai-events', aiEventsRouter);

// START SERVER
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

