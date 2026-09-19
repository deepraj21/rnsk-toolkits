// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { onBehalfOfContentOwnerField, youtubeRequest, youtubeTokenField } from './client.js';

export const updateChannel = tool({
    description:
        "Updates owned channel metadata (brandingSettings, invideoPromotion, localizations). Only those parts are writable.",
    inputSchema: z.object({
        youtubeToken: youtubeTokenField,
        id: z.string().describe("Channel ID to update (starts with 'UC', must be owned)"),
        part: z.string().optional().describe('Parts being set (default brandingSettings)'),
        brandingSettings: z.record(z.any()).optional().describe('Branding settings incl. channel title, description, keywords, country'),
        invideoPromotion: z.record(z.any()).optional().describe('Promotional campaign details'),
        localizations: z.record(z.any()).optional().describe('Translated metadata keyed by BCP-47 code'),
        onBehalfOfContentOwner: onBehalfOfContentOwnerField,
    }),
    execute: async ({ youtubeToken, id, part, brandingSettings, invideoPromotion, localizations, onBehalfOfContentOwner }) => {
        try {
            const body: Record<string, unknown> = { id };
            if (brandingSettings) body.brandingSettings = brandingSettings;
            if (invideoPromotion) body.invideoPromotion = invideoPromotion;
            if (localizations) body.localizations = localizations;
            const result = await youtubeRequest(youtubeToken, '/channels', {
                method: 'PUT',
                query: { part: part ?? 'brandingSettings', onBehalfOfContentOwner },
                body,
            });
            if (!result.ok) return { error: 'Failed to update channel', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error updating channel',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
