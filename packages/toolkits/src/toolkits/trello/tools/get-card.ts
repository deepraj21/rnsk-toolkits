// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloGetCard = tool({
  description:
    'Gets one Trello card by id or short link: title, description, list, board, due date, labels, members, checklist summary, attachment/comment counts, and URL. Use checklists=true to include full checklists.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    cardId: z.string().describe('Card id or short link'),
    fields: z.string().optional().describe('Comma-separated card fields to return (default: all)'),
    checklists: z
      .enum(['all', 'none'])
      .optional()
      .describe('Include checklists on the card ("all" or "none")'),
    members: z.enum(['all', 'none']).optional().describe('Include assigned members'),
    labels: z.enum(['all', 'none']).optional().describe('Include labels'),
    attachments: z.enum(['all', 'none']).optional().describe('Include attachments'),
  }),
  execute: async ({
    trelloCredentials,
    cardId,
    fields,
    checklists,
    members,
    labels,
    attachments,
  }) => {
    if (!cardId) return { error: 'cardId is required.' };

    const result = await trelloRequest(trelloCredentials, `/cards/${encodeURIComponent(cardId)}`, {
      query: { fields, checklists, members, labels, attachments },
    });
    if (result.error) return result;

    return result.data;
  },
});
