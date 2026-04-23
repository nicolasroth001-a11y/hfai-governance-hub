/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as contactInquiry } from './contact-inquiry.tsx'
import { template as contactConfirmation } from './contact-confirmation.tsx'
import { template as weeklyComplianceReport } from './weekly-compliance-report.tsx'
import { template as welcome } from './welcome.tsx'
import { template as complianceChecklist } from './compliance-checklist.tsx'
import { template as newsletterWelcome } from './newsletter-welcome.tsx'
import { template as newsletterBlast } from './newsletter-blast.tsx'
import { template as blogDigest } from './blog-digest.tsx'
import { template as riskReport } from './risk-report.tsx'
import { template as hfaiExpertRequest } from './hfai-expert-request.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'contact-inquiry': contactInquiry,
  'contact-confirmation': contactConfirmation,
  'weekly-compliance-report': weeklyComplianceReport,
  'welcome': welcome,
  'compliance-checklist': complianceChecklist,
  'newsletter-welcome': newsletterWelcome,
  'newsletter-blast': newsletterBlast,
  'blog-digest': blogDigest,
  'risk-report': riskReport,
  'hfai-expert-request': hfaiExpertRequest,
}
