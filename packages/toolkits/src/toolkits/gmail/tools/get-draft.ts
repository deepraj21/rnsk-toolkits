import { tool } from 'ai';
import { z } from 'zod';
import { extractMessageDetails } from './utils.js';

export const getDraft = tool({
    description: 'Get details, headers, and content of a specific Gmail draft by draft ID.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.string().describe('The ID of the draft to retrieve'),
    }),
    execute: async ({ gmailToken, id }) => {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/drafts/${id}`, {
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to get draft', details: error };
            }

            const data = await response.json();
            const messageDetails = data.message ? extractMessageDetails(data.message) : null;

            return {
                id: data.id,
                message: messageDetails,
            };
        } catch (error) {
            return {
                error: 'Error getting draft',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
