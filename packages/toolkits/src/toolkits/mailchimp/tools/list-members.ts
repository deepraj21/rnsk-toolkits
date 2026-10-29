// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest, shapeCollection, nextOffset } from './client.js';

export const mailchimpListMembers = tool({
  description:
    'Lists members (contacts) of a Mailchimp audience with count/offset pagination. Filter by subscription status (subscribed/pending/unsubscribed/cleaned). Use the returned email to derive a subscriber_hash for single-member tools.',
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe('Mailchimp API key including data-center suffix (injected by system)'),
    listId: z.string().describe('Mailchimp audience (list) id'),
    status: z
      .enum(['subscribed', 'unsubscribed', 'pending', 'cleaned', 'transactional'])
      .optional()
      .describe('Filter by subscription status'),
    count: z.number().min(1).max(1000).optional().describe('Results per page (1-1000, default 10)'),
    offset: z.number().min(0).optional().describe('Number of results to skip (pagination)'),
    sinceChangedAt: z
      .string()
      .optional()
      .describe(
        'Only members changed at/after this ISO-8601 time, e.g. "2024-01-01T00:00:00+00:00"',
      ),
  }),
  execute: async ({ mailchimpApiKey, listId, status, count, offset, sinceChangedAt }) => {
    const result = await mailchimpRequest(mailchimpApiKey, `/lists/${listId}/members`, {
      query: {
        status,
        count,
        offset,
        since_last_changed: sinceChangedAt,
      },
    });

    if (result.error) return result;

    const { items, totalCount } = shapeCollection(result.data, 'members');
    const next = nextOffset(count ?? 10, offset, totalCount);
    return {
      members: items,
      totalCount,
      ...(next !== undefined ? { nextOffset: next } : {}),
    };
  },
});
