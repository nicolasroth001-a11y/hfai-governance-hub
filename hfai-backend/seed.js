const pool = require('./db');

const DEMO_MODE = process.env.DEMO_SEED === 'true' || process.env.NODE_ENV !== 'production';

async function seed() {
  if (!DEMO_MODE) {
    console.log('SEED: Skipped (not in demo mode)');
    return;
  }

  const client = await pool.connect();
  try {
    // Check if data already exists
    const existing = await client.query('SELECT count(*)::int AS c FROM ai_systems');
    if (existing.rows[0].c > 0) {
      console.log('SEED: Data already exists, skipping');
      return;
    }

    console.log('SEED: Inserting demo data...');
    await client.query('BEGIN');

    // 1. AI Systems
    const systems = await client.query(`
      INSERT INTO ai_systems (name, description, model_type, provider, version, risk_level) VALUES
        ('Content Classifier',  'Classifies user-generated content for policy violations and toxicity levels.',        'classification', 'OpenAI',    'v2.1', 'medium'),
        ('Fraud Detector',      'Real-time transaction fraud scoring using behavioral and transactional signals.',      'anomaly',        'AWS',       'v3.0', 'high'),
        ('Support Bot',         'Customer-facing conversational agent handling account and billing inquiries.',          'generative',     'Anthropic', 'v1.4', 'critical'),
        ('Hiring Screener',     'Resumes ranking and candidate shortlisting for open positions.',                        'ranking',        'Google',    'v1.0', 'high'),
        ('Medical Triage Bot',  'Preliminary symptom assessment and care pathway recommendation for patients.',         'generative',     'OpenAI',    'v4.2', 'critical')
      RETURNING id, name
    `);

    const sysMap = {};
    systems.rows.forEach(r => { sysMap[r.name] = r.id; });

    // 2. Violations
    const violationRows = [
      [sysMap['Support Bot'],        null, 'AI committed to a $196 refund without human approval',                          'critical', '{"user_message":"I want to close my account and get a full refund","ai_response":"I\'ll process your $196 refund immediately.","confidence":0.72}'],
      [sysMap['Fraud Detector'],     null, 'Fraud score returned below threshold but transaction was flagged by bank',      'high',     '{"transaction_id":"TXN-8832","amount":4500,"score":0.31,"bank_flag":true}'],
      [sysMap['Content Classifier'], null, 'PII (email address) detected in classification output metadata',                'critical', '{"input":"Check user john@example.com","output_meta":{"contains_pii":true,"pii_types":["email"]}}'],
      [sysMap['Hiring Screener'],    null, 'Gender-correlated feature weighted above fairness threshold',                   'high',     '{"feature":"name_embedding","weight":0.42,"fairness_threshold":0.15,"bias_type":"gender"}'],
      [sysMap['Medical Triage Bot'], null, 'Hallucinated medication dosage in triage recommendation',                       'critical', '{"symptom":"chest pain","recommendation":"Take 500mg aspirin immediately","hallucination_score":0.89}'],
      [sysMap['Support Bot'],        null, 'Response lacked required explainability disclaimer',                            'medium',   '{"context":"billing dispute","explainability_score":0.28,"minimum_required":0.60}'],
      [sysMap['Fraud Detector'],     null, 'Model confidence dropped below monitoring threshold during batch run',          'low',      '{"batch_id":"B-4421","avg_confidence":0.55,"threshold":0.70,"records_affected":312}'],
      [sysMap['Content Classifier'], null, 'Classification latency exceeded SLA for 12% of requests',                       'medium',   '{"p99_latency_ms":4200,"sla_max_ms":2000,"affected_pct":12.3}'],
      [sysMap['Hiring Screener'],    null, 'Candidate ranking changed after re-run with identical inputs',                  'high',     '{"candidate_id":"C-0091","run1_rank":3,"run2_rank":17,"delta":14}'],
      [sysMap['Medical Triage Bot'], null, 'Patient data retained beyond allowed session window',                           'medium',   '{"session_id":"S-7788","retention_hours":48,"max_allowed_hours":24}'],
    ];

    const violations = await client.query(`
      INSERT INTO violations (ai_system_id, rule_id, description, severity, event_payload) VALUES
        ($1,  $2,  $3,  $4,  $5),
        ($6,  $7,  $8,  $9,  $10),
        ($11, $12, $13, $14, $15),
        ($16, $17, $18, $19, $20),
        ($21, $22, $23, $24, $25),
        ($26, $27, $28, $29, $30),
        ($31, $32, $33, $34, $35),
        ($36, $37, $38, $39, $40),
        ($41, $42, $43, $44, $45),
        ($46, $47, $48, $49, $50)
      RETURNING id
    `, violationRows.flat());

    const vIds = violations.rows.map(r => r.id);

    // 3. Human Reviews (for first 6 violations)
    const reviews = [
      [vIds[0], 'Demo Reviewer', 'reject',  'Refund committed without approval — escalate to compliance.'],
      [vIds[1], 'Demo Reviewer', 'approve', 'Bank flag was a false positive; fraud score acceptable.'],
      [vIds[2], 'Demo Reviewer', 'reject',  'PII leak confirmed — must sanitize output metadata.'],
      [vIds[3], 'Demo Reviewer', 'reject',  'Bias confirmed. Feature must be removed from model inputs.'],
      [vIds[4], 'Demo Reviewer', 'reject',  'Hallucinated dosage is dangerous — model must be retrained.'],
      [vIds[5], 'Demo Reviewer', 'approve', 'Low risk; disclaimer will be added in next release.'],
    ];

    const reviewResult = await client.query(`
      INSERT INTO human_reviews (violation_id, reviewer_name, decision, comments) VALUES
        ($1,$2,$3,$4), ($5,$6,$7,$8), ($9,$10,$11,$12),
        ($13,$14,$15,$16), ($17,$18,$19,$20), ($21,$22,$23,$24)
      RETURNING id, violation_id, decision
    `, reviews.flat());

    // 4. Audit Logs
    const auditEntries = [];

    // Detection logs for all violations
    vIds.forEach((vid, i) => {
      auditEntries.push(['violation_detected', 'violation', vid, `Automated detection: ${violationRows[i][2].substring(0, 60)}...`]);
      auditEntries.push(['notification_sent', 'violation', vid, 'Alert sent to governance team']);
    });

    // Review logs
    reviewResult.rows.forEach(r => {
      auditEntries.push(['review_submitted', 'human_review', r.id, `Review decision: ${r.decision}`]);
      auditEntries.push([`violation_${r.decision === 'approve' ? 'approved' : 'rejected'}`, 'violation', r.violation_id, `Violation ${r.decision} by Demo Reviewer`]);
    });

    // Build parameterized query
    const auditPlaceholders = auditEntries.map((_, i) => {
      const base = i * 4;
      return `($${base+1}, $${base+2}, $${base+3}, $${base+4})`;
    }).join(', ');

    await client.query(
      `INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES ${auditPlaceholders}`,
      auditEntries.flat()
    );

    await client.query('COMMIT');
    console.log(`SEED: Done — ${systems.rows.length} systems, ${vIds.length} violations, ${reviewResult.rows.length} reviews, ${auditEntries.length} audit logs`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('SEED ERROR:', err);
  } finally {
    client.release();
  }
}

module.exports = seed;
