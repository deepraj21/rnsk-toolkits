// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const deleteFile = tool({
    description: 'Delete a file or folder in Google Drive (moves to trash).',
    inputSchema: z.object({
        googleDriveToken: z.string().describe('The Google Drive access token'),
        fileId: z.string().describe('The ID of the file or folder to delete'),
    }),
    execute: async ({ googleDriveToken, fileId }) => {
        try {
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${googleDriveToken}` },
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: response.statusText }));
                return { error: 'Failed to delete file', details: error };
            }

            return { success: true, fileId };
        } catch (error) {
            return {
                error: 'Error deleting file',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
