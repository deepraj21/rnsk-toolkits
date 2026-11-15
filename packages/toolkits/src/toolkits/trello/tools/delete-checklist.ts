// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloDeleteChecklist = tool({
  description:
    'Permanently deletes a checklist (and all of its check items) from a Trello card. This cannot be undone — delete individual items with deleteChecklistItem if you only need to remove one.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    checklistId: z.string().describe('Checklist id to delete (from getCardChecklists)'),
  }),
  execute: async ({ trelloCredentials, checklistId }) => {
    if (!checklistId) return { error: 'checklistId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/checklists/${encodeURIComponent(checklistId)}`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { deleted: true, checklistId, result: result.data };
  },
});
