import { tool } from 'ai';
import { z } from 'zod';
import { DescribePackagesCommand } from '@aws-sdk/client-opensearch';
import { createOpenSearchClient } from '../client.js';

export const awsDescribePackages = tool({
  description: 'List custom packages (plugins and dictionaries) for OpenSearch. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    filters: z.array(z.record(z.any())).optional().describe('Filters for package search'),
    maxResults: z.number().optional().describe('Maximum number of packages to return'),
  }),
  execute: async ({ awsCredentials, region, filters, maxResults }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createOpenSearchClient(awsCredentials, region);

      const command = new DescribePackagesCommand({
          Filters: filters,
          MaxResults: maxResults,
      });
      const response = await client.send(command);
      return response.PackageDetailsList;
    } catch (err) {
      return { error: 'Failed to list custom packages (plugins and dictionaries) for OpenSearch', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
