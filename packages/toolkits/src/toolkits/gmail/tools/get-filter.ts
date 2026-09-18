import { tool } from 'ai';
import { z } from 'zod';

export const getFilter = tool({
    description: 'Retrieve a Gmail filter by ID.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.string().describe('The filter ID to retrieve'),
    }),
    execute: async ({ gmailToken, id }) => {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/settings/filters/${id}`, {
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to get filter', details: error };
            }

            const data = await response.json();
            return { success: true, filter: data };
        } catch (error) {
            return {
                error: 'Error getting filter',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
