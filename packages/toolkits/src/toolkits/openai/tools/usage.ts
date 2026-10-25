// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { openaiRequest, missingKey, failedResult, toOpenAIError } from './client.js';

const keyField = z.string().optional().describe('Injected by system; do not provide');
const bucketWidthField = z
  .enum(['1m', '1h', '1d'])
  .optional()
  .describe('Bucket size for the time series: 1d (default), 1h, or 1m');

export const openaiGetUsageCompletions = tool({
  description:
    'Token usage and request counts over time for the organization, bucketed by time and optionally grouped by model, project, or API key. Requires an ADMIN API key (a regular project key returns 401).',
  inputSchema: z.object({
    openaiApiKey: keyField,
    startTime: z
      .number()
      .int()
      .describe('Start of the window as Unix seconds (required), e.g. 1754006400'),
    endTime: z
      .number()
      .int()
      .optional()
      .describe('End of the window as Unix seconds (exclusive, default now)'),
    bucketWidth: bucketWidthField,
    limit: z
      .number()
      .int()
      .min(1)
      .max(31)
      .optional()
      .describe('Buckets to return: 1d → max 31, 1h → max 168, 1m → max 1440'),
    groupBy: z
      .array(
        z.enum(['model', 'project_id', 'user_id', 'api_key_id', 'organization_id', 'endpoint']),
      )
      .optional()
      .describe('Dimensions to break the totals down by, e.g. ["model"]'),
    projectIds: z.array(z.string()).optional().describe('Restrict to these project IDs'),
  }),
  execute: async ({
    openaiApiKey,
    startTime,
    endTime,
    bucketWidth,
    limit,
    groupBy,
    projectIds,
  }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/organization/usage/completions', {
        query: {
          start_time: startTime,
          end_time: endTime,
          bucket_width: bucketWidth,
          limit,
          group_by: groupBy,
          project_ids: projectIds,
        },
      });
      if (!result.ok) return failedResult('Failed to get completions usage', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error getting completions usage');
    }
  },
});

export const openaiGetOrganizationCosts = tool({
  description:
    'Billed cost in USD over time for the organization (line-item level spend). Requires an ADMIN API key (a regular project key returns 401).',
  inputSchema: z.object({
    openaiApiKey: keyField,
    startTime: z
      .number()
      .int()
      .describe('Start of the window as Unix seconds (required), e.g. 1754006400'),
    endTime: z
      .number()
      .int()
      .optional()
      .describe('End of the window as Unix seconds (exclusive, default now)'),
    bucketWidth: bucketWidthField,
    limit: z.number().int().min(1).max(31).optional().describe('Buckets to return (1d: max 31)'),
    groupBy: z
      .array(z.enum(['line_item', 'project_id', 'organization_id']))
      .optional()
      .describe('Dimensions to break the costs down by, e.g. ["line_item"]'),
    projectIds: z.array(z.string()).optional().describe('Restrict to these project IDs'),
  }),
  execute: async ({
    openaiApiKey,
    startTime,
    endTime,
    bucketWidth,
    limit,
    groupBy,
    projectIds,
  }) => {
    if (!openaiApiKey) return missingKey();
    try {
      const result = await openaiRequest(openaiApiKey, '/organization/costs', {
        query: {
          start_time: startTime,
          end_time: endTime,
          bucket_width: bucketWidth,
          limit,
          group_by: groupBy,
          project_ids: projectIds,
        },
      });
      if (!result.ok) return failedResult('Failed to get organization costs', result);
      return result.data;
    } catch (error) {
      return toOpenAIError(error, 'Error getting organization costs');
    }
  },
});
