// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const searchFiles = tool({
    description: 'Search for files and folders in Google Drive using a Drive query.',
    inputSchema: z.object({
        googleDriveToken: z.string().describe('The Google Drive access token'),
        q: z.string().describe('Drive search query (e.g. "name contains \'report\'" or "mimeType=\'application/pdf\'")'),
        pageSize: z.number().optional().default(20).describe('Maximum number of results to return'),
    }),
    execute: async ({ googleDriveToken, q, pageSize = 20 }) => {
        try {
            const url = new URL('https://www.googleapis.com/drive/v3/files');
            const query = `trashed = false and (${q})`;
            url.searchParams.set('q', query);
            url.searchParams.set('pageSize', String(pageSize));
            url.searchParams.set('fields', 'files(id,name,mimeType,modifiedTime,parents,webViewLink)');

            const response = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${googleDriveToken}` },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to search files', details: error };
            }

            const data = await response.json();
            return { files: data.files ?? [] };
        } catch (error) {
            return {
                error: 'Error searching files',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
