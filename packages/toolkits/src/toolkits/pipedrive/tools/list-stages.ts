// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, shapeList } from './client.js';

export const pipedriveListStages = tool({
  description:
    'Lists Pipedrive deal stages with cursor pagination (v2), optionally filtered to one pipeline. Returns each stage with its ID, name, pipeline, and position — use the stage ID when creating or moving deals.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    pipelineId: z.number().optional().describe('Only stages in this pipeline ID'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (1-500, default 100)'),
    cursor: z.string().optional().describe('Pagination cursor from a previous response nextCursor'),
    sortBy: z.string().optional().describe('Field to sort by, e.g. "order_nr"'),
    sortDirection: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default ASC)'),
  }),
  execute: async ({ pipedriveApiToken, pipelineId, limit, cursor, sortBy, sortDirection }) => {
    const result = await pipedriveRequest(pipedriveApiToken, '/api/v2/stages', {
      query: {
        pipeline_id: pipelineId,
        limit,
        cursor,
        sort_by: sortBy,
        sort_direction: sortDirection,
      },
    });

    if (result.error) return result;

    const { items, nextCursor } = shapeList(result);
    return { stages: items, ...(nextCursor ? { nextCursor } : {}) };
  },
});
