// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { paginationFields, razorpayCredentialsField, razorpayRequest, toSnakeCase } from './client.js';

export const createItem = tool({
    description: 'Creates a reusable product/service entry for invoicing (appears on invoices and receipts).',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        name: z.string().describe('Item name for invoices/receipts'),
        amount: z.number().int().min(0).describe('Amount in subunits (paise); 10000 = ₹100'),
        currency: z.string().length(3).describe("ISO code, e.g. 'INR', 'USD'"),
        description: z.string().optional(),
    }),
    execute: async ({ razorpayCredentials, ...body }) =>
        razorpayRequest(razorpayCredentials, '/items', { method: 'POST', body }, 'create item'),
});

export const getItem = tool({
    description: 'Reads one item (name, amount, tax details, metadata).',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        itemId: z.string().describe("Item ID, e.g. 'item_JnQ2kRGq8Kbte3'"),
    }),
    execute: async ({ razorpayCredentials, itemId }) =>
        razorpayRequest(razorpayCredentials, `/items/${itemId}`, undefined, 'get item'),
});

export const listItems = tool({
    description: 'Lists the item catalog with active-status and date filters plus pagination.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        active: z.boolean().optional().describe('true = active only, false = inactive only'),
        fromTimestamp: z.number().int().optional().describe('Items created on/after this Unix time'),
        toTimestamp: z.number().int().optional().describe('Items created on/before this Unix time'),
        ...paginationFields,
    }),
    execute: async ({ razorpayCredentials, fromTimestamp, toTimestamp, ...rest }) =>
        razorpayRequest(razorpayCredentials, '/items', { query: { from: fromTimestamp, to: toTimestamp, ...rest } }, 'list items'),
});

export const updateItem = tool({
    description: 'Updates item name/description/amount. Only provided fields change.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        itemId: z.string().describe('Item ID to update'),
        name: z.string().optional(),
        description: z.string().optional(),
        amount: z.number().int().min(0).optional().describe('Amount in subunits (paise)'),
    }),
    execute: async ({ razorpayCredentials, itemId, ...body }) =>
        razorpayRequest(razorpayCredentials, `/items/${itemId}`, { method: 'PATCH', body }, 'update item'),
});

export const deleteItem = tool({
    description: 'Permanently deletes an item. Fails when the item is used by any invoice.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        itemId: z.string().describe('Item ID to delete'),
    }),
    execute: async ({ razorpayCredentials, itemId }) =>
        razorpayRequest(razorpayCredentials, `/items/${itemId}`, { method: 'DELETE' }, 'delete item'),
});

const paymentLinkWriteFields = {
    amount: z.number().int().min(100).optional().describe('Amount in subunits (paise); 100000 = ₹1000'),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD']).optional(),
    description: z.string().optional().describe('Link purpose'),
    customer: z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        contact: z.string().optional().describe('Phone in international format'),
    }).optional(),
    notify: z.object({
        sms: z.boolean().optional(),
        email: z.boolean().optional(),
    }).optional(),
    reminderEnable: z.boolean().optional(),
    callbackUrl: z.string().optional().describe('Post-payment redirect URL'),
    callbackMethod: z.string().optional().describe("Callback HTTP method: 'get' or 'post'"),
    expireBy: z.number().int().optional().describe('Expiry Unix time (must be future)'),
    referenceId: z.string().optional().describe('Internal reference, e.g. TS1234'),
    acceptPartial: z.boolean().optional(),
    notes: z.record(z.string()).optional().describe('Metadata (max 15 pairs, 256 chars each)'),
};

export const createPaymentLink = tool({
    description: 'Creates a shareable payment URL (short_url) with customer, notification, expiry, and callback options.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        amount: z.number().int().min(100).describe('Amount in subunits (min 100)'),
        currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD']),
        ...paymentLinkWriteFields,
    }),
    execute: async ({ razorpayCredentials, ...body }) =>
        razorpayRequest(razorpayCredentials, '/payment_links', { method: 'POST', body: toSnakeCase(body) }, 'create payment link'),
});

export const fetchPaymentLink = tool({
    description: 'Reads one payment link (status, amounts, customer, callbacks).',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        plinkId: z.string().describe("Link ID, e.g. 'plink_FMbhpT6nqDjDei'"),
    }),
    execute: async ({ razorpayCredentials, plinkId }) =>
        razorpayRequest(razorpayCredentials, `/payment_links/${plinkId}`, undefined, 'fetch payment link'),
});

export const fetchAllPaymentLinks = tool({
    description: 'Lists payment links with payment/reference/date filters and skip/count pagination.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        paymentId: z.string().optional().describe('Filter by payment (pay_...)'),
        referenceId: z.string().optional().describe('Filter by your reference'),
        ...paginationFields,
        from: z.number().int().optional().describe('Links created on/after this Unix time'),
        to: z.number().int().optional().describe('Links created on/before this Unix time'),
    }),
    execute: async ({ razorpayCredentials, paymentId, referenceId, ...query }) =>
        razorpayRequest(razorpayCredentials, '/payment_links', { query: { payment_id: paymentId, reference_id: referenceId, ...query } }, 'fetch payment links'),
});

export const updatePaymentLink = tool({
    description: 'Updates link reference, expiry, partial-payment, notes, and reminders. Only provided fields change.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        plinkId: z.string().describe("Link ID starting with 'plink_'"),
        ...paymentLinkWriteFields,
    }),
    execute: async ({ razorpayCredentials, plinkId, ...body }) =>
        razorpayRequest(razorpayCredentials, `/payment_links/${plinkId}`, { method: 'PATCH', body: toSnakeCase(body) }, 'update payment link'),
});

export const cancelPaymentLink = tool({
    description: 'Cancels an active link before expiry. Cancelled links cannot accept payments.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        plinkId: z.string().describe('Link ID to cancel'),
    }),
    execute: async ({ razorpayCredentials, plinkId }) =>
        razorpayRequest(razorpayCredentials, `/payment_links/${plinkId}/cancel`, { method: 'POST' }, 'cancel payment link'),
});

export const notifyPaymentLink = tool({
    description: 'Sends or resends the link notification by SMS or email.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        plinkId: z.string().describe('Link ID to notify about'),
        medium: z.enum(['sms', 'email']).describe('Delivery channel'),
    }),
    execute: async ({ razorpayCredentials, plinkId, medium }) =>
        razorpayRequest(razorpayCredentials, `/payment_links/${plinkId}/notify_by/${medium}`, { method: 'POST' }, 'notify payment link'),
});
