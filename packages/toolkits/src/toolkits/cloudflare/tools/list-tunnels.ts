// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareListTunnels = tool({
    description:
        'List Cloudflare Tunnel (cloudflared) tunnels in an account to discover tunnel IDs, names, and statuses. Use before tunnel operations like routing or debugging.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        accountId: z.string().describe('Account identifier to list tunnels for'),
        name: z.string().optional().describe('Filter tunnels by name'),
        isDeleted: z.boolean().optional().describe('True to include deleted tunnels'),
        page: z.number().min(1).optional().describe('Page number, starting from 1'),
        perPage: z.number().min(1).optional().describe('Tunnels per page'),
    }),
    execute: async ({ cloudflareApiKey, accountId, isDeleted, perPage, ...filters }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            return await cfRequest(cloudflareApiKey, 'GET', `/accounts/${accountId}/cfd_tunnel`, {
                query: { ...filters, per_page: perPage, is_deleted: isDeleted },
            });
        } catch (error) {
            return toCfError(error, 'Failed to list tunnels');
        }
    },
});
