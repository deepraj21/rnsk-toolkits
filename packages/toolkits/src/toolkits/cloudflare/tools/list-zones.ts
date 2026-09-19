// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareListZones = tool({
    description:
        'List, search, and filter zones in the account. Paginate with page/perPage and check result_info.total_pages for all pages. Extract zone_id from results before calling zone-scoped tools. Only zones delegated to Cloudflare nameservers appear.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        name: z.string().optional().describe('Filter by domain name'),
        status: z.enum(['initializing', 'pending', 'active', 'moved']).optional().describe('Filter by zone status'),
        match: z.enum(['all', 'any']).optional().describe('Match all filters or any filter'),
        order: z.enum(['name', 'status', 'account.id', 'account.name', 'plan.id']).optional().describe('Field to order by'),
        direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        accountId: z.string().optional().describe('Filter by account ID'),
        accountName: z.string().optional().describe('Filter by account name'),
        page: z.number().min(1).optional().describe('Page number, starting from 1'),
        perPage: z.number().min(5).max(50).optional().describe('Zones per page (5-50)'),
    }),
    execute: async ({ cloudflareApiKey, accountId, accountName, perPage, ...filters }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'GET', '/zones', {
                query: {
                    ...filters,
                    per_page: perPage,
                    'account.id': accountId,
                    'account.name': accountName,
                },
            });
        } catch (error) {
            return toCfError(error, 'Failed to list zones');
        }
    },
});
