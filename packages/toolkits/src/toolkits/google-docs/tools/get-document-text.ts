// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { extractPlainText } from './utils.js';

export const getDocumentText = tool({
    description: 'Get the plain text content of a Google Docs document.',
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

            const document = await response.json();
            return {
                documentId: document.documentId,
                title: document.title,
                text: extractPlainText(document),
            };
        } catch (error) {
            return {
                error: 'Error getting document text',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
