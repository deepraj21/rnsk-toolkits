// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, shapeList } from './client.js';

export const pipedriveListLeads = tool({
  description:
    'Lists Pipedrive leads (unqualified sales opportunities) with offset pagination (start/limit). Filter by owner, person, organization, or saved filter.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    ownerId: z.number().optional().describe('Only leads owned by this user ID'),
    personId: z.number().optional().describe('Only leads linked to this person ID'),
    organizationId: z.number().optional().describe('Only leads linked to this organization ID'),
    filterId: z.number().optional().describe('Saved filter ID to apply'),
    updatedSince: z.string().optional().describe('Only leads updated at/after this time'),
    start: z.number().min(0).optional().describe('Pagination offset (default 0)'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (1-500, default 100)'),
    sort: z.string().optional().describe('Sort expression, e.g. "-update_time"'),
  }),
  execute: async ({
    pipedriveApiToken,
    ownerId,
    personId,
    organizationId,
    filterId,
    updatedSince,
    start,
    limit,
    sort,
  }) => {
    const result = await pipedriveRequest(pipedriveApiToken, '/api/v1/leads', {
      query: {
        owner_id: ownerId,
        person_id: personId,
        organization_id: organizationId,
        filter_id: filterId,
        updated_since: updatedSince,
        start,
        limit,
        sort,
      },
    });

    if (result.error) return result;

    const { items, nextStart } = shapeList(result);
    return { leads: items, ...(nextStart !== undefined ? { nextStart } : {}) };
  },
});
