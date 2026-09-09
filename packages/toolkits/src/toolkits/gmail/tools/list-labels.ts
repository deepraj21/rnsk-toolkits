import { tool } from 'ai';
import { z } from 'zod';

export const listLabels = tool({
    description: 'List all labels in the Gmail mailbox (e.g., INBOX, UNREAD, STARRED, IMPORTANT, and user custom labels).',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        type: z.enum(['all', 'system', 'user']).optional().default('all').describe('Filter labels by type: system, user, or all'),
    }),
    execute: async ({ gmailToken, type }) => {
        try {
            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/labels', {
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to list labels', details: error };
            }

            const data = await response.json();
            let labels = data.labels || [];

            if (type === 'system') {
                labels = labels.filter((l: any) => l.type === 'system');
            } else if (type === 'user') {
                labels = labels.filter((l: any) => l.type === 'user');
            }

            return {
                labels: labels.map((l: any) => ({
                    id: l.id,
                    name: l.name,
                    type: l.type,
                    messageListVisibility: l.messageListVisibility,
                    labelListVisibility: l.labelListVisibility,
                })),
            };
        } catch (error) {
            return {
                error: 'Error listing labels',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
