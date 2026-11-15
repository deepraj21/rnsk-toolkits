// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicGetCostReport = tool({
  description:
    'Reports your organization’s API costs in USD (decimal strings in cents), bucketed daily only. startingAt is required. Group by workspace_id or description for attribution and chargebacks. Priority Tier costs are not included. Requires a personal non-workspace-scoped key, an sk-ant-admin key, or an org:admin OAuth token.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    startingAt: z
      .string()
      .describe('RFC 3339 timestamp; buckets starting on/after it (e.g. "2026-01-01T00:00:00Z")'),
    endingAt: z.string().optional().describe('RFC 3339 timestamp; buckets ending before it'),
    groupBy: z
      .array(z.enum(['workspace_id', 'description']))
      .optional()
      .describe('Group costs by workspace or description'),
    limit: z.number().min(1).optional().describe('Max time buckets in the response'),
    page: z.string().optional().describe('Cursor from a previous response’s next_page'),
  }),
  execute: async ({ anthropicApiKey, startingAt, endingAt, groupBy, limit, page }) => {
    if (!startingAt) {
      return { error: 'startingAt is required (RFC 3339 timestamp).' };
    }

    const result = await anthropicRequest(anthropicApiKey, '/v1/organizations/cost_report', {
      query: {
        starting_at: startingAt,
        ending_at: endingAt,
        group_by: groupBy,
        limit,
        page,
      },
    });
    if (result.error) return result;

    return {
      data: result.data?.data ?? result.data,
      hasMore: Boolean(result.data?.has_more),
      nextPage: result.data?.next_page ?? null,
    };
  },
});
