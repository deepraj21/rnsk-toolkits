import { tool } from 'ai';
import { z } from 'zod';

export const deleteMessage = tool({
    description: 'Permanently delete a Gmail message by ID. This bypasses Trash and cannot be undone.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.string().describe('The message ID to permanently delete'),
    }),
    execute: async ({ gmailToken, id }) => {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to delete message', details: error };
            }

            return { success: true, messageId: id };
        } catch (error) {
            return {
                error: 'Error deleting message',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
