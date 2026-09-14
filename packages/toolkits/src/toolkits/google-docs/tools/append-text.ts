// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { getDocumentEndIndex } from './utils.js';

export const appendText = tool({
    description: 'Append text to the end of a Google Docs document.',
    inputSchema: z.object({
        googleDocsToken: z.string().describe('The Google Docs access token'),
        documentId: z.string().describe('The ID of the document'),
        text: z.string().describe('Text to append'),
    }),
    execute: async ({ googleDocsToken, documentId, text }) => {
        try {
            const docResponse = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
                headers: { Authorization: `Bearer ${googleDocsToken}` },
            });

            if (!docResponse.ok) {
                const error = await docResponse.json();
                return { error: 'Failed to get document for append', details: error };
            }

            const document = await docResponse.json();
            const index = getDocumentEndIndex(document);

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
                return { error: 'Failed to append text', details: error };
            }

            const data = await response.json();
            return { success: true, documentId, index, replies: data.replies };
        } catch (error) {
            return {
                error: 'Error appending text',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
