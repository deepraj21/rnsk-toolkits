// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { oktaRequest, failedResult, toOktaError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const oktaGetOrg = tool({
  description: 'Get Okta organization settings and metadata.',
  inputSchema: z.object({
    oktaCredentials: credField,
  }),
  execute: async ({ oktaCredentials }) => {
    try {
      const result = await oktaRequest(oktaCredentials, '/org');
      if (!result.ok) return failedResult('Failed to get organization', result);
      return result.data;
    } catch (error) {
      return toOktaError(error, 'Error getting organization');
    }
  },
});

export const oktaListSystemLogs = tool({
  description:
    'Query Okta System Log events since a timestamp (ISO 8601). Requires read-only admin or appropriate log permissions.',
  inputSchema: z.object({
    oktaCredentials: credField,
    since: z.string().describe('ISO 8601 timestamp, e.g. 2024-01-01T00:00:00.000Z'),
    until: z.string().optional().describe('End timestamp'),
    filter: z.string().optional().describe('Log filter expression'),
    q: z.string().optional().describe('Simple search query'),
    limit: z.number().int().min(1).max(1000).optional(),
    after: z.string().optional().describe('Pagination cursor'),
    sortOrder: z.enum(['ASCENDING', 'DESCENDING']).optional(),
  }),
  execute: async ({ oktaCredentials, since, until, filter, q, limit, after, sortOrder }) => {
    try {
      const result = await oktaRequest(oktaCredentials, '/logs', {
        query: { since, until, filter, q, limit, after, sortOrder },
      });
      if (!result.ok) return failedResult('Failed to list system logs', result);
      return { events: result.data, link: result.headers.link };
    } catch (error) {
      return toOktaError(error, 'Error listing system logs');
    }
  },
});
