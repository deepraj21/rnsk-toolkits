// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, compact } from './client.js';

export const pipedriveCreateNote = tool({
  description:
    'Creates a Pipedrive note (HTML content) attached to exactly one object: a deal, person, organization, lead, project, or task — one of those IDs is required. Returns the new note with its ID.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    content: z
      .string()
      .describe('Note content in HTML, e.g. "<p>Discussed pricing, follow up Friday.</p>"'),
    dealId: z.number().optional().describe('Attach the note to this deal ID'),
    personId: z.number().optional().describe('Attach the note to this person ID'),
    orgId: z.number().optional().describe('Attach the note to this organization ID'),
    leadId: z.string().optional().describe('Attach the note to this lead UUID'),
    projectId: z.number().optional().describe('Attach the note to this project ID'),
    taskId: z.number().optional().describe('Attach the note to this task ID'),
    userId: z.number().optional().describe('User ID marked as the note author (admin only)'),
    addTime: z
      .string()
      .optional()
      .describe('Creation time "YYYY-MM-DD HH:MM:SS" (can be past or future)'),
    pinToDeal: z.boolean().optional().describe('Pin the note to the deal (requires dealId)'),
    pinToPerson: z.boolean().optional().describe('Pin the note to the person (requires personId)'),
  }),
  execute: async ({
    pipedriveApiToken,
    content,
    dealId,
    personId,
    orgId,
    leadId,
    projectId,
    taskId,
    userId,
    addTime,
    pinToDeal,
    pinToPerson,
  }) => {
    if (!pipedriveApiToken) {
      return { error: 'Pipedrive API key is required. Connect Pipedrive first.' };
    }
    const attachments = [leadId, dealId, personId, orgId, projectId, taskId].filter(
      (v) => v !== undefined && v !== null,
    );
    if (attachments.length === 0) {
      return {
        error:
          'A note must be attached to one object. Provide one of: dealId, personId, orgId, leadId, projectId, or taskId.',
      };
    }
    if (attachments.length > 1) {
      return {
        error: 'A note can only be attached to one object. Create separate notes for each object.',
      };
    }

    const body = compact({
      content,
      deal_id: dealId,
      person_id: personId,
      org_id: orgId,
      lead_id: leadId,
      project_id: projectId,
      task_id: taskId,
      user_id: userId,
      add_time: addTime,
      pinned_to_deal_flag: pinToDeal ? 1 : undefined,
      pinned_to_person_flag: pinToPerson ? 1 : undefined,
    });

    const result = await pipedriveRequest(pipedriveApiToken, '/api/v1/notes', {
      method: 'POST',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
