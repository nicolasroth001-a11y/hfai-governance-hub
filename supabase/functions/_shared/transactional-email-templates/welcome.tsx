import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "HFAI"
const SITE_URL = "https://hfa-i.org"

interface WelcomeProps {
  name?: string
  companyName?: string
}

const WelcomeEmail = ({ name, companyName }: WelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME} — let's govern your AI</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoBanner}>
          <Text style={logoText}>⛨ HFAI</Text>
        </Section>
        <Heading style={h1}>
          {name ? `Welcome aboard, ${name}!` : 'Welcome to HFAI!'}
        </Heading>
        <Text style={text}>
          {companyName
            ? `Your account for ${companyName} is ready. You now have full access to HFAI's AI governance platform.`
            : `Your account is ready. You now have full access to HFAI's AI governance platform.`}
        </Text>
        <Text style={text}>
          Here's how to get started in the next 2 minutes:
        </Text>
        <Section style={stepSection}>
          <Text style={stepText}><strong>1.</strong> Connect your AI system via Proxy or REST API</Text>
          <Text style={stepText}><strong>2.</strong> Configure your first governance rule</Text>
          <Text style={stepText}><strong>3.</strong> Monitor events and violations in real-time</Text>
        </Section>
        <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
          <Button style={button} href={`${SITE_URL}/customer/dashboard`}>
            Go to Your Dashboard →
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={text}>
          Need help? Reply to this email or check our <a href={`${SITE_URL}/docs/sdk`} style={link}>SDK documentation</a>.
        </Text>
        <Text style={footer}>
          — The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Welcome to HFAI — Your AI Governance Platform',
  displayName: 'Welcome email (new signup)',
  previewData: { name: 'Jane', companyName: 'Acme Corp' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '0', maxWidth: '520px', margin: '0 auto' }
const logoBanner = { backgroundColor: '#1a1a19', padding: '20px 28px', borderRadius: '12px 12px 0 0' }
const logoText = { color: '#c9a96e', fontSize: '18px', fontWeight: '700' as const, margin: '0', letterSpacing: '0.5px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '28px 28px 16px', padding: '0' }
const text = { fontSize: '15px', color: '#55575d', lineHeight: '1.6', margin: '0 28px 16px' }
const stepSection = { backgroundColor: '#f8f7f4', borderRadius: '8px', padding: '16px 20px', margin: '8px 28px 16px' }
const stepText = { fontSize: '14px', color: '#333', lineHeight: '1.6', margin: '4px 0' }
const button = {
  backgroundColor: '#c9a96e',
  color: '#1a1a1a',
  fontWeight: '600' as const,
  fontSize: '14px',
  padding: '12px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block' as const,
}
const hr = { borderColor: '#e5e5e5', margin: '24px 28px' }
const link = { color: '#c9a96e', textDecoration: 'underline' }
const footer = { fontSize: '13px', color: '#999', margin: '0 28px 28px', lineHeight: '1.5' }
