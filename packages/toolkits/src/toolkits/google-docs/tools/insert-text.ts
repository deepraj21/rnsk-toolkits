// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const insertText = tool({
    description: 'Insert text at a specific index in a Google Docs document.',
    inputSchema: z.object({
        googleDocsToken: z.string().describe('The Google Docs access token'),
        documentId: z.string().describe('The ID of the document'),
        text: z.string().describe('Text to insert'),
        index: z.number().optional().default(1).describe('Character index where text should be inserted (default: 1)'),
    }),
    execute: async ({ googleDocsToken, documentId, text, index = 1 }) => {
        try {
            const response = await fetch(
                `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${googleDocsToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        requests: [{ insertText: { location: { index }, text } }],
                    }),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to insert text', details: error };
            }

            const data = await response.json();
            return { success: true, documentId, replies: data.replies };
        } catch (error) {
            return {
                error: 'Error inserting text',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
