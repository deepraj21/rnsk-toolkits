// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { trelloRequest, asList } from './client.js';

export const trelloGetMemberCards = tool({
  description:
    'Lists the cards a Trello member is assigned to, across all their boards. Filter to open, closed, complete, incomplete, or visible cards — useful for "what’s assigned to me" and "due soon" views. Use "me" as the member id for yourself.',
  inputSchema: z.object({
    trelloCredentials: z
      .string()
      .optional()
      .describe('Trello credentials "key:token" (injected by system)'),
    memberId: z.string().describe('Member id or username — use "me" for the connected member'),
    filter: z
      .enum(['all', 'closed', 'complete', 'incomplete', 'none', 'open', 'visible'])
      .optional()
      .describe('Which cards to return (default "visible")'),
  }),
  execute: async ({ trelloCredentials, memberId, filter }) => {
    if (!memberId) return { error: 'memberId is required.' };

    const result = await trelloRequest(
      trelloCredentials,
      `/members/${encodeURIComponent(memberId)}/cards`,
      { query: { filter } },
    );
    if (result.error) return result;

    return { cards: asList(result.data) };
  },
});
