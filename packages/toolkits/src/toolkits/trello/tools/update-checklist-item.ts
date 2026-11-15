// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloUpdateChecklistItem = tool({
  description:
    'Updates a checklist item on a Trello card — most commonly to tick it complete/incomplete, or to rename it, reassign it, move it, or change its due date. Needs the card id and the item id.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    cardId: z.string().describe('Card id or short link the item lives on'),
    idCheckItem: z.string().describe('Check item id (from getCardChecklists)'),
    state: z
      .enum(['complete', 'incomplete'])
      .optional()
      .describe('Mark the checkbox complete or incomplete'),
    name: z.string().optional().describe('Rename the check item'),
    idChecklist: z.string().optional().describe('Move the item to this checklist id'),
    pos: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Position: "top", "bottom", or a number'),
    due: z.string().optional().describe('Due date for the item, ISO 8601 date'),
    idMember: z.string().optional().describe('Member id to assign to the item'),
  }),
  execute: async ({
    trelloCredentials,
    cardId,
    idCheckItem,
    state,
    name,
    idChecklist,
    pos,
    due,
    idMember,
  }) => {
    if (!cardId) return { error: 'cardId is required.' };
    if (!idCheckItem) return { error: 'idCheckItem is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/cards/${encodeURIComponent(cardId)}/checkItem/${encodeURIComponent(idCheckItem)}`,
      { method: 'PUT', query: { state, name, idChecklist, pos, due, idMember } },
    );
    if (result.error) return result;

    return result.data;
  },
});
