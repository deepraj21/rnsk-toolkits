// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, shapeList } from './client.js';

export const pipedriveListNotes = tool({
  description:
    'Lists Pipedrive notes with offset pagination (start/limit). Filter notes by the object they are attached to: deal, person, organization, lead, project, or task, and by author or update time.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    dealId: z.number().optional().describe('Only notes attached to this deal ID'),
    personId: z.number().optional().describe('Only notes attached to this person ID'),
    orgId: z.number().optional().describe('Only notes attached to this organization ID'),
    leadId: z.string().optional().describe('Only notes attached to this lead UUID'),
    projectId: z.number().optional().describe('Only notes attached to this project ID'),
    taskId: z.number().optional().describe('Only notes attached to this task ID'),
    userId: z.number().optional().describe('Only notes authored by this user ID'),
    start: z.number().min(0).optional().describe('Pagination offset (default 0)'),
    limit: z.number().min(1).max(500).optional().describe('Results per page (1-500, default 100)'),
    sort: z.string().optional().describe('Sort expression, e.g. "-update_time"'),
    updatedSince: z.string().optional().describe('Only notes updated at/after this time'),
  }),
  execute: async ({
    pipedriveApiToken,
    dealId,
    personId,
    orgId,
    leadId,
    projectId,
    taskId,
    userId,
    start,
    limit,
    sort,
    updatedSince,
  }) => {
    const result = await pipedriveRequest(pipedriveApiToken, '/api/v1/notes', {
      query: {
        deal_id: dealId,
        person_id: personId,
        org_id: orgId,
        lead_id: leadId,
        project_id: projectId,
        task_id: taskId,
        user_id: userId,
        start,
        limit,
        sort,
        updated_since: updatedSince,
      },
    });

    if (result.error) return result;

    const { items, nextStart } = shapeList(result);
    return { notes: items, ...(nextStart !== undefined ? { nextStart } : {}) };
  },
});
