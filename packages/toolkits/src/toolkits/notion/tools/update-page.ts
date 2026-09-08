// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const notionUpdatePage = tool({
    description: 'Update properties of an existing Notion page.',
    inputSchema: z.object({
        page_id: z.string().describe('The ID of the page to update'),
        properties: z.any().describe('The properties to update (complex object)'),
        archived: z.boolean().optional().describe('Whether to archive the page'),
        icon: z.any().optional().describe('New icon for the page'),
        cover: z.any().optional().describe('New cover for the page'),
        notionToken: z.string().optional().describe('Token provided by the system; do not provide'),
    }),
    execute: async ({ page_id, properties, archived, icon, cover, notionToken }) => {
        const response = await fetch(`https://api.notion.com/v1/pages/${page_id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
                properties,
                archived,
                icon,
                cover,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return { error: 'Notion update page failed', details: error };
        }

        return await response.json();
    },
});
