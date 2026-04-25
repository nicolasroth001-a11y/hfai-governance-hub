---
name: AI-SBOM (AI Bill of Materials)
description: Customer-facing /customer/ai-sbom page aggregating ai_systems + versions + vendor_risk + data_lineage into a single exportable artifact (JSON + PDF). Specification HFAI-AI-SBOM v1.0. Positioned as moat vs APIR.
type: feature
---
# AI-SBOM

Path: `/customer/ai-sbom` · Component: `src/pages/customer/CustomerAISBOM.tsx` · Sidebar: Governance group.

Aggregates four tables per AI system: `ai_systems`, `ai_system_versions`, `vendor_risk_assessments`, `data_lineage_records`.

Exports:
- **JSON**: `bomFormat: "HFAI-AI-SBOM"`, `specVersion: "1.0"` — modeled on CycloneDX/SPDX SBOM conventions adapted for AI.
- **PDF**: jsPDF summary + per-system breakdown.

**Completeness score** (0–100): +20 each for provider set, EU risk tier classified, ≥1 version, ≥1 vendor, ≥1 lineage record.

**Why it exists**: Closes the gap vs APIR's "AI-SBOM™" claim. Maps to EU AI Act Article 11 (technical documentation) and ISO/IEC 42001 traceability.
