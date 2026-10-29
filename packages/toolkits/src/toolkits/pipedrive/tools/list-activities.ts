// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, shapeList } from './client.js';

export const pipedriveListActivities = tool({
  description:
    'Lists Pipedrive activities (calls, meetings, tasks, emails) with cursor pagination (v2). Filter by type via done flag, owner, person, organization, deal, or lead; sort by due date. Returns activities plus nextCursor when more pages exist.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (1-500, default 100)'),
    cursor: z.string().optional().describe('Pagination cursor from a previous response nextCursor'),
    filterId: z.number().optional().describe('Saved filter ID to apply'),
    ids: z.array(z.number()).optional().describe('Only return activities with these IDs'),
    ownerId: z.number().optional().describe('Only activities owned by this user ID'),
    personId: z.number().optional().describe('Only activities linked to this person ID'),
    orgId: z.number().optional().describe('Only activities linked to this organization ID'),
    dealId: z.number().optional().describe('Only activities linked to this deal ID'),
    leadId: z.string().optional().describe('Only activities linked to this lead UUID'),
    done: z.boolean().optional().describe('true = completed activities, false = upcoming'),
    updatedSince: z.string().optional().describe('Only activities updated at/after this time'),
    updatedUntil: z.string().optional().describe('Only activities updated at/before this time'),
    sortBy: z.string().optional().describe('Field to sort by, e.g. "due_date", "update_time"'),
    sortDirection: z.enum(['ASC', 'DESC']).optional().describe('Sort direction (default ASC)'),
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
    dealId,
    leadId,
    done,
    updatedSince,
    updatedUntil,
    sortBy,
    sortDirection,
  }) => {
    const result = await pipedriveRequest(pipedriveApiToken, '/api/v2/activities', {
      query: {
        limit,
        cursor,
        filter_id: filterId,
        ids,
        owner_id: ownerId,
        person_id: personId,
        org_id: orgId,
        deal_id: dealId,
        lead_id: leadId,
        done,
        updated_since: updatedSince,
        updated_until: updatedUntil,
        sort_by: sortBy,
        sort_direction: sortDirection,
      },
    });

    if (result.error) return result;

    const { items, nextCursor } = shapeList(result);
    return { activities: items, ...(nextCursor ? { nextCursor } : {}) };
  },
});
