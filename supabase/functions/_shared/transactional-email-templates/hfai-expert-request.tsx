import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "HFAI"

interface HfaiExpertRequestProps {
  orgName?: string
  requesterName?: string
  requesterEmail?: string
  orgContactEmail?: string
  orgId?: string
}

const HfaiExpertRequestEmail = ({ orgName, requesterName, requesterEmail, orgContactEmail, orgId }: HfaiExpertRequestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>HFAI Expert Reviewer requested by {orgName || 'an organization'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🔔 HFAI Expert Reviewer Requested</Heading>
        <Text style={label}>Organization</Text>
        <Text style={value}>{orgName || 'Unknown'}</Text>
        <Text style={label}>Requested by</Text>
        <Text style={value}>{requesterName || 'N/A'} ({requesterEmail || 'N/A'})</Text>
        <Text style={label}>Org Contact</Text>
        <Text style={value}>{orgContactEmail || 'N/A'}</Text>
        <Text style={label}>Org ID</Text>
        <Text style={value}>{orgId || 'N/A'}</Text>
        <Hr style={hr} />
        <Text style={value}>Please assign an HFAI Expert Reviewer to this organization through the Admin portal.</Text>
        <Text style={footer}>Sent via {SITE_NAME} Platform</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: HfaiExpertRequestEmail,
  subject: (data: Record<string, any>) =>
    `🔔 HFAI Expert Reviewer Requested — ${data.orgName || 'Unknown Org'}`,
  to: Deno.env.get('CONTACT_EMAIL') || 'nicolasroth001@gmail.com',
  displayName: 'HFAI Expert request (to admin)',
  previewData: { orgName: 'Acme Inc.', requesterName: 'Jane Doe', requesterEmail: 'jane@acme.com', orgContactEmail: 'contact@acme.com', orgId: 'org_123' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '0 0 24px' }
const label = { fontSize: '12px', fontWeight: '600' as const, color: '#888888', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '16px 0 4px' }
const value = { fontSize: '15px', color: '#2a2a2a', lineHeight: '1.5', margin: '0 0 8px' }
const hr = { borderColor: '#e5e5e5', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
