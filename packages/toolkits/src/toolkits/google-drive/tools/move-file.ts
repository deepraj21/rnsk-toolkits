// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const moveFile = tool({
    description: 'Move a file or folder to a different parent folder in Google Drive.',
    inputSchema: z.object({
        googleDriveToken: z.string().describe('The Google Drive access token'),
        fileId: z.string().describe('The ID of the file or folder to move'),
        newParentId: z.string().describe('The ID of the destination folder'),
        removeParentId: z.string().optional().describe('Parent folder ID to remove (auto-detected if omitted)'),
    }),
    execute: async ({ googleDriveToken, fileId, newParentId, removeParentId }) => {
        try {
            let removeParents = removeParentId;
            if (!removeParents) {
                const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`;
                const metaResponse = await fetch(metaUrl, {
                    headers: { Authorization: `Bearer ${googleDriveToken}` },
                });
                if (!metaResponse.ok) {
                    const error = await metaResponse.json();
                    return { error: 'Failed to get file parents', details: error };
                }
                const meta = await metaResponse.json();
                removeParents = (meta.parents as string[])?.[0];
            }

            const url = new URL(`https://www.googleapis.com/drive/v3/files/${fileId}`);
            url.searchParams.set('addParents', newParentId);
            if (removeParents) {
                url.searchParams.set('removeParents', removeParents);
            }
            url.searchParams.set('fields', 'id,name,parents');

            const response = await fetch(url.toString(), {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${googleDriveToken}` },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to move file', details: error };
            }

            return await response.json();
        } catch (error) {
            return {
                error: 'Error moving file',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
