// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { paginationFields, razorpayCredentialsField, razorpayRequest, timeRangeFields, toSnakeCase } from './client.js';

const addressInput = z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipcode: z.string().optional(),
    country: z.string().optional(),
}).describe('Billing/shipping address');

const lineItemInput = (forUpdate: boolean) =>
    z.object({
        id: forUpdate ? z.string().optional().describe('Line-item ID (required to edit an existing item)') : z.string().optional(),
        name: z.string().optional().describe('Item name'),
        description: z.string().optional(),
        amount: z.number().int().min(0).optional().describe('Amount in subunits (paise); 100000 = ₹1000'),
        currency: z.string().optional().describe("ISO code, e.g. 'INR'"),
        quantity: z.number().int().optional(),
        unit: z.string().optional().describe("Unit, e.g. 'hours', 'pieces'"),
        unitAmount: z.number().int().optional().describe('Unit price in subunits'),
        itemId: z.string().optional().describe('Existing item entity ID (item_...)'),
        taxId: z.string().optional().describe('Tax entity ID (tax_...)'),
        taxRate: z.number().int().optional().describe('Basis points, e.g. 1800 = 18%'),
        taxInclusive: z.boolean().optional(),
        hsnCode: z.string().optional().describe('HSN code (goods)'),
        sacCode: z.string().optional().describe('SAC code (services)'),
    }).describe(forUpdate ? 'Line items (include id to edit existing ones)' : 'Line items (at least one required)');

const customerInput = z.object({
    name: z.string().describe('Customer name'),
    email: z.string().describe('Customer email'),
    contact: z.string().describe('10-digit phone (India)'),
    gstin: z.string().optional(),
    notes: z.record(z.string()).optional(),
    billingAddress: addressInput.optional(),
    shippingAddress: addressInput.optional(),
}).describe('Invoice recipient');

const invoiceWriteFields = {
    type: z.string().optional().describe("Type: 'invoice' or 'link'"),
    description: z.string().optional(),
    comment: z.string().optional(),
    terms: z.string().optional().describe('Terms and conditions text'),
    receipt: z.string().optional().describe('Internal reference (max 40 chars)'),
    currency: z.string().optional().describe("ISO code, e.g. 'INR' (default INR)"),
    amount: z.number().int().optional().describe('Total in subunits (else computed from line items)'),
    customerId: z.string().optional().describe('Existing customer (cust_...); omit customer details when used'),
    customer: customerInput.optional(),
    orderId: z.string().optional().describe('Associated order (order_...)'),
    paymentId: z.string().optional().describe('Pre-associated payment (pay_...)'),
    expireBy: z.number().int().optional().describe('Expiry Unix time'),
    issuedAt: z.number().int().optional().describe('Custom issue-date Unix time'),
    invoiceNumber: z.string().optional().describe("Custom number, e.g. 'INV-2024-001'"),
    billingStart: z.number().int().optional().describe('Billing-period start Unix time'),
    billingEnd: z.number().int().optional().describe('Billing-period end Unix time'),
    smsNotify: z.number().int().optional().describe('1 = send SMS, 0 = no'),
    emailNotify: z.number().int().optional().describe('1 = send email, 0 = no'),
    partialPayment: z.boolean().optional(),
    groupTaxesDiscounts: z.boolean().optional(),
    viewLess: z.boolean().optional().describe('Compact view'),
    shortUrl: z.boolean().optional().describe('Return payment-page short URL'),
    taxId: z.string().optional().describe('Invoice-level tax (tax_...)'),
    taxRate: z.number().int().optional().describe('Invoice-level basis points'),
    idempotencyKey: z.string().optional().describe('Dedupe key for safe retries'),
    notes: z.record(z.string()).optional(),
};

export const createInvoice = tool({
    description:
        'Creates an invoice in draft state (update then issue when ready). Needs at least one line item; amount defaults to the line-item total.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        lineItems: z.array(lineItemInput(false)).min(1),
        ...invoiceWriteFields,
    }),
    execute: async ({ razorpayCredentials, lineItems, ...rest }) =>
        razorpayRequest(razorpayCredentials, '/invoices', {
            method: 'POST',
            body: toSnakeCase({ lineItems, ...rest }),
        }, 'create invoice'),
});

export const fetchAllInvoices = tool({
    description: 'Lists invoices with payment/customer/receipt/date filters and skip/count pagination.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        type: z.string().optional().describe("Entity filter, e.g. 'invoice'"),
        paymentId: z.string().optional().describe('Filter by payment (pay_...)'),
        customerId: z.string().optional().describe('Filter by customer (cust_...)'),
        receipt: z.string().optional().describe('Filter by receipt number'),
        ...timeRangeFields,
        ...paginationFields,
    }),
    execute: async ({ razorpayCredentials, paymentId, customerId, ...query }) =>
        razorpayRequest(razorpayCredentials, '/invoices', { query: { payment_id: paymentId, customer_id: customerId, ...query } }, 'fetch invoices'),
});

export const fetchInvoiceById = tool({
    description: 'Reads one invoice (customer, line items, amounts, payment status).',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        invoiceId: z.string().describe("Invoice ID, e.g. 'inv_SMoSJ8FWjTVWn4'"),
    }),
    execute: async ({ razorpayCredentials, invoiceId }) =>
        razorpayRequest(razorpayCredentials, `/invoices/${invoiceId}`, undefined, 'fetch invoice'),
});

export const updateInvoice = tool({
    description: 'Updates a draft invoice (customer, line items — include item ids to edit, notes, dates). Draft state only.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        invoiceId: z.string().describe('Draft invoice ID to update'),
        lineItems: z.array(lineItemInput(true)).optional(),
        date: z.number().int().optional().describe('Invoice-date Unix time'),
        ...invoiceWriteFields,
    }),
    execute: async ({ razorpayCredentials, invoiceId, lineItems, ...rest }) =>
        razorpayRequest(razorpayCredentials, `/invoices/${invoiceId}`, { method: 'PATCH', body: toSnakeCase({ lineItems, ...rest }) }, 'update invoice'),
});

export const deleteInvoice = tool({
    description: 'Permanently deletes a draft invoice. Issued/paid/cancelled invoices cannot be deleted (cancel instead).',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        invoiceId: z.string().describe('Draft invoice ID to delete'),
    }),
    execute: async ({ razorpayCredentials, invoiceId }) =>
        razorpayRequest(razorpayCredentials, `/invoices/${invoiceId}`, { method: 'DELETE' }, 'delete invoice'),
});

export const issueInvoice = tool({
    description: "Sends a draft invoice to the customer (status → issued). Draft state only.",
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        invoiceId: z.string().describe('Draft invoice ID to issue'),
    }),
    execute: async ({ razorpayCredentials, invoiceId }) =>
        razorpayRequest(razorpayCredentials, `/invoices/${invoiceId}/issue`, { method: 'POST' }, 'issue invoice'),
});

export const cancelInvoice = tool({
    description: "Cancels an issued (unpaid) invoice. Paid or already-cancelled invoices cannot be cancelled.",
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        invoiceId: z.string().describe("Issued invoice ID, e.g. 'inv_SMoRuyrkAjAttC'"),
    }),
    execute: async ({ razorpayCredentials, invoiceId }) =>
        razorpayRequest(razorpayCredentials, `/invoices/${invoiceId}/cancel`, { method: 'POST' }, 'cancel invoice'),
});

export const sendInvoiceNotification = tool({
    description: 'Sends or resends an invoice notification by email or SMS.',
    inputSchema: z.object({
        razorpayCredentials: razorpayCredentialsField,
        invoiceId: z.string().describe('Invoice ID to notify about'),
        medium: z.enum(['email', 'sms']).describe('Delivery channel'),
    }),
    execute: async ({ razorpayCredentials, invoiceId, medium }) =>
        razorpayRequest(razorpayCredentials, `/invoices/${invoiceId}/notify_by/${medium}`, { method: 'POST' }, 'send invoice notification'),
});
