// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, shapeList } from './client.js';

export const pipedriveListDeals = tool({
  description:
    'Lists Pipedrive deals with cursor pagination (v2). Filter by pipeline, stage, status (open/won/lost), owner, person, or organization, and sort or include custom fields. Returns deals plus nextCursor when more pages exist.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (1-500, default 100)'),
    cursor: z.string().optional().describe('Pagination cursor from a previous response nextCursor'),
    filterId: z.number().optional().describe('Saved filter ID to apply'),
    ids: z.array(z.number()).optional().describe('Only return deals with these IDs'),
    ownerId: z.number().optional().describe('Only deals owned by this user ID'),
    personId: z.number().optional().describe('Only deals linked to this person ID'),
    orgId: z.number().optional().describe('Only deals linked to this organization ID'),
    pipelineId: z.number().optional().describe('Only deals in this pipeline ID'),
    stageId: z.number().optional().describe('Only deals in this stage ID'),
    status: z.enum(['open', 'won', 'lost']).optional().describe('Filter by deal status'),
    updatedSince: z
      .string()
      .optional()
      .describe('Only deals updated at/after this time, e.g. "2024-01-01 00:00:00"'),
    updatedUntil: z.string().optional().describe('Only deals updated at/before this time'),
    sortBy: z
      .string()
      .optional()
      .describe('Field to sort by, e.g. "update_time", "id", "expected_close_date"'),
    sortDirection: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default ASC)'),
    includeFields: z
      .array(z.string())
      .optional()
      .describe('Extra fields to include, e.g. ["notes_count","products_count"]'),
    customFields: z
      .array(z.string())
      .optional()
      .describe('Custom field keys (40-char hashes) to include, max 15'),
    includeOptionLabels: z
      .boolean()
      .optional()
      .describe('Return option custom fields as {id,label} objects'),
  }),
  execute: async ({
    pipedriveApiToken,
    limit,
    cursor,
    filterId,
    ids,
    ownerId,
    personId,
    orgId,
    pipelineId,
    stageId,
    status,
    updatedSince,
    updatedUntil,
    sortBy,
    sortDirection,
    includeFields,
    customFields,
    includeOptionLabels,
  }) => {
    const result = await pipedriveRequest(pipedriveApiToken, '/api/v2/deals', {
      query: {
        limit,
        cursor,
        filter_id: filterId,
        ids,
        owner_id: ownerId,
        person_id: personId,
        org_id: orgId,
        pipeline_id: pipelineId,
        stage_id: stageId,
        status,
        updated_since: updatedSince,
        updated_until: updatedUntil,
        sort_by: sortBy,
        sort_direction: sortDirection,
        include_fields: includeFields,
        custom_fields: customFields,
        include_option_labels: includeOptionLabels,
      },
    });

    if (result.error) return result;

    const { items, nextCursor } = shapeList(result);
    return { deals: items, ...(nextCursor ? { nextCursor } : {}) };
  },
});
