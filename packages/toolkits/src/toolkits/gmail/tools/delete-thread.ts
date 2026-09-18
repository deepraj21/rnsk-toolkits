import { tool } from 'ai';
import { z } from 'zod';

export const deleteThread = tool({
    description: 'Permanently delete a Gmail thread and all of its messages. This cannot be undone.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.string().describe('The thread ID to permanently delete'),
    }),
    execute: async ({ gmailToken, id }) => {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to delete thread', details: error };
            }

            return { success: true, threadId: id };
        } catch (error) {
            return {
                error: 'Error deleting thread',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
