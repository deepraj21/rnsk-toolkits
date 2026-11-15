// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { mistralRequest } from './client.js';

export const mistralGetConversationMessages = tool({
  description:
    'Retrieves all messages in a Mistral conversation (entries filtered to messages only), in order — use it to read the conversation history back.',
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
      `/conversations/${encodeURIComponent(conversationId)}/messages`,
    );
    if (result.error) return result;

    const data = result.data ?? {};
    if (Array.isArray(data)) return { data };
    return {
      conversationId: data.conversation_id ?? conversationId,
      data: Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.messages)
          ? data.messages
          : (data.entries ?? data),
    };
  },
});
