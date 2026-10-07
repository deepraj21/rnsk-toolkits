// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { makeRequest, failedResult, toMakeError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Make credentials JSON with baseUrl (zone URL, e.g. https://eu1.make.com) and apiToken',
  );

export const makeGetCashierPrice = tool({
  description:
    'Retrieve a Make cashier price by ID: value, currency, billing period, and limits (operations, data store, transfers).',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    priceId: z.number().int().describe('Price record identifier'),
  }),
  execute: async ({ makeCredentials, priceId }) => {
    try {
      const result = await makeRequest(makeCredentials, `/cashier/prices/${priceId}`);
      if (!result.ok) return failedResult('Failed to get cashier price', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting cashier price');
    }
  },
});

export const makeGetCashierProducts = tool({
  description:
    'Retrieve available Make cashier products (subscription plans, add-ons) with optional filters for an organization or price.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    type: z
      .enum(['PLAN', 'EXTRA'])
      .optional()
      .describe('Filter by product type: subscription plan or extra'),
    organizationId: z
      .number()
      .int()
      .optional()
      .describe('Return products available for this organization'),
    relatedPriceId: z.number().int().optional().describe('Return products linked to this price ID'),
    includeInvisible: z
      .boolean()
      .optional()
      .describe('Include products not normally visible to users'),
  }),
  execute: async ({ makeCredentials, type, organizationId, relatedPriceId, includeInvisible }) => {
    try {
      const result = await makeRequest(makeCredentials, '/cashier/products', {
        query: { type, organizationId, relatedPriceId, includeInvisible },
      });
      if (!result.ok) return failedResult('Failed to get cashier products', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting cashier products');
    }
  },
});

export const makeListPublicTemplates = tool({
  description:
    'List public approved Make templates with optional name, app, and language filters. Use to discover reusable automation blueprints.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    name: z.string().optional().describe('Substring filter on template name'),
    usedApps: z.array(z.string()).optional().describe('Only templates using these apps'),
    includeEnglish: z
      .boolean()
      .optional()
      .describe('Include English templates alongside other locales'),
    columns: z.array(z.string()).optional().describe('Template fields to include'),
    sortBy: z.string().optional().describe('Field to sort by'),
    sortDirection: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    limit: z.number().int().min(1).optional().describe('Maximum records to return'),
    offset: z.number().int().min(0).optional().describe('Records to skip'),
  }),
  execute: async ({
    makeCredentials,
    name,
    usedApps,
    includeEnglish,
    columns,
    sortBy,
    sortDirection,
    limit,
    offset,
  }) => {
    try {
      const result = await makeRequest(makeCredentials, '/templates/public', {
        query: {
          name,
          'usedApps[]': usedApps,
          includeEn: includeEnglish,
          'cols[]': columns,
          'pg[sortBy]': sortBy,
          'pg[sortDir]': sortDirection,
          'pg[limit]': limit,
          'pg[offset]': offset,
        },
      });
      if (!result.ok) return failedResult('Failed to list public templates', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error listing public templates');
    }
  },
});

export const makeGetPublicTemplateBlueprint = tool({
  description:
    'Retrieve the complete blueprint for a public approved Make template. Use to inspect or clone a reusable automation.',
  inputSchema: z.object({
    makeCredentials: credentialsField,
    templateUrl: z
      .string()
      .describe('Public template URL slug with its ID and name, from List Public Templates'),
    templatePublicId: z
      .number()
      .int()
      .optional()
      .describe('Published template version ID when a specific version is needed'),
  }),
  execute: async ({ makeCredentials, templateUrl, templatePublicId }) => {
    try {
      const result = await makeRequest(
        makeCredentials,
        `/templates/public/${templateUrl}/blueprint`,
        { query: { templatePublicId } },
      );
      if (!result.ok) return failedResult('Failed to get public template blueprint', result);
      return result.data;
    } catch (error) {
      return toMakeError(error, 'Error getting public template blueprint');
    }
  },
});
