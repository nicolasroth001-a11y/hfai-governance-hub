import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "HFAI"
const SITE_URL = "https://hfa-i.org"

interface BlogDigestProps {
  month?: string
  posts?: Array<{ title: string; excerpt: string; slug: string }>
}

const BlogDigestEmail = ({ month, posts }: BlogDigestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{month ? `${month} AI Governance Digest` : 'Your monthly AI governance digest'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoBanner}>
          <Text style={logoText}>⛨ HFAI</Text>
        </Section>

        <Heading style={h1}>
          {month ? `${month} Governance Digest` : 'Monthly Governance Digest'}
        </Heading>

        <Text style={text}>
          Here's what we published this month — practical insights for governing AI systems responsibly.
        </Text>

        {(posts || []).map((post, i) => (
          <Section key={i} style={postCard}>
            <Text style={postTitle}>{post.title}</Text>
            <Text style={postExcerpt}>{post.excerpt}</Text>
            <Button style={readMore} href={`${SITE_URL}/blog/${post.slug}`}>
              Read more →
            </Button>
          </Section>
        ))}

        {(!posts || posts.length === 0) && (
          <Section style={postCard}>
            <Text style={postExcerpt}>No new posts this month — but we're working on something good. Stay tuned.</Text>
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
  component: BlogDigestEmail,
  subject: (data: Record<string, any>) => `${data.month || 'Monthly'} AI Governance Digest — HFAI`,
  displayName: 'Blog digest (monthly)',
  previewData: {
    month: 'March 2026',
    posts: [
      { title: 'EU AI Act: What Changes in Q2', excerpt: 'Key deadlines and compliance requirements...', slug: 'eu-ai-act-q2' },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '0', maxWidth: '520px', margin: '0 auto' }
const logoBanner = { backgroundColor: '#1a1a19', padding: '20px 28px', borderRadius: '12px 12px 0 0' }
const logoText = { color: '#c9a96e', fontSize: '18px', fontWeight: '700' as const, margin: '0', letterSpacing: '0.5px' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#1a1a1a', margin: '28px 28px 16px', padding: '0' }
const text = { fontSize: '15px', color: '#55575d', lineHeight: '1.7', margin: '0 28px 16px' }
const postCard = { backgroundColor: '#f8f7f4', borderRadius: '8px', padding: '16px 20px', margin: '8px 28px 12px' }
const postTitle = { fontSize: '15px', fontWeight: '600' as const, color: '#1a1a1a', margin: '0 0 6px' }
const postExcerpt = { fontSize: '14px', color: '#55575d', lineHeight: '1.5', margin: '0 0 10px' }
const readMore = {
  backgroundColor: '#c9a96e',
  color: '#1a1a1a',
  fontWeight: '600' as const,
  fontSize: '13px',
  padding: '8px 16px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block' as const,
}
const hr = { borderColor: '#e5e5e5', margin: '24px 28px' }
const link = { color: '#c9a96e', textDecoration: 'underline' }
const footer = { fontSize: '13px', color: '#999', margin: '0 28px 28px', lineHeight: '1.5' }
