// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareListMonitors = tool({
    description:
        'List load balancer health-check monitors in an account. Paginate with page/perPage and check result_info.total_pages for all pages.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        accountId: z.string().describe('Account identifier to list monitors for'),
        order: z.string().optional().describe('Field to sort by, e.g. created_on'),
        direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        page: z.number().min(1).optional().describe('Page number, starting from 1'),
        perPage: z.number().min(1).max(100).optional().describe('Monitors per page (max 100)'),
    }),
    execute: async ({ cloudflareApiKey, accountId, perPage, ...filters }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'GET', `/accounts/${accountId}/load_balancers/monitors`, {
                query: { ...filters, per_page: perPage },
            });
        } catch (error) {
            return toCfError(error, 'Failed to list monitors');
        }
    },
});
