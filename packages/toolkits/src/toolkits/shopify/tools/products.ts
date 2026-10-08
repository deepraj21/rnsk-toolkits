// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { shopifyRequest, failedResult, toShopifyError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const shopifyListProducts = tool({
  description:
    'List products with optional ids, collection, vendor, product type, status, and pagination (GET /products.json).',
  inputSchema: z.object({
    shopifyCredentials: credField,
    ids: z.string().optional().describe('Comma-separated product IDs'),
    collectionId: z.number().int().optional(),
    vendor: z.string().optional(),
    productType: z.string().optional(),
    status: z.enum(['active', 'archived', 'draft']).optional(),
    limit: z.number().int().max(250).optional(),
    sinceId: z.number().int().optional(),
    fields: z.string().optional().describe('Comma-separated fields to return'),
  }),
  execute: async ({
    shopifyCredentials,
    ids,
    collectionId,
    vendor,
    productType,
    status,
    limit,
    sinceId,
    fields,
  }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, '/products.json', {
        query: {
          ids,
          collection_id: collectionId,
          vendor,
          product_type: productType,
          status,
          limit,
          since_id: sinceId,
          fields,
        },
      });
      if (!result.ok) return failedResult('Failed to list products', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error listing products');
    }
  },
});

export const shopifyGetProduct = tool({
  description: 'Get one product by ID including variants and images (GET /products/{id}.json).',
  inputSchema: z.object({
    shopifyCredentials: credField,
    productId: z.number().int().describe('Product ID'),
    fields: z.string().optional(),
  }),
  execute: async ({ shopifyCredentials, productId, fields }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, `/products/${productId}.json`, {
        query: { fields },
      });
      if (!result.ok) return failedResult('Failed to get product', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error getting product');
    }
  },
});

export const shopifyCreateProduct = tool({
  description:
    'Create a product (POST /products.json). Pass full product object (title, body_html, vendor, variants, etc.).',
  inputSchema: z.object({
    shopifyCredentials: credField,
    product: z.record(z.any()).describe('Product resource per Shopify Admin REST schema'),
  }),
  execute: async ({ shopifyCredentials, product }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, '/products.json', {
        method: 'POST',
        body: { product },
      });
      if (!result.ok) return failedResult('Failed to create product', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error creating product');
    }
  },
});

export const shopifyUpdateProduct = tool({
  description: 'Update a product by ID (PUT /products/{id}.json).',
  inputSchema: z.object({
    shopifyCredentials: credField,
    productId: z.number().int(),
    product: z.record(z.any()).describe('Partial product fields to update'),
  }),
  execute: async ({ shopifyCredentials, productId, product }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, `/products/${productId}.json`, {
        method: 'PUT',
        body: { product: { id: productId, ...product } },
      });
      if (!result.ok) return failedResult('Failed to update product', result);
      return result.data;
    } catch (error) {
      return toShopifyError(error, 'Error updating product');
    }
  },
});

export const shopifyDeleteProduct = tool({
  description: 'Permanently delete a product (DELETE /products/{id}.json).',
  inputSchema: z.object({
    shopifyCredentials: credField,
    productId: z.number().int(),
  }),
  execute: async ({ shopifyCredentials, productId }) => {
    try {
      const result = await shopifyRequest(shopifyCredentials, `/products/${productId}.json`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete product', result);
      return result.data ?? { deleted: true, productId };
    } catch (error) {
      return toShopifyError(error, 'Error deleting product');
    }
  },
});
