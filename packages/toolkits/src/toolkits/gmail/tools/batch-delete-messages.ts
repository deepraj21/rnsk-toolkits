import { tool } from 'ai';
import { z } from 'zod';

export const batchDeleteMessages = tool({
    description: 'Permanently delete multiple Gmail messages in one request. This bypasses Trash and cannot be undone.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        messageIds: z.array(z.string()).min(1).max(1000).describe('Message IDs to permanently delete'),
    }),
    execute: async ({ gmailToken, messageIds }) => {
        try {
            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/batchDelete', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: messageIds }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to batch delete messages', details: error };
            }

            return { success: true, deletedCount: messageIds.length, messageIds };
        } catch (error) {
            return {
                error: 'Error batch deleting messages',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
