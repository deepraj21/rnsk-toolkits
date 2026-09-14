// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const getFile = tool({
    description: 'Get metadata for a file or folder in Google Drive by ID.',
    inputSchema: z.object({
        googleDriveToken: z.string().describe('The Google Drive access token'),
        fileId: z.string().describe('The ID of the file or folder'),
    }),
    execute: async ({ googleDriveToken, fileId }) => {
        try {
            const url = new URL(`https://www.googleapis.com/drive/v3/files/${fileId}`);
            url.searchParams.set('fields', 'id,name,mimeType,modifiedTime,createdTime,parents,webViewLink,description,size');

            const response = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${googleDriveToken}` },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to get file', details: error };
            }

            return await response.json();
        } catch (error) {
            return {
                error: 'Error getting file',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
