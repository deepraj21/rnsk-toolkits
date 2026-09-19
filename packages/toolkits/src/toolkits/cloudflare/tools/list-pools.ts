// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareListPools = tool({
    description:
        'List load balancer pools in an account to discover pool IDs and origins. Optionally filter by health-check monitor ID. Paginate with page/perPage.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        accountId: z.string().describe('Account identifier to list pools for'),
        monitor: z.string().optional().describe('Filter pools by monitor ID'),
        page: z.number().min(1).optional().describe('Page number, starting from 1'),
        perPage: z.number().min(1).max(50).optional().describe('Pools per page (1-50)'),
    }),
    execute: async ({ cloudflareApiKey, accountId, perPage, ...filters }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'GET', `/accounts/${accountId}/load_balancers/pools`, {
                query: { ...filters, per_page: perPage },
            });
        } catch (error) {
            return toCfError(error, 'Failed to list pools');
        }
    },
});
