// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wizGraphql, failedResult, toWizError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

const CLOUD_RESOURCES_QUERY = `query CloudResourcesTable($first: Int, $after: String, $filterBy: CloudResourceFilters) {
  cloudResources(filterBy: $filterBy, first: $first, after: $after) {
    nodes {
      id
      name
      type
      cloudPlatform
      subscriptionExternalId
      region
      nativeType
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

const CLOUD_ACCOUNTS_QUERY = `query CloudAccounts($first: Int, $after: String) {
  cloudAccounts(first: $first, after: $after) {
    nodes {
      id
      name
      externalId
      cloudProvider
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

export const wizListCloudResources = tool({
  description: 'List cloud resources inventoried by Wiz with optional filters and pagination.',
  inputSchema: z.object({
    wizCredentials: credField,
    first: z.number().int().min(1).max(500).optional(),
    after: z.string().optional(),
    search: z.string().optional().describe('Search term for resource name or ID'),
    type: z.array(z.string()).optional().describe('Filter by resource types'),
    cloudPlatform: z.array(z.string()).optional().describe('Filter cloud platforms'),
  }),
  execute: async ({ wizCredentials, first, after, search, type, cloudPlatform }) => {
    try {
      const filterBy: Record<string, unknown> = {};
      if (search) filterBy.search = search;
      if (type?.length) filterBy.type = type;
      if (cloudPlatform?.length) filterBy.cloudPlatform = cloudPlatform;
      const result = await wizGraphql(wizCredentials, CLOUD_RESOURCES_QUERY, {
        first: first ?? 50,
        after,
        filterBy: Object.keys(filterBy).length ? filterBy : undefined,
      });
      if (!result.ok) return failedResult('Failed to list cloud resources', result);
      return result.data;
    } catch (error) {
      return toWizError(error, 'Error listing cloud resources');
    }
  },
});

export const wizListCloudAccounts = tool({
  description: 'List cloud accounts connected to Wiz.',
  inputSchema: z.object({
    wizCredentials: credField,
    first: z.number().int().min(1).max(500).optional(),
    after: z.string().optional(),
  }),
  execute: async ({ wizCredentials, first, after }) => {
    try {
      const result = await wizGraphql(wizCredentials, CLOUD_ACCOUNTS_QUERY, {
        first: first ?? 50,
        after,
      });
      if (!result.ok) return failedResult('Failed to list cloud accounts', result);
      return result.data;
    } catch (error) {
      return toWizError(error, 'Error listing cloud accounts');
    }
  },
});
