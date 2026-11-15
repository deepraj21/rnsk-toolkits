// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest } from './client.js';

export const trelloAssignCardMember = tool({
  description:
    'Assigns a member to a Trello card. Provide the card id and a member id (from getBoardMembers or searchMembers). Use removeCardMember to unassign.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    cardId: z.string().describe('Card id or short link'),
    memberId: z.string().describe('Member id to assign (see getBoardMembers)'),
  }),
  execute: async ({ trelloCredentials, cardId, memberId }) => {
    if (!cardId) return { error: 'cardId is required.' };
    if (!memberId) return { error: 'memberId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/cards/${encodeURIComponent(cardId)}/idMembers`,
      { method: 'POST', query: { value: memberId } },
    );
    if (result.error) return result;

    return result.data;
  },
});
