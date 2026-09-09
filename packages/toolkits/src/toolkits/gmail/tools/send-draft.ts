import { tool } from 'ai';
import { z } from 'zod';

export const sendDraft = tool({
    description: 'Send an existing Gmail draft by its draft ID.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.string().describe('The ID of the draft to send'),
    }),
    execute: async ({ gmailToken, id }) => {
        try {
            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts/send', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to send draft', details: error };
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
                error: 'Error sending draft',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
