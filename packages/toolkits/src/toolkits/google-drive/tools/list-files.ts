// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const listFiles = tool({
    description: 'List files and folders in Google Drive.',
    inputSchema: z.object({
        googleDriveToken: z.string().describe('The Google Drive access token'),
        folderId: z.string().optional().describe('Parent folder ID to list children of (defaults to root)'),
        pageSize: z.number().optional().default(20).describe('Maximum number of files to return'),
    }),
    execute: async ({ googleDriveToken, folderId, pageSize = 20 }) => {
        try {
            const url = new URL('https://www.googleapis.com/drive/v3/files');
            let query = 'trashed = false';
            if (folderId) {
                query += ` and '${folderId}' in parents`;
            } else {
                query += " and 'root' in parents";
            }
            url.searchParams.set('q', query);
            url.searchParams.set('pageSize', String(pageSize));
            url.searchParams.set('fields', 'files(id,name,mimeType,modifiedTime,parents,webViewLink)');

            const response = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${googleDriveToken}` },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to list files', details: error };
            }

            const data = await response.json();
            return { files: data.files ?? [] };
        } catch (error) {
            return {
                error: 'Error listing files',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
