import { tool } from 'ai';
import { z } from 'zod';

export const createFilter = tool({
    description: 'Create a Gmail filter with criteria and actions such as applying labels, forwarding, archiving, or marking read.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        criteria: z.record(z.any()).describe('Gmail filter criteria object, e.g. { from, to, subject, query, negatedQuery }'),
        action: z.record(z.any()).describe('Gmail filter action object, e.g. { addLabelIds, removeLabelIds, forward }'),
    }),
    execute: async ({ gmailToken, criteria, action }) => {
        try {
            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/settings/filters', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ criteria, action }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to create filter', details: error };
            }

            const data = await response.json();
            return { success: true, filter: data };
        } catch (error) {
            return {
                error: 'Error creating filter',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
