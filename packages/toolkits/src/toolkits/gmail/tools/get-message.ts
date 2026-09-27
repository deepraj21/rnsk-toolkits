import { tool } from 'ai';
import { z } from 'zod';
import { extractMessageDetails } from './utils.js';

export const getMessage = tool({
  description: 'Get details of a specific Gmail message by ID.',
  inputSchema: z.object({
    gmailToken: z.string().optional().describe('Injected by system; do not provide'),
    id: z.string().describe('The ID of the message to retrieve'),
  }),
  execute: async ({ gmailToken, id }) => {
    try {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
        {
          headers: {
            Authorization: `Bearer ${gmailToken}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        return { error: 'Failed to get message', details: error };
      }

      const data = await response.json();
      const details = extractMessageDetails(data);

      return details || { id: data.id, threadId: data.threadId, snippet: data.snippet };
    } catch (error) {
      return {
        error: 'Error getting message',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
