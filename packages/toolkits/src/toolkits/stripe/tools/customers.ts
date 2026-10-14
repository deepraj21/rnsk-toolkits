// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { stripeRequest, failedResult, toStripeError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');
const idempotencyKey = z.string().optional().describe('Idempotency-Key for safe retries');

export const stripeCreateCustomer = tool({
  description:
    'Create a Customer (POST /v1/customers). Pass email, name, metadata, and other Stripe customer fields.',
  inputSchema: z.object({
    stripeCredentials: credField,
    email: z.string().email().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    description: z.string().optional(),
    metadata: z.record(z.string()).optional(),
    params: z.record(z.any()).optional().describe('Additional Stripe customer parameters'),
    idempotencyKey,
  }),
  execute: async ({
    stripeCredentials,
    email,
    name,
    phone,
    description,
    metadata,
    params,
    idempotencyKey: idemKey,
  }) => {
    try {
      const body: Record<string, unknown> = { ...params };
      if (email) body.email = email;
      if (name) body.name = name;
      if (phone) body.phone = phone;
      if (description) body.description = description;
      if (metadata) body.metadata = metadata;
      const result = await stripeRequest(stripeCredentials, '/customers', {
        method: 'POST',
        body,
        idempotencyKey: idemKey,
      });
      if (!result.ok) return failedResult('Failed to create customer', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error creating customer');
    }
  },
});

export const stripeGetCustomer = tool({
  description: 'Retrieve a Customer by ID (GET /v1/customers/{id}).',
  inputSchema: z.object({
    stripeCredentials: credField,
    customerId: z.string().describe('Customer ID (cus_...)'),
    expand: z.array(z.string()).optional(),
  }),
  execute: async ({ stripeCredentials, customerId, expand }) => {
    try {
      const result = await stripeRequest(
        stripeCredentials,
        `/customers/${encodeURIComponent(customerId)}`,
        { query: expand?.length ? { expand } : undefined },
      );
      if (!result.ok) return failedResult('Failed to get customer', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error getting customer');
    }
  },
});

export const stripeListCustomers = tool({
  description: 'List Customers with pagination (GET /v1/customers).',
  inputSchema: z.object({
    stripeCredentials: credField,
    email: z.string().optional(),
    limit: z.number().int().max(100).optional(),
    startingAfter: z.string().optional(),
    endingBefore: z.string().optional(),
  }),
  execute: async ({ stripeCredentials, email, limit, startingAfter, endingBefore }) => {
    try {
      const result = await stripeRequest(stripeCredentials, '/customers', {
        query: {
          email,
          limit,
          starting_after: startingAfter,
          ending_before: endingBefore,
        },
      });
      if (!result.ok) return failedResult('Failed to list customers', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error listing customers');
    }
  },
});

export const stripeUpdateCustomer = tool({
  description: 'Update a Customer (POST /v1/customers/{id}).',
  inputSchema: z.object({
    stripeCredentials: credField,
    customerId: z.string(),
    params: z.record(z.any()).describe('Fields to update (email, name, metadata, etc.)'),
    idempotencyKey,
  }),
  execute: async ({ stripeCredentials, customerId, params, idempotencyKey: idemKey }) => {
    try {
      const result = await stripeRequest(
        stripeCredentials,
        `/customers/${encodeURIComponent(customerId)}`,
        { method: 'POST', body: params, idempotencyKey: idemKey },
      );
      if (!result.ok) return failedResult('Failed to update customer', result);
      return result.data;
    } catch (error) {
      return toStripeError(error, 'Error updating customer');
    }
  },
});
