// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const notionGetDatabase = tool({
    description: 'Retrieve the definition of a specific Notion database, including its properties/schema.',
    inputSchema: z.object({
        database_id: z.string().describe('The ID of the database to retrieve'),
        notionToken: z.string().optional().describe('Token provided by the system; do not provide'),
    }),
    execute: async ({ database_id, notionToken }) => {
        const response = await fetch(`https://api.notion.com/v1/databases/${database_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Notion-Version': '2022-06-28',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            return { error: 'Notion get database failed', details: error };
        }

        return await response.json();
    },
});
