// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const deleteContent = tool({
    description: 'Delete a range of content from a Google Docs document.',
    inputSchema: z.object({
        googleDocsToken: z.string().describe('The Google Docs access token'),
        documentId: z.string().describe('The ID of the document'),
        startIndex: z.number().describe('Start index of the range to delete (inclusive)'),
        endIndex: z.number().describe('End index of the range to delete (exclusive)'),
    }),
    execute: async ({ googleDocsToken, documentId, startIndex, endIndex }) => {
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
                        requests: [
                            {
                                deleteContentRange: {
                                    range: { startIndex, endIndex },
                                },
                            },
                        ],
                    }),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to delete content', details: error };
            }

            const data = await response.json();
            return { success: true, documentId, replies: data.replies };
        } catch (error) {
            return {
                error: 'Error deleting content',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
