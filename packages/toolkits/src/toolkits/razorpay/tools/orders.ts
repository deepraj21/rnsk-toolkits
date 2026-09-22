// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { paginationFields, razorpayCredentialsField, razorpayRequest, timeRangeFields, toSnakeCase } from './client.js';

const notesField = z.record(z.string()).optional().describe('Custom metadata (max 15 pairs)');

export const createOrder = tool({
    description:
        'Creates an order before collecting payment (amount in subunits: paise for INR, so ₹500 = 50000). Optional receipt for tracking and partial-payment flag.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        amount: z.number().int().min(100).describe('Amount in currency subunits (min 100)'),
        currency: z.string().regex(/^[A-Z]{3}$/).describe("ISO code uppercase, e.g. 'INR'"),
        receipt: z.string().max(40).optional().describe('Internal receipt reference (max 40 chars)'),
        notes: notesField,
        partialPayment: z.boolean().optional().describe('Allow partial payments (default false)'),
    }),
    execute: async ({ razorpayCredentials, ...body }) =>
        razorpayRequest(razorpayCredentials, '/orders', { method: 'POST', body: toSnakeCase(body) }, 'create order'),
});

export const fetchOrders = tool({
    description: 'Lists orders (newest first) with receipt/authorization/time filters and skip/count pagination.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        receipt: z.string().optional().describe('Filter by receipt reference'),
        authorized: z.number().int().optional().describe('1 = authorized, 0 = unauthorized'),
        fromTimestamp: z.number().int().min(0).optional().describe('Orders created after this Unix time'),
        toTimestamp: z.number().int().min(0).optional().describe('Orders created before this Unix time'),
        ...paginationFields,
    }),
    execute: async ({ razorpayCredentials, fromTimestamp, toTimestamp, ...rest }) =>
        razorpayRequest(razorpayCredentials, '/orders', { query: { from: fromTimestamp, to: toTimestamp, ...rest } }, 'fetch orders'),
});

export const fetchOrderById = tool({
    description: 'Reads one order (status, amounts, attempts). Use to verify payment state before fulfillment.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        orderId: z.string().describe("Order ID, e.g. 'order_SMoQNyHKUeQomP'"),
    }),
    execute: async ({ razorpayCredentials, orderId }) =>
        razorpayRequest(razorpayCredentials, `/orders/${orderId}`, undefined, 'fetch order'),
});

export const updateOrder = tool({
    description: 'Updates order metadata notes. Only the notes field is mutable on orders.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        orderId: z.string().describe('Order ID to update'),
        notes: z.record(z.string()).optional().describe('Replacement metadata notes'),
    }),
    execute: async ({ razorpayCredentials, orderId, notes }) =>
        razorpayRequest(razorpayCredentials, `/orders/${orderId}`, { method: 'PATCH', body: { notes } }, 'update order'),
});

export const fetchPaymentsByOrder = tool({
    description: 'Lists all payment attempts for one order (methods, statuses, errors). Use to reconcile order payments.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        orderId: z.string().describe('Order ID to list payments for'),
    }),
    execute: async ({ razorpayCredentials, orderId }) =>
        razorpayRequest(razorpayCredentials, `/orders/${orderId}/payments`, undefined, 'fetch payments by order'),
});

export const fetchAllPayments = tool({
    description: 'Lists payments (newest first) with time filters and pagination. Use for audits and payment-history analysis.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        ...timeRangeFields,
        ...paginationFields,
    }),
    execute: async ({ razorpayCredentials, ...query }) =>
        razorpayRequest(razorpayCredentials, '/payments', { query }, 'fetch payments'),
});

export const fetchAllRefundsForPayment = tool({
    description: 'Lists refunds for one payment (status, history). Use to check refund state for a payment.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        paymentId: z.string().describe("Payment ID, e.g. 'pay_29QQoUBi66xm2f'"),
        fromTimestamp: z.number().int().optional().describe('Refunds created on/after this Unix time'),
        toTimestamp: z.number().int().optional().describe('Refunds created on/before this Unix time'),
        ...paginationFields,
    }),
    execute: async ({ razorpayCredentials, paymentId, fromTimestamp, toTimestamp, ...rest }) =>
        razorpayRequest(razorpayCredentials, `/payments/${paymentId}/refunds`, { query: { from: fromTimestamp, to: toTimestamp, ...rest } }, 'fetch refunds for payment'),
});

export const fetchRefunds = tool({
    description: 'Lists all refunds with time filters and pagination. Use for refund tracking and history analysis.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        fromTimestamp: z.number().int().optional().describe('Refunds created on/after this Unix time'),
        toTimestamp: z.number().int().optional().describe('Refunds created on/before this Unix time'),
        ...paginationFields,
    }),
    execute: async ({ razorpayCredentials, fromTimestamp, toTimestamp, ...rest }) =>
        razorpayRequest(razorpayCredentials, '/refunds', { query: { from: fromTimestamp, to: toTimestamp, ...rest } }, 'fetch refunds'),
});

export const listDisputes = tool({
    description: 'Lists chargebacks/fraud disputes (open, under_review, won, lost, closed) with date filters and pagination.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        ...timeRangeFields,
        ...paginationFields,
    }),
    execute: async ({ razorpayCredentials, ...query }) =>
        razorpayRequest(razorpayCredentials, '/disputes', { query }, 'list disputes'),
});

export const listPaymentDowntimes = tool({
    description: 'Lists active payment-method downtimes (method, severity, window, instrument). Use to check gateway health before debugging failures.',
    inputSchema: z.object({ razorpayCredentials: razorpayCredentialsField }),
    execute: async ({ razorpayCredentials }) =>
        razorpayRequest(razorpayCredentials, '/payments/downtimes', undefined, 'list payment downtimes'),
});
