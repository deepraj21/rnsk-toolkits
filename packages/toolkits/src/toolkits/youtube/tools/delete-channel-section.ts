// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { onBehalfOfContentOwnerField, youtubeRequest, youtubeTokenField } from './client.js';

export const deleteChannelSection = tool({
    description:
        'Deletes a channel section. The section must exist and the authenticated user must have permission.',
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().describe('Channel section ID to delete (required)'),
        onBehalfOfContentOwner: onBehalfOfContentOwnerField,
    }),
    execute: async ({ youtubeToken, id, onBehalfOfContentOwner }) => {
        try {
            const result = await youtubeRequest(youtubeToken, '/channelSections', {
                method: 'DELETE',
                query: { id, onBehalfOfContentOwner },
            });
            if (!result.ok) return { error: 'Failed to delete channel section', details: result.error };
            return { channelSectionId: id, deleted: true, httpStatus: 204 };
        } catch (error) {
            return {
                error: 'Error deleting channel section',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
