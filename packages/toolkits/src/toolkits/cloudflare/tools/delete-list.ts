// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareDeleteList = tool({
    description:
        'Delete a WAF list. Verify no filters reference the list first — confirm the account and list IDs with the user.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        accountId: z.string().describe('Account identifier owning the list'),
        listId: z.string().describe('WAF list identifier to delete'),
    }),
    execute: async ({ cloudflareApiKey, accountId, listId }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'DELETE', `/accounts/${accountId}/rules/lists/${listId}`);
        } catch (error) {
            return toCfError(error, 'Failed to delete WAF list');
        }
    },
});
