// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const createFolder = tool({
    description: 'Create a new folder in Google Drive.',
    inputSchema: z.object({
        googleDriveToken: z.string().describe('The Google Drive access token'),
        name: z.string().describe('Name of the folder to create'),
        parentId: z.string().optional().describe('Parent folder ID (defaults to root)'),
    }),
    execute: async ({ googleDriveToken, name, parentId }) => {
        try {
            const metadata: Record<string, unknown> = {
                name,
                mimeType: 'application/vnd.google-apps.folder',
            };
            if (parentId) {
                metadata.parents = [parentId];
            }

            const response = await fetch('https://www.googleapis.com/drive/v3/files', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${googleDriveToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(metadata),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to create folder', details: error };
            }

            return await response.json();
        } catch (error) {
            return {
                error: 'Error creating folder',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
