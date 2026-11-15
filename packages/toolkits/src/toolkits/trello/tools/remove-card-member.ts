// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloRemoveCardMember = tool({
  description:
    'Unassigns a member from a Trello card. Provide the card id and the member id to remove.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    cardId: z.string().describe('Card id or short link'),
    memberId: z.string().describe('Member id to unassign'),
  }),
  execute: async ({ trelloCredentials, cardId, memberId }) => {
    if (!cardId) return { error: 'cardId is required.' };
    if (!memberId) return { error: 'memberId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/cards/${encodeURIComponent(cardId)}/idMembers/${encodeURIComponent(memberId)}`,
      { method: 'DELETE' },
    );
    if (result.error) return result;

    return { removed: true, cardId, memberId, result: result.data };
  },
});
