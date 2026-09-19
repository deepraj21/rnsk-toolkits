// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareListAccounts = tool({
    description:
        'List accounts you have access to. Use to discover account IDs required by account-scoped operations. Confirm the intended account_id before any write operations when multiple accounts are returned.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        name: z.string().optional().describe('Filter accounts by name'),
        direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        page: z.number().min(1).optional().describe('Page number, starting from 1'),
        perPage: z.number().min(5).max(50).optional().describe('Accounts per page (5-50)'),
    }),
    execute: async ({ cloudflareApiKey, perPage, ...filters }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'GET', '/accounts', {
                query: { ...filters, per_page: perPage },
            });
        } catch (error) {
            return toCfError(error, 'Failed to list accounts');
        }
    },
});
