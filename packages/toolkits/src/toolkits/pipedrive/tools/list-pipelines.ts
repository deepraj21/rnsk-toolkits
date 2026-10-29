// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, shapeList } from './client.js';

export const pipedriveListPipelines = tool({
  description:
    'Lists Pipedrive pipelines (sales pipelines) with cursor pagination. Returns each pipeline with its ID, name, and ordering — use the pipeline ID to list stages and deals.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (1-500, default 100)'),
    cursor: z.string().optional().describe('Pagination cursor from a previous response nextCursor'),
    sortBy: z.string().optional().describe('Field to sort by, e.g. "order_nr", "update_time"'),
    sortDirection: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default ASC)'),
  }),
  execute: async ({ pipedriveApiToken, limit, cursor, sortBy, sortDirection }) => {
    const result = await pipedriveRequest(pipedriveApiToken, '/api/v2/pipelines', {
      query: { limit, cursor, sort_by: sortBy, sort_direction: sortDirection },
    });

    if (result.error) return result;

    const { items, nextCursor } = shapeList(result);
    return { pipelines: items, ...(nextCursor ? { nextCursor } : {}) };
  },
});
