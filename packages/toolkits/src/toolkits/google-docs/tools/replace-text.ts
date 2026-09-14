// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const replaceText = tool({
    description: 'Find and replace all occurrences of text in a Google Docs document.',
    inputSchema: z.object({
        googleDocsToken: z.string().describe('The Google Docs access token'),
        documentId: z.string().describe('The ID of the document'),
        findText: z.string().describe('Text to find'),
        replaceText: z.string().describe('Replacement text'),
        matchCase: z.boolean().optional().default(false).describe('Whether the search is case-sensitive'),
    }),
    execute: async ({ googleDocsToken, documentId, findText, replaceText: replacement, matchCase = false }) => {
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
                                replaceAllText: {
                                    containsText: { text: findText, matchCase },
                                    replaceText: replacement,
                                },
                            },
                        ],
                    }),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to replace text', details: error };
            }

            const data = await response.json();
            const occurrencesChanged =
                data.replies?.[0]?.replaceAllText?.occurrencesChanged ?? 0;
            return { success: true, documentId, occurrencesChanged, replies: data.replies };
        } catch (error) {
            return {
                error: 'Error replacing text',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
