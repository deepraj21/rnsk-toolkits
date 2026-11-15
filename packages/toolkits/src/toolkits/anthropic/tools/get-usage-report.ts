// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { anthropicRequest } from './client.js';

export const anthropicGetUsageReport = tool({
  description:
    'Reports your organization’s Messages API token usage over time, bucketed by day (default), hour, or minute. startingAt is required; endingAt and bucketWidth are optional. Filter by model, workspace, API key, service tier, speed, or context window, and group by any of those dimensions. Requires a personal non-workspace-scoped key, an sk-ant-admin key, or an org:admin OAuth token.',
  inputSchema: z.object({
    anthropicApiKey: z.string().optional().describe('Anthropic API key (injected by system)'),
    startingAt: z
      .string()
      .describe('RFC 3339 timestamp; buckets starting on/after it (e.g. "2026-01-01T00:00:00Z")'),
    endingAt: z.string().optional().describe('RFC 3339 timestamp; buckets ending before it'),
    bucketWidth: z
      .enum(['1d', '1h', '1m'])
      .optional()
      .describe('Time granularity (default 1d; limits: 31d / 168h / 1440m)'),
    groupBy: z
      .array(
        z.enum([
          'account_id',
          'api_key_id',
          'context_window',
          'inference_geo',
          'model',
          'service_account_id',
          'service_tier',
          'speed',
          'workspace_id',
        ]),
      )
      .optional()
      .describe('Group the report by these dimensions'),
    models: z.array(z.string()).optional().describe('Restrict to these model IDs'),
    workspaceIds: z.array(z.string()).optional().describe('Restrict to these workspace IDs'),
    apiKeyIds: z.array(z.string()).optional().describe('Restrict to these API key IDs'),
    serviceTiers: z
      .array(
        z.enum(['batch', 'flex', 'flex_discount', 'priority', 'priority_on_demand', 'standard']),
      )
      .optional()
      .describe('Restrict to these service tiers'),
    limit: z.number().min(1).optional().describe('Max time buckets in the response'),
    page: z.string().optional().describe('Cursor from a previous response’s next_page'),
  }),
  execute: async ({
    anthropicApiKey,
    startingAt,
    endingAt,
    bucketWidth,
    groupBy,
    models,
    workspaceIds,
    apiKeyIds,
    serviceTiers,
    limit,
    page,
  }) => {
    if (!startingAt) {
      return { error: 'startingAt is required (RFC 3339 timestamp).' };
    }

    const result = await anthropicRequest(
      anthropicApiKey,
      '/v1/organizations/usage_report/messages',
      {
        query: {
          starting_at: startingAt,
          ending_at: endingAt,
          bucket_width: bucketWidth,
          group_by: groupBy,
          models,
          workspace_ids: workspaceIds,
          api_key_ids: apiKeyIds,
          service_tiers: serviceTiers,
          limit,
          page,
        },
      },
    );
    if (result.error) return result;

    return {
      data: result.data?.data ?? result.data,
      hasMore: Boolean(result.data?.has_more),
      nextPage: result.data?.next_page ?? null,
    };
  },
});
