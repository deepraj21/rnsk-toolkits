// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloCreateChecklist = tool({
  description:
    'Creates a checklist (to-do list) on a Trello card. Provide the card id and a name; optionally copy items from an existing checklist via idChecklistSource.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    idCard: z.string().describe('Card id or short link to attach the checklist to'),
    name: z.string().describe('Checklist name, e.g. "Launch steps"'),
    pos: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Position on the card: "top", "bottom", or a number'),
    idChecklistSource: z
      .string()
      .optional()
      .describe('Copy the items from this existing checklist id'),
  }),
  execute: async ({ trelloCredentials, idCard, name, pos, idChecklistSource }) => {
    if (!idCard) return { error: 'idCard is required.' };
    if (!name) return { error: 'name is required.' };

    const result = await trelloRequest(trelloCredentials, '/checklists', {
      method: 'POST',
      query: { idCard, name, pos, idChecklistSource },
    });
    if (result.error) return result;

    return result.data;
  },
});
