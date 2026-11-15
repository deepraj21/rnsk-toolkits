// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloAddCardLabel = tool({
  description:
    'Applies an existing board label to a Trello card. Provide the card id and a label id (from getBoardLabels).',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    cardId: z.string().describe('Card id or short link'),
    labelId: z.string().describe('Label id to apply (from getBoardLabels)'),
  }),
  execute: async ({ trelloCredentials, cardId, labelId }) => {
    if (!cardId) return { error: 'cardId is required.' };
    if (!labelId) return { error: 'labelId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/cards/${encodeURIComponent(cardId)}/idLabels`,
      { method: 'POST', query: { value: labelId } },
    );
    if (result.error) return result;

    return result.data;
  },
});
