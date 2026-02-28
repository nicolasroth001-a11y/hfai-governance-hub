const pool = require('./db');
const crypto = require('crypto');

const DEMO_MODE = process.env.DEMO_SEED === 'true' || process.env.NODE_ENV !== 'production';

function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

async function seed() {
  if (!DEMO_MODE) {
    console.log('SEED: Skipped (not in demo mode)');
    return;
  }

  const client = await pool.connect();
  try {
    // ── Create tables if not exist ──
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_email VARCHAR(255),
        api_key_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        password_salt VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'reviewer', 'customer')),
        org_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS rules (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) DEFAULT 'general',
        severity VARCHAR(50) DEFAULT 'medium',
        condition JSONB DEFAULT '{}',
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add org_id to ai_systems if not exists
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE ai_systems ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id);
      EXCEPTION WHEN others THEN NULL;
      END $$
    `);

    // Add org_id to violations if not exists
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE violations ADD COLUMN IF NOT EXISTS org_id INTEGER REFERENCES organizations(id);
      EXCEPTION WHEN others THEN NULL;
      END $$
    `);

    // Check if users already seeded
    const existingUsers = await client.query('SELECT count(*)::int AS c FROM users');
    if (existingUsers.rows[0].c > 0) {
      // Seed rules if missing
      const rulesExist = await client.query('SELECT count(*)::int AS c FROM rules');
      if (rulesExist.rows[0].c === 0) await seedRules(client);
      console.log('SEED: Users already exist, skipping');
      return;
    }

    console.log('SEED: Inserting demo data...');
    await client.query('BEGIN');

    // ── 0. Organizations ──
    const orgs = await client.query(`
      INSERT INTO organizations (name, contact_email) VALUES
        ('Acme Corp', 'admin@acme.demo'),
        ('TechStart Inc', 'hello@techstart.demo')
      RETURNING id, name
    `);
    const orgMap = {};
    orgs.rows.forEach(r => { orgMap[r.name] = r.id; });

    // ── 1. Users ──
    const adminPw = hashPassword('admin123');
    const reviewerPw = hashPassword('reviewer123');
    const customerPw = hashPassword('customer123');
    const customer2Pw = hashPassword('customer123');

    await client.query(`
      INSERT INTO users (email, name, password_hash, password_salt, role, org_id) VALUES
        ($1, 'Platform Admin', $2, $3, 'admin', NULL),
        ($4, 'Demo Reviewer', $5, $6, 'reviewer', NULL),
        ($7, 'Acme Admin', $8, $9, 'customer', $10),
        ($11, 'TechStart Admin', $12, $13, 'customer', $14)
    `, [
      'admin@hfai.com', adminPw.hash, adminPw.salt,
      'reviewer@hfai.com', reviewerPw.hash, reviewerPw.salt,
      'customer@acme.demo', customerPw.hash, customerPw.salt, orgMap['Acme Corp'],
      'hello@techstart.demo', customer2Pw.hash, customer2Pw.salt, orgMap['TechStart Inc'],
    ]);

    // ── 2. AI Systems (linked to orgs) ──
    const systems = await client.query(`
      INSERT INTO ai_systems (name, description, model_type, provider, version, risk_level, org_id) VALUES
        ('Content Classifier',  'Classifies user-generated content for policy violations.',        'classification', 'OpenAI',    'v2.1', 'medium',   $1),
        ('Fraud Detector',      'Real-time transaction fraud scoring.',                             'anomaly',        'AWS',       'v3.0', 'high',     $1),
        ('Support Bot',         'Customer-facing conversational agent.',                            'generative',     'Anthropic', 'v1.4', 'critical', $1),
        ('Hiring Screener',     'Resume ranking and candidate shortlisting.',                       'ranking',        'Google',    'v1.0', 'high',     $2),
        ('Medical Triage Bot',  'Symptom assessment and care pathway recommendation.',              'generative',     'OpenAI',    'v4.2', 'critical', $2)
      RETURNING id, name, org_id
    `, [orgMap['Acme Corp'], orgMap['TechStart Inc']]);

    const sysMap = {};
    systems.rows.forEach(r => { sysMap[r.name] = r; });

    // ── 3. Violations (linked to orgs via ai_system) ──
    const violationRows = [
      [sysMap['Support Bot'].id,        null, 'AI committed to a $196 refund without human approval',                          'critical', '{"user_message":"I want a full refund","ai_response":"Processing $196 refund.","confidence":0.72}', sysMap['Support Bot'].org_id],
      [sysMap['Fraud Detector'].id,     null, 'Fraud score below threshold but transaction flagged by bank',                   'high',     '{"transaction_id":"TXN-8832","amount":4500,"score":0.31}', sysMap['Fraud Detector'].org_id],
      [sysMap['Content Classifier'].id, null, 'PII detected in classification output metadata',                                'critical', '{"input":"Check user john@example.com","pii_types":["email"]}', sysMap['Content Classifier'].org_id],
      [sysMap['Hiring Screener'].id,    null, 'Gender-correlated feature weighted above fairness threshold',                   'high',     '{"feature":"name_embedding","weight":0.42,"bias_type":"gender"}', sysMap['Hiring Screener'].org_id],
      [sysMap['Medical Triage Bot'].id, null, 'Hallucinated medication dosage in triage recommendation',                       'critical', '{"symptom":"chest pain","hallucination_score":0.89}', sysMap['Medical Triage Bot'].org_id],
      [sysMap['Support Bot'].id,        null, 'Response lacked required explainability disclaimer',                            'medium',   '{"explainability_score":0.28,"minimum_required":0.60}', sysMap['Support Bot'].org_id],
      [sysMap['Fraud Detector'].id,     null, 'Model confidence dropped below monitoring threshold',                           'low',      '{"avg_confidence":0.55,"threshold":0.70}', sysMap['Fraud Detector'].org_id],
      [sysMap['Content Classifier'].id, null, 'Classification latency exceeded SLA',                                           'medium',   '{"p99_latency_ms":4200,"sla_max_ms":2000}', sysMap['Content Classifier'].org_id],
      [sysMap['Hiring Screener'].id,    null, 'Candidate ranking changed after re-run with identical inputs',                  'high',     '{"candidate_id":"C-0091","run1_rank":3,"run2_rank":17}', sysMap['Hiring Screener'].org_id],
      [sysMap['Medical Triage Bot'].id, null, 'Patient data retained beyond allowed session window',                           'medium',   '{"retention_hours":48,"max_allowed_hours":24}', sysMap['Medical Triage Bot'].org_id],
    ];

    const vPlaceholders = violationRows.map((_, i) => {
      const b = i * 6;
      return `($${b+1}, $${b+2}, $${b+3}, $${b+4}, $${b+5}, $${b+6})`;
    }).join(', ');

    const violations = await client.query(
      `INSERT INTO violations (ai_system_id, rule_id, description, severity, event_payload, org_id) VALUES ${vPlaceholders} RETURNING id`,
      violationRows.flat()
    );
    const vIds = violations.rows.map(r => r.id);

    // ── 4. Human Reviews ──
    const reviews = [
      [vIds[0], 'Demo Reviewer', 'reject',  'Refund committed without approval — escalate.'],
      [vIds[1], 'Demo Reviewer', 'approve', 'Bank flag was false positive.'],
      [vIds[2], 'Demo Reviewer', 'reject',  'PII leak confirmed — sanitize output.'],
      [vIds[3], 'Demo Reviewer', 'reject',  'Bias confirmed — remove feature.'],
      [vIds[4], 'Demo Reviewer', 'reject',  'Hallucinated dosage — retrain model.'],
      [vIds[5], 'Demo Reviewer', 'approve', 'Low risk — disclaimer in next release.'],
    ];

    const reviewResult = await client.query(`
      INSERT INTO human_reviews (violation_id, reviewer_name, decision, comments) VALUES
        ($1,$2,$3,$4), ($5,$6,$7,$8), ($9,$10,$11,$12),
        ($13,$14,$15,$16), ($17,$18,$19,$20), ($21,$22,$23,$24)
      RETURNING id, violation_id, decision
    `, reviews.flat());

    // ── 5. Audit Logs ──
    const auditEntries = [];
    vIds.forEach((vid, i) => {
      auditEntries.push(['violation_detected', 'violation', vid, `Automated detection: ${violationRows[i][2].substring(0, 60)}...`]);
      auditEntries.push(['notification_sent', 'violation', vid, 'Alert sent to governance team']);
    });
    reviewResult.rows.forEach(r => {
      auditEntries.push(['review_submitted', 'human_review', r.id, `Review: ${r.decision}`]);
      auditEntries.push([`violation_${r.decision === 'approve' ? 'approved' : 'rejected'}`, 'violation', r.violation_id, `Violation ${r.decision} by Demo Reviewer`]);
    });
    const auditPH = auditEntries.map((_, i) => {
      const b = i * 4;
      return `($${b+1}, $${b+2}, $${b+3}, $${b+4})`;
    }).join(', ');
    await client.query(`INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ${auditPH}`, auditEntries.flat());

    // ── 6. Rules ──
    await seedRules(client);

    await client.query('COMMIT');
    console.log(`SEED: Done — ${orgs.rows.length} orgs, 4 users, ${systems.rows.length} systems, ${vIds.length} violations, ${reviewResult.rows.length} reviews + rules`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('SEED ERROR:', err);
  } finally {
    client.release();
  }
}

async function seedRules(client) {
  await client.query(`
    INSERT INTO rules (name, description, category, severity, condition, enabled) VALUES
      ('No Harmful Content',       'AI must not generate harmful, violent, or illegal content.',                    'safety',      'critical', '{"check": "toxicity_score > 0.7"}',        true),
      ('No Hallucinations',        'AI must not fabricate facts, citations, or data.',                              'accuracy',     'critical', '{"check": "hallucination_score > 0.5"}',   true),
      ('No Personal Data Leakage', 'AI must not expose PII such as emails or addresses.',                          'privacy',      'critical', '{"check": "pii_detected = true"}',         true),
      ('Explainability Required',  'AI responses must include reasoning when confidence is low.',                   'transparency', 'medium',   '{"check": "explainability_score < 0.6"}',  true),
      ('Bias Detection',           'AI must not use features correlated with protected attributes.',               'fairness',     'high',     '{"check": "bias_weight > 0.15"}',          true),
      ('Latency SLA Compliance',   'AI responses must meet defined latency SLA.',                                  'performance',  'medium',   '{"check": "latency_ms > sla_max_ms"}',     true),
      ('Data Retention Limits',    'AI must not retain user data beyond the session window.',                       'privacy',      'medium',   '{"check": "retention_hours > max_hours"}',  true),
      ('Consistency Check',        'AI must produce consistent outputs for identical inputs.',                      'reliability',  'high',     '{"check": "output_delta > 5"}',            true)
    ON CONFLICT DO NOTHING
  `);
  console.log('SEED: Rules inserted');
}

module.exports = seed;
