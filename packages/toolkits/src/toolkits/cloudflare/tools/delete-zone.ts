// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareDeleteZone = tool({
    description:
        'Delete a zone and all its DNS records. Permanent and irreversible — confirm the zone identifier with the user first.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        zoneId: z.string().describe('Zone identifier to delete'),
    }),
    execute: async ({ cloudflareApiKey, zoneId }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'DELETE', `/zones/${zoneId}`);
        } catch (error) {
            return toCfError(error, 'Failed to delete zone');
        }
    },
});
