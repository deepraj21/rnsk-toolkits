// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const notionCreatePage = tool({
    description: 'Create a new page in Notion. Can be created in a database or as a child of another page.',
    inputSchema: z.object({
        parent: z.object({
            database_id: z.string().optional(),
            page_id: z.string().optional(),
        }).describe('The parent object (database_id or page_id)'),
        properties: z.any().describe('The properties of the page (complex object based on database schema or page title)'),
        children: z.array(z.any()).optional().describe('Content blocks for the page'),
        icon: z.any().optional().describe('Icon for the page'),
        cover: z.any().optional().describe('Cover for the page'),
        notionToken: z.string().optional().describe('Token provided by the system; do not provide'),
    }),
    execute: async ({ parent, properties, children, icon, cover, notionToken }) => {
        const response = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
                parent,
                properties,
                children,
                icon,
                cover,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return { error: 'Notion create page failed', details: error };
        }

        return await response.json();
    },
});
