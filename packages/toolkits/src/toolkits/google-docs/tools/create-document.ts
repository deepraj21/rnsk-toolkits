// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const createDocument = tool({
    description: 'Create a new blank Google Docs document with a title.',
    inputSchema: z.object({
        googleDocsToken: z.string().describe('The Google Docs access token'),
        title: z.string().describe('Title of the new document'),
    }),
    execute: async ({ googleDocsToken, title }) => {
        try {
            const response = await fetch('https://docs.googleapis.com/v1/documents', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${googleDocsToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to create document', details: error };
            }

            const data = await response.json();
            return {
                documentId: data.documentId,
                title: data.title,
                revisionId: data.revisionId,
            };
        } catch (error) {
            return {
                error: 'Error creating document',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
