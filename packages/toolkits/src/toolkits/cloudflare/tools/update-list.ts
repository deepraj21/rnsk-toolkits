// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareUpdateList = tool({
    description:
        'Update the description of a WAF list. Only the description can be changed — list items cannot be updated with this tool.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        accountId: z.string().describe('Account identifier owning the list'),
        listId: z.string().describe('WAF list identifier to update'),
        description: z.string().max(500).describe('New description for the list (max 500 chars)'),
    }),
    execute: async ({ cloudflareApiKey, accountId, listId, description }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'PUT', `/accounts/${accountId}/rules/lists/${listId}`, {
                body: { description },
            });
        } catch (error) {
            return toCfError(error, 'Failed to update WAF list');
        }
    },
});
