// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const notionGetPage = tool({
    description: 'Get detailed information about a specific Notion page, including properties and its content (blocks).',
    inputSchema: z.object({
        page_id: z.string().describe('The ID of the page to retrieve'),
        notionToken: z.string().optional().describe('Token provided by the system; do not provide'),
    }),
    execute: async ({ page_id, notionToken }) => {
        // 1. Get page properties
        const pageResponse = await fetch(`https://api.notion.com/v1/pages/${page_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Notion-Version': '2022-06-28',
            },
        });

        if (!pageResponse.ok) {
            const error = await pageResponse.json();
            return { error: 'Failed to retrieve page properties', details: error };
        }

        const pageData = await pageResponse.json();

        // 2. Get page content (blocks)
        const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${page_id}/children`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Notion-Version': '2022-06-28',
            },
        });

        let blocks = null;
        if (blocksResponse.ok) {
            blocks = await blocksResponse.json();
        }

        return {
            page: pageData,
            content: blocks,
        };
    },
});
