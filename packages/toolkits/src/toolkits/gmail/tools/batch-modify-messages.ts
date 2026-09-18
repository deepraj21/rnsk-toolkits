import { tool } from 'ai';
import { z } from 'zod';

export const batchModifyMessages = tool({
    description: 'Add or remove labels on multiple Gmail messages in one request.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        messageIds: z.array(z.string()).min(1).max(1000).describe('Message IDs to modify'),
        addLabelIds: z.array(z.string()).optional().describe('Label IDs to add'),
        removeLabelIds: z.array(z.string()).optional().describe('Label IDs to remove'),
    }),
    execute: async ({ gmailToken, messageIds, addLabelIds = [], removeLabelIds = [] }) => {
        try {
            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ids: messageIds,
                    addLabelIds,
                    removeLabelIds,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to batch modify messages', details: error };
            }

            return { success: true, modifiedCount: messageIds.length, messageIds, addLabelIds, removeLabelIds };
        } catch (error) {
            return {
                error: 'Error batch modifying messages',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
