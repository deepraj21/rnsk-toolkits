// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

export const deleteDocument = tool({
    description: 'Delete a Google Docs document (moves to trash).',
    inputSchema: z.object({
        googleDocsToken: z.string().describe('The Google Docs access token'),
        documentId: z.string().describe('The ID of the document to delete'),
    }),
    execute: async ({ googleDocsToken, documentId }) => {
        try {
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${googleDocsToken}` },
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: response.statusText }));
                return { error: 'Failed to delete document', details: error };
            }

            return { success: true, documentId };
        } catch (error) {
            return {
                error: 'Error deleting document',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
