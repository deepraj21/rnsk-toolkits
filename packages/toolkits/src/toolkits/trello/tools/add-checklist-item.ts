// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloAddChecklistItem = tool({
  description:
    'Adds an item (checkbox row) to a Trello checklist. Provide the checklist id and an item name; optionally pre-check it, set a due date, or assign a member.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    checklistId: z.string().describe('Checklist id (from createChecklist / getCardChecklists)'),
    name: z.string().describe('Check item text'),
    pos: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Position: "top", "bottom" (default), or a number'),
    checked: z.boolean().optional().describe('Create the item already checked'),
    due: z.string().optional().describe('Due date for the item, ISO 8601 date'),
    idMember: z.string().optional().describe('Member id to assign to the item'),
  }),
  execute: async ({ trelloCredentials, checklistId, name, pos, checked, due, idMember }) => {
    if (!checklistId) return { error: 'checklistId is required.' };
    if (!name) return { error: 'name is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/checklists/${encodeURIComponent(checklistId)}/checkItems`,
      { method: 'POST', query: { name, pos, checked, due, idMember } },
    );
    if (result.error) return result;

    return result.data;
  },
});
