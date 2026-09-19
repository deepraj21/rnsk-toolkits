// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hostingerRequest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const hostingerListOrders = tool({
    description:
        'List hosting orders (paginated), including shared-access accounts. Use to review orders; filter by status or order IDs.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        page: z.number().int().min(1).optional().describe('Page number'),
        perPage: z.number().int().min(1).max(100).optional().describe('Items per page (default 25)'),
        statuses: z.array(z.string()).optional().describe('Filter by statuses, e.g. ["active", "suspended"]'),
        orderIds: z.array(z.number().int()).optional().describe('Filter by specific order IDs'),
    }),
    execute: async ({ hostingerApiKey, page, perPage, statuses, orderIds }) => {
        return hostingerRequest(hostingerApiKey, '/api/hosting/v1/orders', {
            query: { page, per_page: perPage, statuses, order_ids: orderIds },
        });
    },
});

export const hostingerListWebsites = tool({
    description:
        'List websites (main and addon) accessible to the account, paginated. Use to review hosted sites; filter by domain, order, username, or enabled status.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        page: z.number().int().min(1).optional().describe('Page number'),
        perPage: z.number().int().min(1).max(100).optional().describe('Items per page (1-100)'),
        domain: z.string().optional().describe('Filter by exact domain name'),
        orderId: z.number().int().optional().describe('Filter by order ID'),
        username: z.string().optional().describe('Filter by hosting username'),
        isEnabled: z.boolean().optional().describe('Filter by enabled status'),
    }),
    execute: async ({ hostingerApiKey, page, perPage, domain, orderId, username, isEnabled }) => {
        return hostingerRequest(hostingerApiKey, '/api/hosting/v1/websites', {
            query: { page, per_page: perPage, domain, order_id: orderId, username, is_enabled: isEnabled },
        });
    },
});
