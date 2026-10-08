// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { launchdarklyRequest, failedResult, toLaunchdarklyError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const launchdarklyListMembers = tool({
  description: 'List account members (GET /members).',
  inputSchema: z.object({
    launchdarklyApiToken: tokenField,
    limit: z.number().int().optional(),
    offset: z.number().int().optional(),
    filter: z.string().optional(),
  }),
  execute: async ({ launchdarklyApiToken, limit, offset, filter }) => {
    try {
      const result = await launchdarklyRequest(launchdarklyApiToken, '/members', {
        query: { limit, offset, filter },
      });
      if (!result.ok) return failedResult('Failed to list members', result);
      return result.data;
    } catch (error) {
      return toLaunchdarklyError(error, 'Error listing members');
    }
  },
});

export const launchdarklyGetMember = tool({
  description: 'Get a member by ID (GET /members/{memberId}).',
  inputSchema: z.object({
    launchdarklyApiToken: tokenField,
    memberId: z.string().describe('Member ID'),
  }),
  execute: async ({ launchdarklyApiToken, memberId }) => {
    try {
      const result = await launchdarklyRequest(
        launchdarklyApiToken,
        `/members/${encodeURIComponent(memberId)}`,
      );
      if (!result.ok) return failedResult('Failed to get member', result);
      return result.data;
    } catch (error) {
      return toLaunchdarklyError(error, 'Error getting member');
    }
  },
});
