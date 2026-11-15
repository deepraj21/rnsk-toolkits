// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralListBatchJobs = tool({
  description:
    'Lists batch jobs with their status (QUEUED/RUNNING/SUCCESS/FAILED/…), progress, and output files. Filter by model, agent, status, creation time, or metadata; page with page/pageSize (0-indexed) and order by created or -created.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    page: z.number().min(0).optional().describe('Page number, 0-indexed (default 0)'),
    pageSize: z.number().min(1).optional().describe('Items per page'),
    model: z.string().optional().describe('Filter by model ID'),
    agentId: z.string().optional().describe('Filter by agent id'),
    metadata: z.record(z.unknown()).optional().describe('Filter by metadata key/values'),
    createdAfter: z.string().optional().describe('ISO 8601 timestamp — only jobs created after it'),
    createdByMe: z.boolean().optional().describe('Only jobs created by the calling user'),
    status: z
      .array(
        z.enum([
          'QUEUED',
          'RUNNING',
          'SUCCESS',
          'FAILED',
          'TIMEOUT_EXCEEDED',
          'CANCELLATION_REQUESTED',
          'CANCELLED',
        ]),
      )
      .optional()
      .describe('Filter by one or more job statuses'),
    orderBy: z.enum(['created', '-created']).optional().describe('Sort order (default "-created")'),
  }),
  execute: async ({
    mistralToken,
    page,
    pageSize,
    model,
    agentId,
    metadata,
    createdAfter,
    createdByMe,
    status,
    orderBy,
  }) => {
    const result = await mistralRequest(mistralToken, '/batch/jobs', {
      query: {
        page,
        page_size: pageSize,
        model,
        agent_id: agentId,
        metadata,
        created_after: createdAfter,
        created_by_me: createdByMe,
        status,
        order_by: orderBy,
      },
    });
    if (result.error) return result;

    const data = result.data ?? {};
    return {
      object: data.object,
      data: Array.isArray(data.data) ? data.data : [],
      total: data.total,
    };
  },
});
