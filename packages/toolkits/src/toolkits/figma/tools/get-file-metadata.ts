// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getFileMetadata = tool({
    description:
        'Gets file overview (name, creator, last-modified, thumbnail, access) without the document tree.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File or branch key from the file URL'),
    }),
    execute: async ({ figmaToken, fileKey }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/meta`);
            if (!result.ok) return { error: 'Failed to get file metadata', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting file metadata',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
