// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { compact, typeformRequest } from './client.js';

export const typeformUpsertWebhook = tool({
  description:
    'Creates or updates a webhook on a form, keyed by tag — set the target URL, which events to send (form_response, form_response_partial), and an optional signing secret for HMAC SHA256 verification. Updating an existing tag replaces its configuration. Needs the webhooks:write scope.',
  inputSchema: z.object({
    typeformToken: z.string().optional().describe('Typeform access token (injected by system)'),
    formId: z.string().min(1).describe('Form ID the webhook belongs to'),
    tag: z
      .string()
      .min(1)
      .describe('Unique webhook name on the form (created if absent, updated if present)'),
    url: z.string().min(1).describe('HTTPS endpoint that will receive the webhook payloads'),
    enabled: z
      .boolean()
      .optional()
      .describe('Send responses to the webhook immediately (default true on create)'),
    eventTypes: z
      .record(z.boolean())
      .optional()
      .describe(
        'Events to subscribe to, e.g. { form_response: true, form_response_partial: true }',
      ),
    secret: z
      .string()
      .optional()
      .describe(
        'Signing secret — payloads are HMAC SHA256-signed with it so you can verify Typeform sent them',
      ),
    verifySsl: z.boolean().optional().describe('Verify SSL certificates when delivering payloads'),
  }),
  execute: async ({ typeformToken, formId, tag, url, enabled, eventTypes, secret, verifySsl }) => {
    if (!formId || !tag) return { error: 'formId and tag are required.' };
    if (!url) return { error: 'url is required.' };

    const body = compact({
      url,
      enabled,
      event_types: eventTypes,
      secret,
      verify_ssl: verifySsl,
    });

    const result = await typeformRequest(
      typeformToken,
      `/forms/${encodeURIComponent(formId)}/webhooks/${encodeURIComponent(tag)}`,
      { method: 'PUT', body },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
