// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { paginationFields, razorpayCredentialsField, razorpayRequest } from './client.js';

const customerFields = {
    name: z.string().optional().describe('Customer name'),
    email: z.string().optional().describe('Customer email'),
    contact: z.string().optional().describe('Customer phone number'),
};

export const createCustomer = tool({
    description: 'Registers a customer for recurring payments or saved cards. Returns a customer_id for future transactions.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        ...customerFields,
        gstin: z.string().optional().describe('GSTIN (India-specific)'),
        notes: z.record(z.any()).optional().describe('Custom metadata (string/integer/number values)'),
    }),
    execute: async ({ razorpayCredentials, ...body }) =>
        razorpayRequest(razorpayCredentials, '/customers', { method: 'POST', body }, 'create customer'),
});

export const getCustomer = tool({
    description: 'Reads one customer (name, email, contact, notes).',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        customerId: z.string().regex(/^cust_[a-zA-Z0-9]+$/).describe("Customer ID, e.g. 'cust_SMoQL8RbRrw4w5'"),
    }),
    execute: async ({ razorpayCredentials, customerId }) =>
        razorpayRequest(razorpayCredentials, `/customers/${customerId}`, undefined, 'get customer'),
});

export const updateCustomer = tool({
    description: 'Updates customer name/email/contact. Only provided fields change.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        customerId: z.string().describe('Customer ID to update'),
        ...customerFields,
    }),
    execute: async ({ razorpayCredentials, customerId, ...body }) =>
        razorpayRequest(razorpayCredentials, `/customers/${customerId}`, { method: 'PATCH', body }, 'update customer'),
});

export const fetchAllCustomers = tool({
    description: 'Lists customers with skip/count pagination (max 100 per page). Use to iterate the customer base.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        ...paginationFields,
    }),
    execute: async ({ razorpayCredentials, ...query }) =>
        razorpayRequest(razorpayCredentials, '/customers', { query }, 'fetch customers'),
});

export const listCustomerTokens = tool({
    description: 'Lists saved payment methods (card/emandate/nach/upi tokens with status and limits) for a customer.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        customerId: z.string().regex(/^cust_[a-zA-Z0-9]{14}$/).describe("Customer ID 'cust_' + 14 alphanumerics"),
    }),
    execute: async ({ razorpayCredentials, customerId }) =>
        razorpayRequest(razorpayCredentials, `/customers/${customerId}/tokens`, undefined, 'list customer tokens'),
});
