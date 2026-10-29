// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mailchimpRequest, shapeCollection, nextOffset } from './client.js';

export const mailchimpListCampaigns = tool({
  description:
    'Lists Mailchimp campaigns with count/offset pagination. Filter by status (save/schedule/sending/sent/paused), type (regular/plain-text/rss/abex), or a create-time lower bound. Use the campaign id for content, send, and report tools.',
  inputSchema: z.object({
    mailchimpApiKey: z
      .string()
      .optional()
      .describe('Mailchimp API key including data-center suffix (injected by system)'),
    status: z
      .enum(['save', 'schedule', 'sending', 'sent', 'paused', 'sending_skip_archive'])
      .optional()
      .describe('Filter by campaign status'),
    type: z
      .enum(['regular', 'plain_text', 'rss', 'abex'])
      .optional()
      .describe('Filter by campaign type'),
    sinceCreate_time: z
      .string()
      .optional()
      .describe('Only campaigns created at/after this ISO-8601 time'),
    count: z.number().min(1).max(1000).optional().describe('Results per page (1-1000, default 10)'),
    offset: z.number().min(0).optional().describe('Number of results to skip (pagination)'),
  }),
  execute: async ({ mailchimpApiKey, status, type, sinceCreate_time, count, offset }) => {
    const result = await mailchimpRequest(mailchimpApiKey, '/campaigns', {
      query: {
        status,
        type,
        since_create_time: sinceCreate_time,
        count,
        offset,
      },
    });

    if (result.error) return result;

    const { items, totalCount } = shapeCollection(result.data, 'campaigns');
    const next = nextOffset(count ?? 10, offset, totalCount);
    return {
      campaigns: items,
      totalCount,
      ...(next !== undefined ? { nextOffset: next } : {}),
    };
  },
});
