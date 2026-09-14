// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const listDocuments = tool({
    description: 'List Google Docs documents in the user\'s Drive.',
    inputSchema: z.object({
        googleDocsToken: z.string().describe('The Google Docs access token'),
        q: z.string().optional().describe('Optional name search query'),
        pageSize: z.number().optional().default(20).describe('Maximum number of documents to return'),
    }),
    execute: async ({ googleDocsToken, q, pageSize = 20 }) => {
        try {
            const url = new URL('https://www.googleapis.com/drive/v3/files');
            let query = "mimeType='application/vnd.google-apps.document' and trashed = false";
            if (q) {
                query += ` and name contains '${q.replace(/'/g, "\\'")}'`;
            }
            url.searchParams.set('q', query);
            url.searchParams.set('pageSize', String(pageSize));
            url.searchParams.set('fields', 'files(id,name,modifiedTime,webViewLink)');

            const response = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${googleDocsToken}` },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to list documents', details: error };
            }

            const data = await response.json();
            return { documents: data.files ?? [] };
        } catch (error) {
            return {
                error: 'Error listing documents',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
