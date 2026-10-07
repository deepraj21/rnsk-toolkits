// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pulumiRequest, failedResult, toPulumiError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const pulumiGetUser = tool({
  description: 'Get the authenticated Pulumi Cloud user profile.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
  }),
  execute: async ({ pulumiAccessToken }) => {
    try {
      const result = await pulumiRequest(pulumiAccessToken, '/api/user');
      if (!result.ok) return failedResult('Failed to get user', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting user');
    }
  },
});

export const pulumiListUserStacks = tool({
  description:
    'List stacks visible to the authenticated user, with optional filters by organization, project, or tags.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    organization: z.string().optional().describe('Filter by organization name'),
    project: z.string().optional().describe('Filter by project name'),
    tagName: z.string().optional().describe('Filter by stack tag name'),
    tagValue: z.string().optional().describe('Filter by stack tag value'),
    roleId: z.string().optional().describe('Filter by custom role ID'),
    maxResults: z.number().int().optional().describe('Page size'),
    continuationToken: z.string().optional().describe('Pagination token from a prior response'),
  }),
  execute: async ({
    pulumiAccessToken,
    organization,
    project,
    tagName,
    tagValue,
    roleId,
    maxResults,
    continuationToken,
  }) => {
    try {
      const result = await pulumiRequest(pulumiAccessToken, '/api/user/stacks', {
        query: {
          organization,
          project,
          tagName,
          tagValue,
          roleID: roleId,
          maxResults,
          continuationToken,
        },
      });
      if (!result.ok) return failedResult('Failed to list user stacks', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error listing user stacks');
    }
  },
});

export const pulumiListAccessTokens = tool({
  description:
    'List personal access tokens for the authenticated user (metadata only, not secret values).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
  }),
  execute: async ({ pulumiAccessToken }) => {
    try {
      const result = await pulumiRequest(pulumiAccessToken, '/api/user/tokens');
      if (!result.ok) return failedResult('Failed to list access tokens', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error listing access tokens');
    }
  },
});

export const pulumiCreateAccessToken = tool({
  description:
    'Create a personal access token. The token value (pul-…) is returned once at creation and cannot be retrieved later.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    description: z.string().describe('Human-readable label for the token'),
    expires: z.number().int().optional().describe('Optional expiration as Unix epoch seconds'),
    reason: z.string().optional().describe('Optional audit reason query parameter'),
  }),
  execute: async ({ pulumiAccessToken, description, expires, reason }) => {
    try {
      const result = await pulumiRequest(pulumiAccessToken, '/api/user/tokens', {
        method: 'POST',
        query: reason !== undefined ? { reason } : undefined,
        body: {
          description,
          ...(expires !== undefined ? { expires } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create access token', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error creating access token');
    }
  },
});

export const pulumiDeleteAccessToken = tool({
  description: 'Revoke a personal access token by ID.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    tokenId: z.string().describe('Access token ID'),
  }),
  execute: async ({ pulumiAccessToken, tokenId }) => {
    try {
      const result = await pulumiRequest(pulumiAccessToken, `/api/user/tokens/${tokenId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete access token', result);
      return result.data ?? { deleted: true, tokenId };
    } catch (error) {
      return toPulumiError(error, 'Error deleting access token');
    }
  },
});
