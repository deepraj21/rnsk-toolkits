// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareGetBotManagementSettings = tool({
    description:
        'Get a zone\'s Bot Management configuration (Bot Fight Mode / Super Bot Fight Mode / Enterprise settings). Use to audit bot protection for a zone.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        zoneId: z.string().describe('Zone identifier to get Bot Management settings for'),
    }),
    execute: async ({ cloudflareApiKey, zoneId }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'GET', `/zones/${zoneId}/bot_management`);
        } catch (error) {
            return toCfError(error, 'Failed to get Bot Management settings');
        }
    },
});
