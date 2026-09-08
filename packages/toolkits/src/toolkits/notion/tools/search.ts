// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const notionSearch = tool({
    description: 'Search for pages or databases in Notion. Use this to find content by title.',
    inputSchema: z.object({
        query: z.string().describe('The text to search for'),
        filter: z.object({
            property: z.enum(['object']).optional(),
            value: z.enum(['page', 'database']).optional(),
        }).optional().describe('Filter the results by object type (page or database)'),
        sort: z.object({
            direction: z.enum(['ascending', 'descending']).optional(),
            timestamp: z.enum(['last_edited_time']).optional(),
        }).optional().describe('Sort the results'),
        page_size: z.number().optional().default(20).describe('Number of results to return'),
        notionToken: z.string().optional().describe('Token provided by the system; do not provide'),
    }),
    execute: async ({ query, filter, sort, page_size, notionToken }) => {
        const response = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
                query,
                filter,
                sort,
                page_size,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return { error: 'Notion search failed', details: error };
        }

        return await response.json();
    },
});
