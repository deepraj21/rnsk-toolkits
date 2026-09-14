// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const getDocument = tool({
    description: 'Get the full Google Docs document structure including title and body content.',
    inputSchema: z.object({
        googleDocsToken: z.string().describe('The Google Docs access token'),
        documentId: z.string().describe('The ID of the document'),
    }),
    execute: async ({ googleDocsToken, documentId }) => {
        try {
            const response = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
                headers: { Authorization: `Bearer ${googleDocsToken}` },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to get document', details: error };
            }

            return await response.json();
        } catch (error) {
            return {
                error: 'Error getting document',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
