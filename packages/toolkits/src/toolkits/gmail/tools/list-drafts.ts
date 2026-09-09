import { tool } from 'ai';
import { z } from 'zod';

export const listDrafts = tool({
    description: 'List drafts in the Gmail mailbox. Optionally filter drafts with a search query.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        q: z.string().optional().describe('Search query (same format as Gmail search box)'),
        maxResults: z.number().optional().default(10).describe('Maximum number of drafts to return'),
        pageToken: z.string().optional().describe('Token for retrieving the next page of drafts'),
    }),
    execute: async ({ gmailToken, q, maxResults, pageToken }) => {
        try {
            const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/drafts');
            if (q) url.searchParams.append('q', q);
            url.searchParams.append('maxResults', maxResults.toString());
            if (pageToken) url.searchParams.append('pageToken', pageToken);

            const response = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to list drafts', details: error };
            }

            const data = await response.json();
            return {
                drafts: data.drafts || [],
                resultSizeEstimate: data.resultSizeEstimate,
                nextPageToken: data.nextPageToken,
            };
        } catch (error) {
            return {
                error: 'Error listing drafts',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
