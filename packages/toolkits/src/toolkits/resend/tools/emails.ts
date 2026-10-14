// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { resendRequest, failedResult, toResendError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');

export const resendSendEmail = tool({
  description:
    'Send a transactional email (POST /emails). Requires verified from domain. Supports html/text, cc/bcc, reply_to, schedule, tags, and attachments.',
  inputSchema: z.object({
    resendApiKey: keyField,
    from: z.string().describe('Sender, e.g. Name <onboarding@yourdomain.com>'),
    to: z.array(z.string()).min(1).describe('Recipient email addresses'),
    subject: z.string(),
    html: z.string().optional(),
    text: z.string().optional(),
    cc: z.array(z.string()).optional(),
    bcc: z.array(z.string()).optional(),
    replyTo: z.union([z.string(), z.array(z.string())]).optional(),
    scheduledAt: z.string().optional().describe('ISO 8601 schedule time'),
    headers: z.record(z.string()).optional(),
    tags: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
    attachments: z
      .array(
        z.object({
          filename: z.string(),
          content: z.string().optional().describe('Base64-encoded content'),
          path: z.string().optional().describe('Remote URL Resend fetches'),
        }),
      )
      .optional(),
    params: z.record(z.any()).optional().describe('Additional Resend email fields'),
  }),
  execute: async ({
    resendApiKey,
    from,
    to,
    subject,
    html,
    text,
    cc,
    bcc,
    replyTo,
    scheduledAt,
    headers,
    tags,
    attachments,
    params,
  }) => {
    try {
      const body: Record<string, unknown> = {
        from,
        to,
        subject,
        ...params,
      };
      if (html) body.html = html;
      if (text) body.text = text;
      if (cc?.length) body.cc = cc;
      if (bcc?.length) body.bcc = bcc;
      if (replyTo !== undefined) body.reply_to = replyTo;
      if (scheduledAt) body.scheduled_at = scheduledAt;
      if (headers) body.headers = headers;
      if (tags) body.tags = tags;
      if (attachments) body.attachments = attachments;

      const result = await resendRequest(resendApiKey, '/emails', { method: 'POST', body });
      if (!result.ok) return failedResult('Failed to send email', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error sending email');
    }
  },
});

export const resendSendBatchEmails = tool({
  description: 'Send up to 100 emails in one request (POST /emails/batch).',
  inputSchema: z.object({
    resendApiKey: keyField,
    emails: z
      .array(z.record(z.any()))
      .min(1)
      .max(100)
      .describe('Array of email objects (from, to, subject, html, etc.)'),
  }),
  execute: async ({ resendApiKey, emails }) => {
    try {
      const result = await resendRequest(resendApiKey, '/emails/batch', {
        method: 'POST',
        body: emails,
      });
      if (!result.ok) return failedResult('Failed to send batch emails', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error sending batch emails');
    }
  },
});

export const resendGetEmail = tool({
  description: 'Retrieve a sent email by ID (GET /emails/{id}).',
  inputSchema: z.object({
    resendApiKey: keyField,
    emailId: z.string(),
  }),
  execute: async ({ resendApiKey, emailId }) => {
    try {
      const result = await resendRequest(resendApiKey, `/emails/${encodeURIComponent(emailId)}`);
      if (!result.ok) return failedResult('Failed to get email', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error getting email');
    }
  },
});

export const resendListEmails = tool({
  description: 'List sent emails with optional pagination (GET /emails).',
  inputSchema: z.object({
    resendApiKey: keyField,
    limit: z.number().int().optional(),
    after: z.string().optional().describe('Pagination cursor (email id)'),
    before: z.string().optional(),
  }),
  execute: async ({ resendApiKey, limit, after, before }) => {
    try {
      const result = await resendRequest(resendApiKey, '/emails', {
        query: { limit, after, before },
      });
      if (!result.ok) return failedResult('Failed to list emails', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error listing emails');
    }
  },
});

export const resendCancelEmail = tool({
  description: 'Cancel a scheduled email (POST /emails/{id}/cancel).',
  inputSchema: z.object({
    resendApiKey: keyField,
    emailId: z.string(),
  }),
  execute: async ({ resendApiKey, emailId }) => {
    try {
      const result = await resendRequest(
        resendApiKey,
        `/emails/${encodeURIComponent(emailId)}/cancel`,
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to cancel email', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error canceling email');
    }
  },
});
