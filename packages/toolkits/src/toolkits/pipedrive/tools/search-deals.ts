// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, shapeList } from './client.js';

export const pipedriveSearchDeals = tool({
  description:
    'Full-text searches Pipedrive deals by term (title, notes, email, etc.) with cursor pagination. Narrow by person, organization, status, or pipeline. Faster and more precise than listing everything when you know part of the name.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    term: z.string().describe('Search term, e.g. "Acme"'),
    fields: z
      .array(z.string())
      .optional()
      .describe('Fields to search, e.g. ["title","notes","email"]'),
    exactMatch: z.boolean().optional().describe('Require an exact match instead of partial'),
    personId: z.number().optional().describe('Only matches linked to this person ID'),
    organizationId: z.number().optional().describe('Only matches linked to this organization ID'),
    status: z.enum(['open', 'won', 'lost']).optional().describe('Filter by deal status'),
    pipelineId: z.number().optional().describe('Only deals in this pipeline ID'),
    stageId: z.number().optional().describe('Only deals in this stage ID'),
    userId: z.number().optional().describe('Only deals owned by this user ID'),
    includeFields: z.array(z.string()).optional().describe('Extra fields to include on matches'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (default 100)'),
    cursor: z.string().optional().describe('Pagination cursor from a previous response nextCursor'),
  }),
  execute: async ({
    pipedriveApiToken,
    term,
    fields,
    exactMatch,
    personId,
    organizationId,
    status,
    pipelineId,
    stageId,
    userId,
    includeFields,
    limit,
    cursor,
  }) => {
    const result = await pipedriveRequest(pipedriveApiToken, '/api/v2/deals/search', {
      query: {
        term,
        fields,
        exact_match: exactMatch,
        person_id: personId,
        organization_id: organizationId,
        status,
        pipeline_id: pipelineId,
        stage_id: stageId,
        user_id: userId,
        include_fields: includeFields,
        limit,
        cursor,
      },
    });

    if (result.error) return result;

    const { items, nextCursor } = shapeList(result);
    return { deals: items, ...(nextCursor ? { nextCursor } : {}) };
  },
});
