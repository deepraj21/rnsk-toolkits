// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, compact } from './client.js';

export const pipedriveCreateActivity = tool({
  description:
    'Creates a Pipedrive activity (a call, meeting, task, email, etc. — the type string comes from your account, common values: call, email, meeting, task, deadline). Requires subject and type. Link it to a person/deal/organization/lead and set due date/time. Returns the new activity with its ID.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    subject: z.string().describe('Activity subject, e.g. "Follow-up call with Acme"'),
    type: z
      .string()
      .describe(
        'Activity type from your account, e.g. "call", "email", "meeting", "task", "deadline"',
      ),
    personId: z
      .number()
      .optional()
      .describe('Person ID the activity is about (added as primary participant)'),
    dealId: z.number().optional().describe('Linked deal ID'),
    orgId: z.number().optional().describe('Linked organization ID'),
    leadId: z.string().optional().describe('Linked lead UUID'),
    ownerId: z.number().optional().describe('User ID that owns the activity'),
    dueDate: z.string().optional().describe('Due date, ISO date "YYYY-MM-DD"'),
    dueTime: z.string().optional().describe('Due time, "HH:MM" (combined with dueDate)'),
    duration: z.string().optional().describe('Duration, e.g. "00:30"'),
    done: z.boolean().optional().describe('Mark as completed (default false)'),
    busy: z.boolean().optional().describe('Mark the owner as busy in their calendar'),
    note: z.string().optional().describe('Note text on the activity'),
    location: z
      .string()
      .optional()
      .describe('Full address of the activity (sent as location.value)'),
    priority: z
      .number()
      .optional()
      .describe('Priority code (mappable via the Activity Fields API)'),
  }),
  execute: async ({
    pipedriveApiToken,
    subject,
    type,
    personId,
    dealId,
    orgId,
    leadId,
    ownerId,
    dueDate,
    dueTime,
    duration,
    done,
    busy,
    note,
    location,
    priority,
  }) => {
    const body = compact({
      subject,
      type,
      participants: personId !== undefined ? [{ person_id: personId, primary: true }] : undefined,
      deal_id: dealId,
      org_id: orgId,
      lead_id: leadId,
      owner_id: ownerId,
      due_date: dueDate,
      due_time: dueTime,
      duration,
      done,
      busy,
      note,
      location: location !== undefined ? { value: location } : undefined,
      priority,
    });

    const result = await pipedriveRequest(pipedriveApiToken, '/api/v2/activities', {
      method: 'POST',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
