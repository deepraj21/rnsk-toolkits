// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralGetConversation = tool({
  description:
    'Gets metadata for one Mistral conversation — id, name, agent/model binding, timestamps, and metadata. Use getConversationMessages to read its messages or getConversationHistory for the full entry log.',
  inputSchema: z.object({
    mistralToken: z.string().optional().describe('Mistral API key (injected by system)'),
    conversationId: z
      .string()
      .min(1)
      .describe('Conversation id from mistralCreateConversation / mistralListConversations'),
  }),
  execute: async ({ mistralToken, conversationId }) => {
    if (!conversationId) return { error: 'conversationId is required.' };

    const result = await mistralRequest(
      mistralToken,
      `/conversations/${encodeURIComponent(conversationId)}`,
    );
    if (result.error) return result;

    return result.data;
  },
});
