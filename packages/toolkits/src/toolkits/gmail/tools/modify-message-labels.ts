import { tool } from 'ai';
import { z } from 'zod';

export const modifyMessageLabels = tool({
    description: 'Add or remove labels from a Gmail message. Used to mark emails as read/unread, star/unstar, archive (remove INBOX), or assign folders/labels.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        messageId: z.string().describe('The ID of the message to modify'),
        addLabelIds: z.array(z.string()).optional().describe('Array of label IDs to add (e.g., ["STARRED", "IMPORTANT"])'),
        removeLabelIds: z.array(z.string()).optional().describe('Array of label IDs to remove (e.g., ["UNREAD"] to mark as read, or ["INBOX"] to archive)'),
    }),
    execute: async ({ gmailToken, messageId, addLabelIds = [], removeLabelIds = [] }) => {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    addLabelIds,
                    removeLabelIds,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to modify message labels', details: error };
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
                error: 'Error modifying message labels',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
