// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hostingerRequest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const hostingerListCatalogItems = tool({
    description:
        'List catalog items available for order (domains, VPS plans) with pricing in cents. Use to check services and prices before ordering.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        name: z.string().optional().describe('Filter by name, use * as wildcard, e.g. ".COM*"'),
        category: z.enum(['DOMAIN', 'VPS']).optional().describe('Filter by category'),
    }),
    execute: async ({ hostingerApiKey, name, category }) => {
        return hostingerRequest(hostingerApiKey, '/api/billing/v1/catalog', { query: { name, category } });
    },
});

export const hostingerListPaymentMethods = tool({
    description:
        'List payment methods available for placing orders. Use to view payment options before creating an order.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
    }),
    execute: async ({ hostingerApiKey }) => {
        return hostingerRequest(hostingerApiKey, '/api/billing/v1/payment-methods');
    },
});

export const hostingerListSubscriptions = tool({
    description:
        'List all subscriptions on the account. Use to monitor active services and billing status.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
    }),
    execute: async ({ hostingerApiKey }) => {
        return hostingerRequest(hostingerApiKey, '/api/billing/v1/subscriptions');
    },
});
