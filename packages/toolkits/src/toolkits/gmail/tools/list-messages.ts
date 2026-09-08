import { tool } from 'ai';
import { z } from 'zod';

export const listMessages = tool({
    description: 'List or search for Gmail messages. Use query parameter for advanced search (e.g., from:someone@example.com, is:unread).',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        q: z.string().optional().describe('Search query (same format as Gmail search box)'),
        maxResults: z.number().optional().default(10).describe('Maximum number of messages to return'),
    }),
    execute: async ({ gmailToken, q, maxResults }) => {
        try {
            const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
            if (q) url.searchParams.append('q', q);
            url.searchParams.append('maxResults', maxResults.toString());

            const response = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to list messages', details: error };
            }

            const data = await response.json();
            return {
                messages: data.messages || [],
                resultSizeEstimate: data.resultSizeEstimate,
            };
        } catch (error) {
            return {
                error: 'Error listing messages',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
