// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareUpdateZone = tool({
    description:
        'Update one property of an existing zone (pause/unpause, type, or vanity nameservers). Changes apply immediately — confirm the zone ID and change with the user first. Exactly one of paused, type, or vanityNameServers must be provided per call.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        zoneId: z.string().describe('Zone identifier to update'),
        paused: z.boolean().optional().describe('True to pause the zone, false to unpause'),
        type: z.enum(['full', 'partial', 'secondary']).optional().describe('Zone setup type'),
        vanityNameServers: z.array(z.string()).optional().describe('Custom vanity nameservers'),
    }),
    execute: async ({ cloudflareApiKey, zoneId, paused, type, vanityNameServers }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            const provided = [paused, type, vanityNameServers].filter((v) => v !== undefined);
            if (provided.length !== 1) {
                return { error: 'Provide exactly one of paused, type, or vanityNameServers per call.' };
            }
            return await cfRequest(cloudflareApiKey, 'PATCH', `/zones/${zoneId}`, {
                body: { paused, type, vanity_name_servers: vanityNameServers },
            });
        } catch (error) {
            return toCfError(error, 'Failed to update zone');
        }
    },
});
