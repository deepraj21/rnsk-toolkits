// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { resendRequest, failedResult, toResendError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');

export const resendCreateDomain = tool({
  description: 'Add a sending domain (POST /domains). Returns DNS records to configure.',
  inputSchema: z.object({
    resendApiKey: keyField,
    name: z.string().describe('Domain name, e.g. updates.example.com'),
    region: z.enum(['us-east-1', 'eu-west-1', 'sa-east-1', 'ap-northeast-1']).optional(),
    customReturnPath: z.string().optional(),
  }),
  execute: async ({ resendApiKey, name, region, customReturnPath }) => {
    try {
      const body: Record<string, unknown> = { name };
      if (region) body.region = region;
      if (customReturnPath) body.custom_return_path = customReturnPath;
      const result = await resendRequest(resendApiKey, '/domains', { method: 'POST', body });
      if (!result.ok) return failedResult('Failed to create domain', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error creating domain');
    }
  },
});

export const resendListDomains = tool({
  description: 'List domains on the account (GET /domains).',
  inputSchema: z.object({
    resendApiKey: keyField,
  }),
  execute: async ({ resendApiKey }) => {
    try {
      const result = await resendRequest(resendApiKey, '/domains');
      if (!result.ok) return failedResult('Failed to list domains', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error listing domains');
    }
  },
});

export const resendGetDomain = tool({
  description: 'Get domain details and DNS status (GET /domains/{id}).',
  inputSchema: z.object({
    resendApiKey: keyField,
    domainId: z.string(),
  }),
  execute: async ({ resendApiKey, domainId }) => {
    try {
      const result = await resendRequest(resendApiKey, `/domains/${encodeURIComponent(domainId)}`);
      if (!result.ok) return failedResult('Failed to get domain', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error getting domain');
    }
  },
});

export const resendVerifyDomain = tool({
  description: 'Trigger domain verification check (POST /domains/{id}/verify).',
  inputSchema: z.object({
    resendApiKey: keyField,
    domainId: z.string(),
  }),
  execute: async ({ resendApiKey, domainId }) => {
    try {
      const result = await resendRequest(
        resendApiKey,
        `/domains/${encodeURIComponent(domainId)}/verify`,
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to verify domain', result);
      return result.data;
    } catch (error) {
      return toResendError(error, 'Error verifying domain');
    }
  },
});

export const resendDeleteDomain = tool({
  description: 'Remove a domain (DELETE /domains/{id}).',
  inputSchema: z.object({
    resendApiKey: keyField,
    domainId: z.string(),
  }),
  execute: async ({ resendApiKey, domainId }) => {
    try {
      const result = await resendRequest(resendApiKey, `/domains/${encodeURIComponent(domainId)}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete domain', result);
      return result.data ?? { deleted: true, domainId };
    } catch (error) {
      return toResendError(error, 'Error deleting domain');
    }
  },
});
