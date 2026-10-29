// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, shapeList } from './client.js';

export const pipedriveListPersons = tool({
  description:
    'Lists Pipedrive persons (contacts) with cursor pagination (v2). Filter by owner, organization, or deal; sort and include custom fields. Returns persons plus nextCursor when more pages exist.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (1-500, default 100)'),
    cursor: z.string().optional().describe('Pagination cursor from a previous response nextCursor'),
    filterId: z.number().optional().describe('Saved filter ID to apply'),
    ids: z.array(z.number()).optional().describe('Only return persons with these IDs'),
    ownerId: z.number().optional().describe('Only persons owned by this user ID'),
    orgId: z.number().optional().describe('Only persons linked to this organization ID'),
    dealId: z.number().optional().describe('Only persons linked to this deal ID'),
    updatedSince: z.string().optional().describe('Only persons updated at/after this time'),
    updatedUntil: z.string().optional().describe('Only persons updated at/before this time'),
    sortBy: z.string().optional().describe('Field to sort by, e.g. "update_time", "id"'),
    sortDirection: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default ASC)'),
    includeFields: z.array(z.string()).optional().describe('Extra fields to include'),
    customFields: z
      .array(z.string())
      .optional()
      .describe('Custom field keys (40-char hashes) to include, max 15'),
    includeLabels: z.boolean().optional().describe('Include label objects as {id,label}'),
  }),
  execute: async ({
    pipedriveApiToken,
    limit,
    cursor,
    filterId,
    ids,
    ownerId,
    orgId,
    dealId,
    updatedSince,
    updatedUntil,
    sortBy,
    sortDirection,
    includeFields,
    customFields,
    includeLabels,
  }) => {
    const result = await pipedriveRequest(pipedriveApiToken, '/api/v2/persons', {
      query: {
        limit,
        cursor,
        filter_id: filterId,
        ids,
        owner_id: ownerId,
        org_id: orgId,
        deal_id: dealId,
        updated_since: updatedSince,
        updated_until: updatedUntil,
        sort_by: sortBy,
        sort_direction: sortDirection,
        include_fields: includeFields,
        custom_fields: customFields,
        include_labels: includeLabels,
      },
    });

    if (result.error) return result;

    const { items, nextCursor } = shapeList(result);
    return { persons: items, ...(nextCursor ? { nextCursor } : {}) };
  },
});
