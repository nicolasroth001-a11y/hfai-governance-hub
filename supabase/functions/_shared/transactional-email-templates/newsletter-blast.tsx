import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "HFAI"
const SITE_URL = "https://hfa-i.org"

interface NewsletterBlastProps {
  subject?: string
  preheader?: string
  content?: string
}

const NewsletterBlastEmail = ({ subject, preheader, content }: NewsletterBlastProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preheader || subject || 'HFAI Newsletter'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoBanner}>
          <Text style={logoText}>⛨ HFAI</Text>
        </Section>

        {subject && <Heading style={h1}>{subject}</Heading>}

        {content && (
          <Section style={contentSection}>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </Section>
        )}

        <Hr style={hr} />
        <Text style={footer}>
          You're receiving this because you subscribed at <a href={SITE_URL} style={link}>hfa-i.org</a>.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewsletterBlastEmail,
  subject: (data: Record<string, any>) => data.subject || 'HFAI Newsletter',
  displayName: 'Newsletter blast',
  previewData: { subject: 'Monthly AI Governance Update', content: '<p>Hello from HFAI!</p>' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '0', maxWidth: '520px', margin: '0 auto' }
const logoBanner = { backgroundColor: '#1a1a19', padding: '20px 28px', borderRadius: '12px 12px 0 0' }
const logoText = { color: '#c9a96e', fontSize: '18px', fontWeight: '700' as const, margin: '0', letterSpacing: '0.5px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '28px 28px 16px', padding: '0' }
const contentSection = { padding: '0 28px 16px', fontSize: '15px', color: '#55575d', lineHeight: '1.7' }
const hr = { borderColor: '#e5e5e5', margin: '24px 28px' }
const link = { color: '#c9a96e', textDecoration: 'underline' }
const footer = { fontSize: '13px', color: '#999', margin: '0 28px 28px', lineHeight: '1.5' }
