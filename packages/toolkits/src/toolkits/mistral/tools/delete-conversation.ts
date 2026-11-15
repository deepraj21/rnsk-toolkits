// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralDeleteConversation = tool({
  description:
    'Deletes a Mistral conversation and its stored history. This is permanent — read anything you need with mistralGetConversationMessages first.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    conversationId: z.string().min(1).describe('Conversation id to delete'),
  }),
  execute: async ({ mistralToken, conversationId }) => {
    if (!conversationId) return { error: 'conversationId is required.' };

    const result = await mistralRequest(
      mistralToken,
      `/conversations/${encodeURIComponent(conversationId)}`,
      {
        method: 'DELETE',
      },
    );
    if (result.error) return result;

    return { deleted: true, conversationId, result: result.data ?? null };
  },
});
