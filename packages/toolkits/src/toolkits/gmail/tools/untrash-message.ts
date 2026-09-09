import { tool } from 'ai';
import { z } from 'zod';

export const untrashMessage = tool({
    description: 'Restore a Gmail message from the Trash folder back to the mailbox.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.string().describe('The ID of the message to restore from Trash'),
    }),
    execute: async ({ gmailToken, id }) => {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/untrash`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to untrash message', details: error };
            }

            const data = await response.json();
            return {
                success: true,
                messageId: data.id,
                threadId: data.threadId,
                labelIds: data.labelIds || [],
            };
        } catch (error) {
            return {
                error: 'Error restoring message from trash',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
