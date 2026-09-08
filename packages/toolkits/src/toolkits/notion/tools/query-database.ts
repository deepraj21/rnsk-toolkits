// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const notionQueryDatabase = tool({
    description: 'Query a Notion database for pages. Allows filtering and sorting.',
    inputSchema: z.object({
        database_id: z.string().describe('The ID of the database to query'),
        filter: z.any().optional().describe('Filter for the query (complex object)'),
        sorts: z.array(z.any()).optional().describe('Sorts for the query'),
        page_size: z.number().optional().default(100).describe('Number of results to return'),
        notionToken: z.string().optional().describe('Token provided by the system; do not provide'),
    }),
    execute: async ({ database_id, filter, sorts, page_size, notionToken }) => {
        const response = await fetch(`https://api.notion.com/v1/databases/${database_id}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
                filter,
                sorts,
                page_size,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return { error: 'Notion query database failed', details: error };
        }

        return await response.json();
    },
});
