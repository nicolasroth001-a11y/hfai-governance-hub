const pool = require("../db.js");
const crypto = require("crypto");

function hashApiKey(apiKey) {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

const authApiKey = async (req, res, next) => {
  try {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
      return res.status(401).json({ error: "API key missing" });
    }

    const apiKeyHash = hashApiKey(apiKey);

    const result = await pool.query(
      "SELECT * FROM ai_systems WHERE api_key_hash = $1",
      [apiKeyHash]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Invalid API key" });
    }

    req.aiSystem = result.rows[0];
    next();

  } catch (err) {
    console.error("API key auth error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = authApiKey;
