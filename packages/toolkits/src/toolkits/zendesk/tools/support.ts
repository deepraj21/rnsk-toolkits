// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zendeskRequest, failedResult, toZendeskError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Zendesk credentials JSON with subdomain, plus email+apiToken (API token) or accessToken (OAuth)',
  );

export const zendeskListSatisfactionRatings = tool({
  description: 'List CSAT satisfaction ratings with scores and comments.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/satisfaction_ratings.json');
      if (!result.ok) return failedResult('Failed to list satisfaction ratings', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing satisfaction ratings');
    }
  },
});

export const zendeskGetSatisfactionRating = tool({
  description: 'Get one satisfaction rating.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ratingId: z.number().int().describe('Rating ID'),
  }),
  execute: async ({ zendeskCredentials, ratingId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/satisfaction_ratings/${ratingId}.json`,
      );
      if (!result.ok) return failedResult('Failed to get satisfaction rating', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting satisfaction rating');
    }
  },
});

export const zendeskListSatisfactionReasons = tool({
  description: 'List CSAT rating reasons (e.g. resolution quality, wait time).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/satisfaction_reasons.json');
      if (!result.ok) return failedResult('Failed to list satisfaction reasons', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing satisfaction reasons');
    }
  },
});

export const zendeskUploadAttachment = tool({
  description:
    'Upload a small file for ticket comments (base64, ~50MB limit). Returns an upload token to attach.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    filename: z.string().describe('File name, e.g. screenshot.png'),
    contentBase64: z.string().describe('File content base64-encoded'),
    contentType: z.string().optional().describe('MIME type, e.g. image/png'),
  }),
  execute: async ({ zendeskCredentials, filename, contentBase64, contentType }) => {
    try {
      const buffer = Buffer.from(contentBase64, 'base64');
      const result = await zendeskRequest(zendeskCredentials, '/uploads.json', {
        method: 'POST',
        query: { filename },
        rawBody: buffer,
        contentType: contentType ?? 'application/octet-stream',
      });
      if (!result.ok) return failedResult('Failed to upload attachment', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error uploading attachment');
    }
  },
});

export const zendeskDeleteUpload = tool({
  description: 'Delete an unused upload token.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    uploadToken: z.string().describe('Upload token from the upload response'),
  }),
  execute: async ({ zendeskCredentials, uploadToken }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/uploads/${uploadToken}.json`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete upload', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting upload');
    }
  },
});

export const zendeskListJobStatuses = tool({
  description: 'List background job statuses.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/job_statuses.json');
      if (!result.ok) return failedResult('Failed to list job statuses', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing job statuses');
    }
  },
});

export const zendeskGetJobStatus = tool({
  description: 'Get one background job status (bulk import progress, errors).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    jobId: z.string().describe('Job status ID'),
  }),
  execute: async ({ zendeskCredentials, jobId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/job_statuses/${jobId}.json`);
      if (!result.ok) return failedResult('Failed to get job status', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting job status');
    }
  },
});

export const zendeskListLocales = tool({
  description: 'List account locales for localized content.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/locales.json');
      if (!result.ok) return failedResult('Failed to list locales', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing locales');
    }
  },
});

export const zendeskListBrands = tool({
  description: 'List brands (multi-brand accounts).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/brands.json');
      if (!result.ok) return failedResult('Failed to list brands', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing brands');
    }
  },
});

export const zendeskGetBrand = tool({
  description: 'Get one brand with subdomain and help-center state.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    brandId: z.number().int().describe('Brand ID'),
  }),
  execute: async ({ zendeskCredentials, brandId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/brands/${brandId}.json`);
      if (!result.ok) return failedResult('Failed to get brand', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting brand');
    }
  },
});

export const zendeskListSlaPolicies = tool({
  description: 'List SLA policies with metric targets and filters.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/sla_policies.json');
      if (!result.ok) return failedResult('Failed to list SLA policies', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing SLA policies');
    }
  },
});

export const zendeskGetSlaPolicy = tool({
  description: 'Get one SLA policy definition.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    policyId: z.number().int().describe('SLA policy ID'),
  }),
  execute: async ({ zendeskCredentials, policyId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/sla_policies/${policyId}.json`);
      if (!result.ok) return failedResult('Failed to get SLA policy', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting SLA policy');
    }
  },
});

export const zendeskListWebhooks = tool({
  description: 'List event webhooks with status and subscriptions.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/webhooks.json');
      if (!result.ok) return failedResult('Failed to list webhooks', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing webhooks');
    }
  },
});

export const zendeskGetWebhook = tool({
  description: 'Get one webhook with endpoint, method, and subscriptions.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    webhookId: z.string().describe('Webhook ID (UUID)'),
  }),
  execute: async ({ zendeskCredentials, webhookId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/webhooks/${webhookId}.json`);
      if (!result.ok) return failedResult('Failed to get webhook', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting webhook');
    }
  },
});

export const zendeskCreateWebhook = tool({
  description:
    'Create a webhook: name, endpoint, method, format, and event subscriptions (conditional_ticket_events for triggers).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    webhook: z
      .record(z.string(), z.any())
      .describe(
        'Webhook: name, endpoint, http_method, request_format, status, subscriptions [], authentication',
      ),
  }),
  execute: async ({ zendeskCredentials, webhook }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/webhooks.json', {
        method: 'POST',
        body: { webhook },
      });
      if (!result.ok) return failedResult('Failed to create webhook', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating webhook');
    }
  },
});

export const zendeskUpdateWebhook = tool({
  description: 'Update a webhook (endpoint, status, subscriptions, auth).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    webhookId: z.string().describe('Webhook ID (UUID)'),
    webhook: z.record(z.string(), z.any()).describe('Webhook attributes to update'),
  }),
  execute: async ({ zendeskCredentials, webhookId, webhook }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/webhooks/${webhookId}.json`, {
        method: 'PUT',
        body: { webhook },
      });
      if (!result.ok) return failedResult('Failed to update webhook', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating webhook');
    }
  },
});

export const zendeskDeleteWebhook = tool({
  description: 'Delete a webhook.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    webhookId: z.string().describe('Webhook ID (UUID)'),
  }),
  execute: async ({ zendeskCredentials, webhookId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/webhooks/${webhookId}.json`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete webhook', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting webhook');
    }
  },
});

export const zendeskTestWebhook = tool({
  description: 'Send a test request to a webhook endpoint with a custom payload.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    webhookId: z
      .string()
      .describe('Webhook ID (UUID) for existing webhooks; omit fields to test inline'),
    request: z
      .record(z.string(), z.any())
      .optional()
      .describe('Inline request override (endpoint, method, payload)'),
  }),
  execute: async ({ zendeskCredentials, webhookId, request }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/webhooks/test.json', {
        method: 'POST',
        query: { webhook_id: webhookId },
        body: request !== undefined ? { request } : {},
      });
      if (!result.ok) return failedResult('Failed to test webhook', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error testing webhook');
    }
  },
});

export const zendeskListWebhookInvocations = tool({
  description: 'List recent invocations (deliveries) of a webhook with statuses.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    webhookId: z.string().describe('Webhook ID (UUID)'),
  }),
  execute: async ({ zendeskCredentials, webhookId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/webhooks/${webhookId}/invocations.json`,
      );
      if (!result.ok) return failedResult('Failed to list webhook invocations', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing webhook invocations');
    }
  },
});

export const zendeskGetWebhookSigningSecret = tool({
  description: 'Get the signing secret of a webhook for payload verification.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    webhookId: z.string().describe('Webhook ID (UUID)'),
  }),
  execute: async ({ zendeskCredentials, webhookId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/webhooks/${webhookId}/signing_secret.json`,
      );
      if (!result.ok) return failedResult('Failed to get webhook signing secret', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting webhook signing secret');
    }
  },
});

export const zendeskResetWebhookSigningSecret = tool({
  description: 'Rotate the signing secret of a webhook (old signature stops working).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    webhookId: z.string().describe('Webhook ID (UUID)'),
  }),
  execute: async ({ zendeskCredentials, webhookId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/webhooks/${webhookId}/signing_secret/reset.json`,
        { method: 'PUT' },
      );
      if (!result.ok) return failedResult('Failed to reset webhook signing secret', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error resetting webhook signing secret');
    }
  },
});
