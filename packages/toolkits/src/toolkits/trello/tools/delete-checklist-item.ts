// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloDeleteChecklistItem = tool({
  description:
    'Deletes a check item from a Trello checklist. Pass the checklist id and the check item id (both from getCardChecklists).',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    checklistId: z.string().describe('Checklist id containing the item'),
    idCheckItem: z.string().describe('Check item id to delete'),
  }),
  execute: async ({ trelloCredentials, checklistId, idCheckItem }) => {
    if (!checklistId) return { error: 'checklistId is required.' };
    if (!idCheckItem) return { error: 'idCheckItem is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/checklists/${encodeURIComponent(checklistId)}/checkItems/${encodeURIComponent(idCheckItem)}`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, checklistId, idCheckItem, result: result.data };
  },
});
