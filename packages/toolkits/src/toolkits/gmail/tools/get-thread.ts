import { tool } from 'ai';
import { z } from 'zod';
import { extractMessageDetails } from './utils.js';

export const getThread = tool({
    description: 'Get details and all messages in a specific Gmail conversation thread by thread ID.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.string().describe('The ID of the conversation thread to retrieve'),
    }),
    execute: async ({ gmailToken, id }) => {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${id}`, {
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to get thread', details: error };
            }

            const data = await response.json();
            const rawMessages = data.messages || [];
            const messages = rawMessages.map((msg: any) => extractMessageDetails(msg));

            return {
                id: data.id,
                historyId: data.historyId,
                messageCount: messages.length,
                messages,
            };
        } catch (error) {
            return {
                error: 'Error getting thread',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
