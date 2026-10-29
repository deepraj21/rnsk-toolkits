// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, shapeList } from './client.js';

export const pipedriveListOrganizations = tool({
  description:
    'Lists Pipedrive organizations with cursor pagination (v2). Filter by owner, sort, and include custom fields. Returns organizations plus nextCursor when more pages exist.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (1-500, default 100)'),
    cursor: z.string().optional().describe('Pagination cursor from a previous response nextCursor'),
    filterId: z.number().optional().describe('Saved filter ID to apply'),
    ids: z.array(z.number()).optional().describe('Only return organizations with these IDs'),
    ownerId: z.number().optional().describe('Only organizations owned by this user ID'),
    updatedSince: z.string().optional().describe('Only organizations updated at/after this time'),
    updatedUntil: z.string().optional().describe('Only organizations updated at/before this time'),
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
    updatedSince,
    updatedUntil,
    sortBy,
    sortDirection,
    includeFields,
    customFields,
    includeLabels,
  }) => {
    const result = await pipedriveRequest(pipedriveApiToken, '/api/v2/organizations', {
      query: {
        limit,
        cursor,
        filter_id: filterId,
        ids,
        owner_id: ownerId,
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
    return { organizations: items, ...(nextCursor ? { nextCursor } : {}) };
  },
});
