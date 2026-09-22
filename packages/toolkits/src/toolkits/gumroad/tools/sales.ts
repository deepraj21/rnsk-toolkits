// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { gumroadRequest, gumroadTokenField } from './client.js';

export const getUser = tool({
    description:
        'Returns the authenticated seller profile (id, name, bio, currency, avatar, profile URL). Run after connecting to confirm identity.',
    inputSchema: z.object({ gumroadToken: gumroadTokenField }),
    execute: async ({ gumroadToken }) =>
        gumroadRequest(gumroadToken, '/user', undefined, 'get user'),
});

export const getSales = tool({
    description:
        'Lists successful sales only (no failed charges, carts, or page views — conversions cannot be derived). Filter by email/date/product; combine filters with page for large volumes.',
    inputSchema: z.object({
        gumroadToken: gumroadTokenField,
        email: z.string().optional().describe('Customer email filter'),
        after: z.string().optional().describe("Sales after ISO8601, e.g. '2023-01-01T00:00:00Z'"),
        before: z.string().optional().describe('Sales before ISO8601'),
        productId: z.string().optional().describe("Product filter, e.g. 'prod_ABC123'"),
        page: z.number().int().min(1).optional().describe('Page number (min 1)'),
    }),
    execute: async ({ gumroadToken, productId, ...rest }) =>
        gumroadRequest(gumroadToken, '/sales', { query: { product_id: productId, ...rest } }, 'list sales'),
});

export const listProducts = tool({
    description:
        'Lists all products (IDs, names, prices, sales counts). Run first to get product IDs for license verification and sales filtering.',
    inputSchema: z.object({ gumroadToken: gumroadTokenField }),
    execute: async ({ gumroadToken }) =>
        gumroadRequest(gumroadToken, '/products', undefined, 'list products'),
});

export const verifyLicense = tool({
    description:
        'Verifies a license key against a product (validity, usage count, purchase/entitlement). product_id required for products created on/after Jan 9 2023.',
    inputSchema: z.object({
        gumroadToken: gumroadTokenField,
        productId: z.string().describe("Product ID, e.g. 'prod_ABC123'"),
        licenseKey: z.string().describe("License key, e.g. 'ABCD-EFGH-IJKL-MNOP'"),
        incrementUsesCount: z.boolean().optional().describe('Count this verification as a use (default true)'),
    }),
    execute: async ({ gumroadToken, productId, licenseKey, incrementUsesCount }) =>
        gumroadRequest(gumroadToken, '/licenses/verify', {
            method: 'POST',
            form: { product_id: productId, license_key: licenseKey, increment_uses_count: incrementUsesCount },
        }, 'verify license'),
});

export const getResourceSubscriptions = tool({
    description:
        'Lists active webhook subscriptions for one event type. Review before adding a new webhook to avoid duplicates.',
    inputSchema: z.object({
        gumroadToken: gumroadTokenField,
        resourceName: z.enum(['sale', 'refund', 'dispute', 'dispute_won', 'cancellation', 'subscription_updated', 'subscription_ended', 'subscription_restarted']).describe('Event type to list webhooks for'),
    }),
    execute: async ({ gumroadToken, resourceName }) =>
        gumroadRequest(gumroadToken, '/resource_subscriptions', { query: { resource_name: resourceName } }, 'list resource subscriptions'),
});

export const subscribeToResource = tool({
    description:
        'Creates a webhook subscription firing HTTP POSTs to your endpoint on each event. Endpoint must already exist and accept POSTs.',
    inputSchema: z.object({
        gumroadToken: gumroadTokenField,
        resourceName: z.enum(['sale', 'refund', 'dispute', 'dispute_won', 'cancellation', 'subscription_updated', 'subscription_ended', 'subscription_restarted']).describe('Event type to subscribe to'),
        postUrl: z.string().min(1).max(2083).describe('HTTPS endpoint receiving event POSTs'),
    }),
    execute: async ({ gumroadToken, resourceName, postUrl }) =>
        gumroadRequest(gumroadToken, '/resource_subscriptions', {
            method: 'POST',
            form: { resource_name: resourceName, post_url: postUrl },
        }, 'subscribe to resource'),
});

export const unsubscribeFromResource = tool({
    description: 'Deletes a webhook subscription by ID (from getResourceSubscriptions). Stops event delivery to that endpoint.',
    inputSchema: z.object({
        gumroadToken: gumroadTokenField,
        resourceSubscriptionId: z.string().describe("Subscription ID, e.g. 'G_-mnBf9b1j9A7a4ub4nFQ=='"),
    }),
    execute: async ({ gumroadToken, resourceSubscriptionId }) =>
        gumroadRequest(gumroadToken, `/resource_subscriptions/${encodeURIComponent(resourceSubscriptionId)}`, { method: 'DELETE' }, 'unsubscribe from resource'),
});
