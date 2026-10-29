// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest, shapeCollection, nextOffset } from './client.js';

export const mailchimpListAudiences = tool({
  description:
    'Lists the Mailchimp account audiences (lists) with count/offset pagination. Returns each audience id, name, subscriber count, and stats. Use the audience id for member and campaign tools.',
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe(
        'Mailchimp API key including data-center suffix, e.g. "abc123...-us21" (injected by system)',
      ),
    count: z.number().min(1).max(1000).optional().describe('Results per page (1-1000, default 10)'),
    offset: z.number().min(0).optional().describe('Number of results to skip (pagination)'),
    fields: z
      .string()
      .optional()
      .describe('Comma-separated list of fields to return, e.g. "lists.id,lists.name,total_items"'),
  }),
  execute: async ({ mailchimpApiKey, count, offset, fields }) => {
    const result = await mailchimpRequest(mailchimpApiKey, '/lists', {
      query: { count, offset, fields },
    });

    if (result.error) return result;

    const { items, totalCount } = shapeCollection(result.data, 'lists');
    const next = nextOffset(count ?? 10, offset, totalCount);
    return {
      audiences: items,
      totalCount,
      ...(next !== undefined ? { nextOffset: next } : {}),
    };
  },
});
