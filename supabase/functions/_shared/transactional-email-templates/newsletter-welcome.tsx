import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "HFAI"
const SITE_URL = "https://hfa-i.org"

const NewsletterWelcomeEmail = () => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to the HFAI newsletter — AI governance insights, monthly</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoBanner}>
          <Text style={logoText}>⛨ HFAI</Text>
        </Section>
        <Heading style={h1}>You're subscribed!</Heading>
        <Text style={text}>
          Thanks for joining the HFAI newsletter. Each month, you'll receive:
        </Text>
        <Section style={listSection}>
          <Text style={listItem}>📋 EU AI Act compliance updates & deadlines</Text>
          <Text style={listItem}>🔍 NIST AI RMF practical guidance</Text>
          <Text style={listItem}>⚡ Real-world governance strategies from practitioners</Text>
          <Text style={listItem}>📊 Industry trends and enforcement actions</Text>
        </Section>
        <Text style={text}>
          While you wait for the next issue, explore our latest resources:
        </Text>
        <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
          <Button style={button} href={`${SITE_URL}/blog`}>
            Read the Blog →
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          You signed up at hfa-i.org. You can unsubscribe anytime using the link at the bottom of any email.
        </Text>
        <Text style={footer}>
          — The {SITE_NAME} Team
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewsletterWelcomeEmail,
  subject: "You're subscribed to HFAI — AI Governance Insights",
  displayName: 'Newsletter welcome',
  previewData: {},
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '0', maxWidth: '520px', margin: '0 auto' }
const logoBanner = { backgroundColor: '#1a1a19', padding: '20px 28px', borderRadius: '12px 12px 0 0' }
const logoText = { color: '#c9a96e', fontSize: '18px', fontWeight: '700' as const, margin: '0', letterSpacing: '0.5px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '28px 28px 16px', padding: '0' }
const text = { fontSize: '15px', color: '#55575d', lineHeight: '1.6', margin: '0 28px 16px' }
const listSection = { backgroundColor: '#f8f7f4', borderRadius: '8px', padding: '16px 20px', margin: '8px 28px 16px' }
const listItem = { fontSize: '14px', color: '#333', lineHeight: '1.6', margin: '4px 0' }
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
const footer = { fontSize: '13px', color: '#999', margin: '0 28px 16px', lineHeight: '1.5' }
