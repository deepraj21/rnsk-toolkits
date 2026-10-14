// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { resendRequest, failedResult, toResendError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');

export const resendListApiKeys = tool({
  description: 'List API keys (GET /api-keys). Does not return secret values.',
  inputSchema: z.object({
    resendApiKey: keyField,
  }),
  execute: async ({ resendApiKey }) => {
    try {
      const result = await resendRequest(resendApiKey, '/api-keys');
      if (!result.ok) return failedResult('Failed to list API keys', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error listing API keys');
    }
  },
});

export const resendCreateApiKey = tool({
  description: 'Create an API key (POST /api-keys). Secret is returned once.',
  inputSchema: z.object({
    resendApiKey: keyField,
    name: z.string().describe('Label for the key'),
    permission: z.enum(['full_access', 'sending_access']).optional(),
    domainId: z.string().optional().describe('Restrict key to one domain'),
  }),
  execute: async ({ resendApiKey, name, permission, domainId }) => {
    try {
      const body: Record<string, unknown> = { name };
      if (permission) body.permission = permission;
      if (domainId) body.domain_id = domainId;
      const result = await resendRequest(resendApiKey, '/api-keys', { method: 'POST', body });
      if (!result.ok) return failedResult('Failed to create API key', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error creating API key');
    }
  },
});

export const resendDeleteApiKey = tool({
  description: 'Delete an API key (DELETE /api-keys/{id}).',
  inputSchema: z.object({
    resendApiKey: keyField,
    apiKeyId: z.string(),
  }),
  execute: async ({ resendApiKey, apiKeyId }) => {
    try {
      const result = await resendRequest(
        resendApiKey,
        `/api-keys/${encodeURIComponent(apiKeyId)}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete API key', result);
      return result.data ?? { deleted: true, apiKeyId };
    } catch (error) {
      return toResendError(error, 'Error deleting API key');
    }
  },
});
