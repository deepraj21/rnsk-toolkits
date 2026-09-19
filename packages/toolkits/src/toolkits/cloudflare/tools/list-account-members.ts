// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareListAccountMembers = tool({
    description:
        'List members of an account with roles, permissions, and membership status. Use to audit who has access to an account or check invitation status. Supports status filtering, sorting, and pagination.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        accountId: z.string().describe('Account identifier to list members of'),
        status: z.enum(['accepted', 'pending', 'rejected']).optional().describe('Filter by membership status'),
        order: z
            .enum(['user.first_name', 'user.last_name', 'user.email', 'status'])
            .optional()
            .describe('Field to sort by'),
        direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        page: z.number().min(1).optional().describe('Page number, starting from 1'),
        perPage: z.number().min(5).max(50).optional().describe('Members per page (5-50)'),
    }),
    execute: async ({ cloudflareApiKey, accountId, perPage, ...filters }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'GET', `/accounts/${accountId}/members`, {
                query: { ...filters, per_page: perPage },
            });
        } catch (error) {
            return toCfError(error, 'Failed to list account members');
        }
    },
});
