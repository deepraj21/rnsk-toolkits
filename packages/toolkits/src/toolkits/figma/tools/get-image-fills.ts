// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getImageFills = tool({
    description:
        'Returns temporary (14-day) download URLs for all image fills in a file, keyed by imageRef from Paint objects.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        fileKey: z.string().describe('File key from the file URL'),
    }),
    execute: async ({ figmaToken, fileKey }) => {
        try {
            const result = await figmaRequest(figmaToken, `/v1/files/${fileKey}/image_fills`);
            if (!result.ok) return { error: 'Failed to get image fills', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting image fills',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
