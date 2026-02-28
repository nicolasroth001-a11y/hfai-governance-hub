require('dotenv').config();
console.log("Groq key loaded:", !!process.env.GROQ_API_KEY);

const express = require('express');
const cors = require('cors');

const app = express();

// MIDDLEWARE
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// LOAD ROUTERS
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const aiSystemsRouter = require('./routes/aiSystems');
const violationsRouter = require('./routes/violations');
const humanReviewsRouter = require('./routes/humanReviews');
const auditLogsRouter = require('./routes/auditLogs');
const aiEventsRouter = require('./routes/aiEvents');
const rulesRouter = require('./routes/rules');
const contactRouter = require('./routes/contact');

// ROUTES
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/ai-systems', aiSystemsRouter);
app.use('/violations', violationsRouter);
app.use('/human-reviews', humanReviewsRouter);
app.use('/audit-logs', auditLogsRouter);
app.use('/ai-events', aiEventsRouter);
app.use('/rules', rulesRouter);
app.use('/contact', contactRouter);

// SEED + START SERVER
const seed = require('./seed');
const PORT = process.env.PORT || 4000;
seed().then(() => {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
});
