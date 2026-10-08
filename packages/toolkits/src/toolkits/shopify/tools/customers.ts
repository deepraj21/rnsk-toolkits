// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { shopifyRequest, failedResult, toShopifyError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const shopifyListCustomers = tool({
  description:
    'List customers with search query and pagination (GET /customers.json). Requires read_customers scope.',
  inputSchema: z.object({
    shopifyCredentials: credField,
    query: z.string().optional().describe('Search by email, name, etc.'),
    limit: z.number().int().max(250).optional(),
    sinceId: z.number().int().optional(),
    fields: z.string().optional(),
  }),
  execute: async ({ shopifyCredentials, query, limit, sinceId, fields }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, '/customers.json', {
        query: { query, limit, since_id: sinceId, fields },
      });
      if (!result.ok) return failedResult('Failed to list customers', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error listing customers');
    }
  },
});

export const shopifyGetCustomer = tool({
  description: 'Get one customer by ID (GET /customers/{id}.json).',
  inputSchema: z.object({
    shopifyCredentials: credField,
    customerId: z.number().int(),
    fields: z.string().optional(),
  }),
  execute: async ({ shopifyCredentials, customerId, fields }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, `/customers/${customerId}.json`, {
        query: { fields },
      });
      if (!result.ok) return failedResult('Failed to get customer', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error getting customer');
    }
  },
});

export const shopifyCreateCustomer = tool({
  description: 'Create a customer (POST /customers.json).',
  inputSchema: z.object({
    shopifyCredentials: credField,
    customer: z.record(z.any()).describe('Customer resource (email, first_name, etc.)'),
  }),
  execute: async ({ shopifyCredentials, customer }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, '/customers.json', {
        method: 'POST',
        body: { customer },
      });
      if (!result.ok) return failedResult('Failed to create customer', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error creating customer');
    }
  },
});

export const shopifyUpdateCustomer = tool({
  description: 'Update a customer by ID (PUT /customers/{id}.json).',
  inputSchema: z.object({
    shopifyCredentials: credField,
    customerId: z.number().int(),
    customer: z.record(z.any()),
  }),
  execute: async ({ shopifyCredentials, customerId, customer }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, `/customers/${customerId}.json`, {
        method: 'PUT',
        body: { customer: { id: customerId, ...customer } },
      });
      if (!result.ok) return failedResult('Failed to update customer', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error updating customer');
    }
  },
});
