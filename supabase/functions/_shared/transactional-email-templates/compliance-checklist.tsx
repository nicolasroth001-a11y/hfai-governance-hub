/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "HFAI"

interface ComplianceChecklistProps {
  email?: string
}

const CHECKLIST = [
  { title: "EU AI Act Obligation Timeline", desc: "Updated for Omnibus VII — know your key deadlines: GPAI rules (Aug 2026), standalone high-risk (Dec 2027), embedded high-risk (Aug 2028)." },
  { title: "NIST AI RMF Function Mapping", desc: "Map your AI governance workflows to the four NIST AI RMF functions: Govern, Map, Measure, Manage." },
  { title: "High-Risk AI System Identification", desc: "Use Annex III of the EU AI Act to classify your AI systems by risk tier. Determine if your systems fall under prohibited, high-risk, limited-risk, or minimal-risk categories." },
  { title: "Human Oversight Workflow Template", desc: "Establish clear escalation paths, reviewer assignments, and decision audit trails for every AI-generated output that affects individuals." },
  { title: "Compliance Documentation Requirements", desc: "Prepare technical documentation (Art. 11), risk management records (Art. 9), data governance logs (Art. 10), and conformity self-assessments (Art. 43)." },
]

const ComplianceChecklistEmail = ({ email }: ComplianceChecklistProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your AI Compliance Readiness Checklist from {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={tagline}>FREE RESOURCE FROM {SITE_NAME}</Text>
        <Heading style={h1}>AI Compliance Readiness Checklist</Heading>
        <Text style={intro}>
          Here's your actionable checklist for EU AI Act and NIST AI RMF compliance. Work through each item to assess your organization's readiness.
        </Text>

        <Hr style={hr} />

        {CHECKLIST.map((item, i) => (
          <Section key={i} style={checklistItem}>
            <Text style={itemNumber}>{i + 1}</Text>
            <Text style={itemTitle}>{item.title}</Text>
            <Text style={itemDesc}>{item.desc}</Text>
          </Section>
        ))}

        <Hr style={hr} />

        <Section style={ctaSection}>
          <Text style={ctaText}>
            Ready to automate your compliance workflow? {SITE_NAME} provides real-time AI governance monitoring, automated violation detection, and audit-ready documentation — all in one platform.
          </Text>
          <a href="https://hfa-i.org/signup/customer" style={ctaButton}>
            Start Your Free Pilot →
          </a>
        </Section>

        <Text style={footer}>
          © {new Date().getFullYear()} {SITE_NAME} · Human-First AI Governance
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ComplianceChecklistEmail,
  subject: 'Your AI Compliance Readiness Checklist',
  displayName: 'Compliance checklist lead magnet',
  previewData: { email: 'jane@company.com' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const tagline: React.CSSProperties = { fontSize: '10px', letterSpacing: '0.15em', color: '#b8944f', fontWeight: 600, margin: '0 0 8px' }
const h1: React.CSSProperties = { fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px', lineHeight: '1.3' }
const intro: React.CSSProperties = { fontSize: '14px', color: '#555', lineHeight: '1.6', margin: '0 0 20px' }
const hr: React.CSSProperties = { borderColor: '#e8e0d4', margin: '24px 0' }
const checklistItem: React.CSSProperties = { marginBottom: '20px' }
const itemNumber: React.CSSProperties = { fontSize: '11px', fontWeight: 700, color: '#b8944f', margin: '0 0 4px', letterSpacing: '0.05em' }
const itemTitle: React.CSSProperties = { fontSize: '15px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px' }
const itemDesc: React.CSSProperties = { fontSize: '13px', color: '#666', lineHeight: '1.5', margin: '0' }
const ctaSection: React.CSSProperties = { textAlign: 'center' as const, padding: '8px 0' }
const ctaText: React.CSSProperties = { fontSize: '13px', color: '#555', lineHeight: '1.5', margin: '0 0 16px' }
const ctaButton: React.CSSProperties = {
  display: 'inline-block', backgroundColor: '#b8944f', color: '#ffffff', fontSize: '14px',
  fontWeight: 600, padding: '12px 28px', borderRadius: '8px', textDecoration: 'none',
}
const footer: React.CSSProperties = { fontSize: '11px', color: '#999', textAlign: 'center' as const, margin: '28px 0 0' }
