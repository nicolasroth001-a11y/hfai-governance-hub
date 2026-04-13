import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "HFAI"

interface ContactInquiryProps {
  name?: string
  company?: string
  email?: string
  message?: string
}

const ContactInquiryEmail = ({ name, company, email, message }: ContactInquiryProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New inquiry from {name || 'someone'} — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Contact Inquiry</Heading>
        <Text style={label}>Name</Text>
        <Text style={value}>{name || 'N/A'}</Text>
        <Text style={label}>Company</Text>
        <Text style={value}>{company || 'N/A'}</Text>
        <Text style={label}>Email</Text>
        <Text style={value}>{email || 'N/A'}</Text>
        <Hr style={hr} />
        <Text style={label}>Message</Text>
        <Text style={value}>{message || 'No message provided.'}</Text>
        <Text style={footer}>Sent via {SITE_NAME} contact form</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactInquiryEmail,
  subject: (data: Record<string, any>) =>
    `New inquiry from ${data.name || 'someone'} (${data.company || 'N/A'})`,
  to: 'nicolasroth@hfai.org',
  displayName: 'Contact form inquiry (to admin)',
  previewData: { name: 'Jane Doe', company: 'Acme Inc.', email: 'jane@acme.com', message: 'I would like to learn more about your AI governance platform.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '0 0 24px' }
const label = { fontSize: '12px', fontWeight: '600' as const, color: '#888888', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '16px 0 4px' }
const value = { fontSize: '15px', color: '#2a2a2a', lineHeight: '1.5', margin: '0 0 8px' }
const hr = { borderColor: '#e5e5e5', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
