import { tool } from 'ai';
import { z } from 'zod';

export const trashMessage = tool({
    description: 'Move a Gmail message to the Trash folder (safe recoverable deletion).',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.string().describe('The ID of the message to move to Trash'),
    }),
    execute: async ({ gmailToken, id }) => {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to trash message', details: error };
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
                error: 'Error moving message to trash',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
