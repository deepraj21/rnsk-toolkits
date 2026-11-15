// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloUpdateCard = tool({
  description:
    'Updates a Trello card: rename, rewrite the description, move to another list (idList), change due/start dates, reorder (pos), assign or unassign members, apply or clear labels, or archive it (closed). Pass only the fields you want to change.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    cardId: z.string().describe('Card id or short link'),
    name: z.string().optional().describe('New card title'),
    desc: z.string().optional().describe('New card description'),
    idList: z.string().optional().describe('Move the card to this list id'),
    due: z.string().optional().describe('New due date, ISO 8601'),
    dueComplete: z.boolean().optional().describe('Mark the due date complete/incomplete'),
    start: z.string().optional().describe('New start date, ISO 8601'),
    pos: z
      .union([z.string(), z.number()])
      .optional()
      .describe('Position: "top", "bottom", or an absolute number'),
    closed: z.boolean().optional().describe('Archive (true) or restore (false) the card'),
    idMembers: z
      .string()
      .optional()
      .describe('Comma-separated member ids to set as the full assignment list'),
    idLabels: z
      .string()
      .optional()
      .describe('Comma-separated label ids to set as the full label list'),
    subscribed: z.boolean().optional().describe('Subscribe the member to the card'),
    url: z.string().optional().describe('New link URL for the card'),
  }),
  execute: async ({
    trelloCredentials,
    cardId,
    name,
    desc,
    idList,
    due,
    dueComplete,
    start,
    pos,
    closed,
    idMembers,
    idLabels,
    subscribed,
    url,
  }) => {
    if (!cardId) return { error: 'cardId is required.' };

    const result = await trelloRequest(trelloCredentials, `/cards/${encodeURIComponent(cardId)}`, {
      method: 'PUT',
      query: {
        name,
        desc,
        idList,
        due,
        dueComplete,
        start,
        pos,
        closed,
        idMembers,
        idLabels,
        subscribed,
        url,
      },
    });
    if (result.error) return result;

    return result.data;
  },
});
