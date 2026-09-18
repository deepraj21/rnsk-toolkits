import { tool } from 'ai';
import { z } from 'zod';

export const deleteLabel = tool({
    description: 'Permanently delete a user-created Gmail label from the account.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        labelId: z.string().describe('The label ID to delete, e.g. Label_123'),
    }),
    execute: async ({ gmailToken, labelId }) => {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/labels/${labelId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to delete label', details: error };
            }

            return { success: true, labelId };
        } catch (error) {
            return {
                error: 'Error deleting label',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
