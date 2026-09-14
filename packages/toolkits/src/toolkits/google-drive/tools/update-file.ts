// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const updateFile = tool({
    description: 'Update file metadata in Google Drive (rename, description).',
    inputSchema: z.object({
        googleDriveToken: z.string().describe('The Google Drive access token'),
        fileId: z.string().describe('The ID of the file to update'),
        name: z.string().optional().describe('New file name'),
        description: z.string().optional().describe('New file description'),
    }),
    execute: async ({ googleDriveToken, fileId, name, description }) => {
        try {
            const metadata: Record<string, string> = {};
            if (name !== undefined) metadata.name = name;
            if (description !== undefined) metadata.description = description;

            if (Object.keys(metadata).length === 0) {
                return { error: 'At least one of name or description must be provided' };
            }

            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${googleDriveToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(metadata),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to update file', details: error };
            }

            return await response.json();
        } catch (error) {
            return {
                error: 'Error updating file',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
