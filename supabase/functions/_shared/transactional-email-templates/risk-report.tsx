/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "HFAI"

interface RiskReportProps {
  executiveSummary?: string
  riskLevel?: string
  gaps?: { title: string; article: string; description: string; recommendation: string }[]
  strengths?: string[]
  nextSteps?: string[]
  estimatedFine?: string
}

const riskColor = (level?: string) => {
  if (level === "HIGH") return "#dc2626"
  if (level === "MODERATE") return "#d97706"
  return "#16a34a"
}

const RiskReportEmail = ({
  executiveSummary = "Your organization has compliance gaps that need attention.",
  riskLevel = "MODERATE",
  gaps = [],
  strengths = [],
  nextSteps = [],
  estimatedFine = "Up to €35M or 7% of global revenue",
}: RiskReportProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Personalized EU AI Act Compliance Risk Report</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={tagline}>PERSONALIZED REPORT FROM {SITE_NAME}</Text>
        <Heading style={h1}>EU AI Act Compliance Risk Report</Heading>

        {/* Risk Level Badge */}
        <Section style={{ textAlign: 'center' as const, margin: '16px 0 24px' }}>
          <Text style={{
            display: 'inline-block' as const,
            backgroundColor: riskColor(riskLevel),
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 700,
            padding: '6px 20px',
            borderRadius: '20px',
            letterSpacing: '0.1em',
            margin: '0',
          }}>
            {riskLevel} RISK
          </Text>
        </Section>

        {/* Executive Summary */}
        <Section style={sectionBox}>
          <Text style={sectionTitle}>Executive Summary</Text>
          <Text style={bodyText}>{executiveSummary}</Text>
        </Section>

        {/* Fine Exposure */}
        <Section style={{ ...sectionBox, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
          <Text style={sectionTitle}>Potential Fine Exposure</Text>
          <Text style={{ ...bodyText, color: '#dc2626', fontWeight: 600 }}>{estimatedFine}</Text>
        </Section>

        {/* Compliance Gaps */}
        {gaps.length > 0 && (
          <>
            <Hr style={hr} />
            <Text style={sectionTitle}>Compliance Gaps Identified</Text>
            {gaps.map((gap, i) => (
              <Section key={i} style={gapCard}>
                <Text style={gapTitle}>{gap.title}</Text>
                <Text style={gapArticle}>{gap.article}</Text>
                <Text style={bodyText}>{gap.description}</Text>
                <Text style={recLabel}>Recommendation:</Text>
                <Text style={recText}>{gap.recommendation}</Text>
              </Section>
            ))}
          </>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <>
            <Hr style={hr} />
            <Text style={sectionTitle}>What You're Doing Right</Text>
            {strengths.map((s, i) => (
              <Text key={i} style={bulletItem}>✓ {s}</Text>
            ))}
          </>
        )}

        {/* Next Steps */}
        {nextSteps.length > 0 && (
          <>
            <Hr style={hr} />
            <Text style={sectionTitle}>Recommended Next Steps</Text>
            {nextSteps.map((step, i) => (
              <Text key={i} style={bulletItem}>{i + 1}. {step}</Text>
            ))}
          </>
        )}

        <Hr style={hr} />

        {/* CTA */}
        <Section style={{ textAlign: 'center' as const, padding: '8px 0' }}>
          <Text style={{ fontSize: '14px', color: '#555', lineHeight: '1.5', margin: '0 0 16px' }}>
            {SITE_NAME} can close these gaps automatically with real-time monitoring, audit trails, and human oversight workflows.
          </Text>
          <a href="https://hfa-i.org/signup/customer" style={ctaButton}>
            Start Your Free Pilot →
          </a>
          <Text style={{ fontSize: '12px', color: '#999', margin: '12px 0 0' }}>
            Or{' '}
            <a href="https://calendly.com/nicolasroth001/hfai-demo" style={{ color: '#b8944f' }}>
              book a demo with our founder
            </a>
          </Text>
        </Section>

        <Text style={footer}>
          © {new Date().getFullYear()} {SITE_NAME} · Human-First AI Governance
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: RiskReportEmail,
  subject: 'Your EU AI Act Compliance Risk Report',
  displayName: 'Personalized risk report',
  previewData: {
    executiveSummary: 'Your organization has 2 significant compliance gaps that expose you to regulatory risk under the EU AI Act.',
    riskLevel: 'HIGH',
    gaps: [
      { title: 'Missing Audit Trails', article: 'Article 12 & 14', description: 'You cannot produce a complete audit trail of AI decisions.', recommendation: 'Implement logging for all AI system outputs.' },
    ],
    strengths: ['Human oversight processes are in place'],
    nextSteps: ['Deploy audit logging', 'Register AI systems', 'Assign compliance officer'],
    estimatedFine: 'Up to €35M or 7% of global annual revenue',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const tagline: React.CSSProperties = { fontSize: '10px', letterSpacing: '0.15em', color: '#b8944f', fontWeight: 600, margin: '0 0 8px' }
const h1: React.CSSProperties = { fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px', lineHeight: '1.3', textAlign: 'center' as const }
const hr: React.CSSProperties = { borderColor: '#e8e0d4', margin: '24px 0' }
const sectionBox: React.CSSProperties = { backgroundColor: '#f9f7f4', borderRadius: '8px', padding: '16px', marginBottom: '16px', border: '1px solid #e8e0d4' }
const sectionTitle: React.CSSProperties = { fontSize: '14px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }
const bodyText: React.CSSProperties = { fontSize: '13px', color: '#555', lineHeight: '1.6', margin: '0' }
const gapCard: React.CSSProperties = { backgroundColor: '#fff7ed', borderRadius: '8px', padding: '14px', marginBottom: '12px', border: '1px solid #fed7aa' }
const gapTitle: React.CSSProperties = { fontSize: '14px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 2px' }
const gapArticle: React.CSSProperties = { fontSize: '11px', color: '#b8944f', fontWeight: 600, margin: '0 0 6px' }
const recLabel: React.CSSProperties = { fontSize: '11px', fontWeight: 700, color: '#b8944f', margin: '8px 0 2px', textTransform: 'uppercase' as const }
const recText: React.CSSProperties = { fontSize: '13px', color: '#333', lineHeight: '1.5', margin: '0' }
const bulletItem: React.CSSProperties = { fontSize: '13px', color: '#555', lineHeight: '1.6', margin: '0 0 6px', paddingLeft: '4px' }
const ctaButton: React.CSSProperties = {
  display: 'inline-block', backgroundColor: '#b8944f', color: '#ffffff', fontSize: '14px',
  fontWeight: 600, padding: '12px 28px', borderRadius: '8px', textDecoration: 'none',
}
const footer: React.CSSProperties = { fontSize: '11px', color: '#999', textAlign: 'center' as const, margin: '28px 0 0' }
