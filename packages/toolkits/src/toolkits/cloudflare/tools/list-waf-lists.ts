// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareListWafLists = tool({
    description:
        'List WAF custom lists for an account (metadata only, no items). Iterate with page/perPage until result_info.total_pages is reached to retrieve all lists.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        accountId: z.string().describe('Account identifier owning the lists'),
    }),
    execute: async ({ cloudflareApiKey, accountId }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'GET', `/accounts/${accountId}/rules/lists`);
        } catch (error) {
            return toCfError(error, 'Failed to list WAF lists');
        }
    },
});
