import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Img,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "HFAI"
const SITE_URL = "https://hfa-i.org"

const NewsletterWelcomeEmail = () => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome — I'm glad you're here</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoBanner}>
          <Text style={logoText}>⛨ HFAI</Text>
        </Section>

        <Heading style={h1}>Welcome to the HFAI Newsletter</Heading>

        <Text style={text}>Hi there,</Text>

        <Text style={text}>
          I'm Nicolas Roth, founder of HFAI — and I'm genuinely glad you decided to subscribe.
        </Text>

        <Text style={text}>
          I started HFAI because I kept seeing the same gap: organizations want to govern their AI responsibly, but most don't have the practical tools to actually do it. There's no shortage of frameworks and principles. What's missing is the operational layer — the moment-to-moment accountability that turns good intentions into real oversight.
        </Text>

        <Text style={text}>
          That's what we're building, and that's what this newsletter is about.
        </Text>

        <Section style={highlightBox}>
          <Text style={highlightTitle}>What you'll get each month:</Text>
          <Text style={highlightItem}>📋 EU AI Act compliance updates & upcoming deadlines</Text>
          <Text style={highlightItem}>🔍 Practical NIST AI RMF guidance you can actually use</Text>
          <Text style={highlightItem}>⚡ Real governance strategies from practitioners in the field</Text>
          <Text style={highlightItem}>📊 Enforcement actions & industry trends worth knowing</Text>
        </Section>

        <Text style={text}>
          No fluff, no hype — just the information you need to govern your AI systems with confidence. If you ever have questions, thoughts, or just want to talk governance, reply to any email. I read every one.
        </Text>

        <Text style={text}>
          Welcome aboard. Let's make AI governance work.
        </Text>

        <Text style={signoff}>
          Nicolas Roth
        </Text>
        <Text style={signoffTitle}>
          Founder, HFAI
        </Text>

        <Hr style={hr} />

        <Text style={footer}>
          You signed up at <a href={SITE_URL} style={link}>hfa-i.org</a>. You can unsubscribe anytime using the link at the bottom of any email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewsletterWelcomeEmail,
  subject: "Welcome — I'm glad you're here | Nicolas Roth, HFAI",
  displayName: 'Newsletter welcome (personal)',
  previewData: {},
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '0', maxWidth: '520px', margin: '0 auto' }
const logoBanner = { backgroundColor: '#1a1a19', padding: '20px 28px', borderRadius: '12px 12px 0 0' }
const logoText = { color: '#c9a96e', fontSize: '18px', fontWeight: '700' as const, margin: '0', letterSpacing: '0.5px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '28px 28px 16px', padding: '0' }
const text = { fontSize: '15px', color: '#55575d', lineHeight: '1.7', margin: '0 28px 14px' }
const highlightBox = { backgroundColor: '#f8f7f4', borderRadius: '8px', padding: '16px 20px', margin: '8px 28px 16px' }
const highlightTitle = { fontSize: '14px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 8px' }
const highlightItem = { fontSize: '14px', color: '#333', lineHeight: '1.6', margin: '4px 0' }
const signoff = { fontSize: '15px', color: '#1a1a1a', fontWeight: '600' as const, margin: '24px 28px 2px', lineHeight: '1.4' }
const signoffTitle = { fontSize: '13px', color: '#999', margin: '0 28px 24px', lineHeight: '1.4' }
const hr = { borderColor: '#e5e5e5', margin: '24px 28px' }
const link = { color: '#c9a96e', textDecoration: 'underline' }
const footer = { fontSize: '13px', color: '#999', margin: '0 28px 28px', lineHeight: '1.5' }
