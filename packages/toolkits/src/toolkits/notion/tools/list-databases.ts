// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const notionListDatabases = tool({
    description: 'List all databases the integration has access to. Note: This uses the search API filtered to databases.',
    inputSchema: z.object({
        page_size: z.number().optional().default(100).describe('Number of results to return'),
        notionToken: z.string().optional().describe('Token provided by the system; do not provide'),
    }),
    execute: async ({ page_size, notionToken }) => {
        const response = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
                filter: {
                    property: 'object',
                    value: 'database',
                },
                page_size,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return { error: 'Notion list databases failed', details: error };
        }

        return await response.json();
    },
});
