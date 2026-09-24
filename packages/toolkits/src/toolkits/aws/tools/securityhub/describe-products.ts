import { tool } from 'ai';
import { z } from 'zod';
import { DescribeProductsCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsDescribeProducts = tool({
  description: 'List available Security Hub product integrations. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of products to return (1-100)'),
    nextToken: z.string().optional().describe('Pagination token'),
    productArn: z.string().optional().describe('Filter by product ARN'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken, productArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new DescribeProductsCommand({
          MaxResults: maxResults,
          NextToken: nextToken,
          ProductArn: productArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list available Security Hub product integrations', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
