const express = require('express');
const router = express.Router();
const pool = require('../db');
const authApiKey = require("../middleware/authApiKey");
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Wrap async middleware to handle rejections
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// -----------------------------------------------------
// POST /ai-events  (AI SYSTEM EVENT INGESTION)
// -----------------------------------------------------
router.post('/', asyncHandler(authApiKey), async (req, res) => {
  console.log("Incoming event:", req.body);

  try {
    const { event_type, payload } = req.body;
    const ai_system_id = req.aiSystem.id;

    // 1. Log the user event
    const userEvent = await pool.query(
      `INSERT INTO ai_events (ai_system_id, event_type, payload)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [ai_system_id, event_type, payload]
    );

    // 2. Run rule checks (unchanged)
    const rules = await pool.query(
      `SELECT * FROM rules WHERE ai_system_id = $1`,
      [ai_system_id]
    );

    for (const rule of rules.rows) {
      const violated = payload.includes(rule.trigger_keyword);

      if (violated) {
        const violation = await pool.query(
          `INSERT INTO violations (ai_system_id, rule_id, description, severity)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [
            ai_system_id,
            rule.id,
            `Rule violated: ${rule.description}`,
            rule.severity
          ]
        );

        await pool.query(
          `INSERT INTO audit_logs (action, entity_type, entity_id, details)
           VALUES ($1, $2, $3, $4)`,
          [
            'violation_created',
            'violation',
            violation.rows[0].id,
            `Auto-detected violation: ${rule.description}`
          ]
        );
      }
    }

    // 3. If user message, generate assistant reply
    let assistantEvent = null;

    if (event_type === "user_message") {
      const assistantReply = await generateAIResponse(payload);

      assistantEvent = await pool.query(
        `INSERT INTO ai_events (ai_system_id, event_type, payload)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [ai_system_id, "assistant_message", assistantReply]
      );
    }

    // 4. Return both events
    res.json({
      userEvent: userEvent.rows[0],
      assistantEvent: assistantEvent ? assistantEvent.rows[0] : null
    });

  } catch (err) {
    console.error('Error processing AI event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// -----------------------------------------------------
// GET /ai-events  (FETCH ALL EVENTS FOR FRONTEND)
// -----------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const events = await pool.query(
      `SELECT * FROM ai_events ORDER BY created_at DESC`
    );

    res.json(events.rows);
  } catch (err) {
    console.error("Error fetching AI events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function generateAIResponse(userText) {
  const completion = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [
      { role: "system", content: "You are a helpful AI assistant." },
      { role: "user", content: userText }
    ]
  });

  return completion.choices[0].message.content;
}

module.exports = router;
