// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest } from './client.js';

export const mailchimpCreateAudience = tool({
  description:
    'Creates a new Mailchimp audience (list). Requires name plus contact and campaign default sender info. Returns the new audience with its id — use that id for adding members and campaigns.',
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe('Mailchimp API key including data-center suffix (injected by system)'),
    name: z.string().describe('Audience name, e.g. "Newsletter Subscribers"'),
    company: z.string().describe('Company/organization name for the audience contact'),
    address1: z.string().describe('Contact street address'),
    city: z.string().describe('Contact city'),
    state: z.string().describe('Contact state/province'),
    country: z.string().describe('Contact two-letter country code, e.g. "US"'),
    zip: z.string().describe('Contact postal/ZIP code'),
    permissionReminder: z
      .string()
      .describe(
        'Permission reminder text appended to campaigns, e.g. "You are receiving this because you signed up at example.com"',
      ),
    fromName: z.string().describe('Default sender name for campaigns'),
    fromEmail: z.string().email().describe('Default sender email address'),
    subject: z.string().describe('Default campaign subject line'),
    title: z.string().describe('Default campaign title'),
    emailType: z.enum(['html', 'text']).optional().describe('Default email format (html or text)'),
  }),
  execute: async ({
    mailchimpApiKey,
    name,
    company,
    address1,
    city,
    state,
    country,
    zip,
    permissionReminder,
    fromName,
    fromEmail,
    subject,
    title,
    emailType,
  }) => {
    const body = {
      name,
      contact: { company, address1, city, state, country, zip },
      permission_reminder: permissionReminder,
      campaign_defaults: { from_name: fromName, from_email: fromEmail, subject, title },
    };
    if (emailType !== undefined) body.email_type_option = emailType;

    const result = await mailchimpRequest(mailchimpApiKey, '/lists', {
      method: 'POST',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
