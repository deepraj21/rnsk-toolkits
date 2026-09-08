// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const notionAppendBlockChildren = tool({
    description: 'Append content blocks as children of a parent block or page.',
    inputSchema: z.object({
        block_id: z.string().describe('The ID of the parent block (or page) to append children to'),
        children: z.array(z.any()).describe('The content blocks to append'),
        notionToken: z.string().optional().describe('Token provided by the system; do not provide'),
    }),
    execute: async ({ block_id, children, notionToken }) => {
        const response = await fetch(`https://api.notion.com/v1/blocks/${block_id}/children`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${notionToken}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
                children,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return { error: 'Notion append block children failed', details: error };
        }

        return await response.json();
    },
});
