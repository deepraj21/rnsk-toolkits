// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const copyFile = tool({
    description: 'Copy a file in Google Drive.',
    inputSchema: z.object({
        googleDriveToken: z.string().describe('The Google Drive access token'),
        fileId: z.string().describe('The ID of the file to copy'),
        name: z.string().optional().describe('Name for the copy'),
        parentId: z.string().optional().describe('Parent folder ID for the copy'),
    }),
    execute: async ({ googleDriveToken, fileId, name, parentId }) => {
        try {
            const metadata: Record<string, unknown> = {};
            if (name) metadata.name = name;
            if (parentId) metadata.parents = [parentId];

            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/copy`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${googleDriveToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(metadata),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to copy file', details: error };
            }

            return await response.json();
        } catch (error) {
            return {
                error: 'Error copying file',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
