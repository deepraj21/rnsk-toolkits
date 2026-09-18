import { tool } from 'ai';
import { z } from 'zod';

export const deleteFilter = tool({
    description: 'Permanently delete a Gmail filter by ID.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        filterId: z.string().describe('The filter ID to delete'),
    }),
    execute: async ({ gmailToken, filterId }) => {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/settings/filters/${filterId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to delete filter', details: error };
            }

            return { success: true, filterId };
        } catch (error) {
            return {
                error: 'Error deleting filter',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
