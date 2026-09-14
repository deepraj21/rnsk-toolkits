// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const copyDocument = tool({
    description: 'Copy a Google Docs document.',
    inputSchema: z.object({
        googleDocsToken: z.string().describe('The Google Docs access token'),
        documentId: z.string().describe('The ID of the document to copy'),
        name: z.string().optional().describe('Name for the copy'),
    }),
    execute: async ({ googleDocsToken, documentId, name }) => {
        try {
            const metadata: Record<string, string> = {};
            if (name) metadata.name = name;

            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}/copy`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${googleDocsToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(metadata),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to copy document', details: error };
            }

            const data = await response.json();
            return {
                documentId: data.id,
                name: data.name,
                webViewLink: data.webViewLink,
            };
        } catch (error) {
            return {
                error: 'Error copying document',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
