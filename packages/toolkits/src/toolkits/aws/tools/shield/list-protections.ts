import { tool } from 'ai';
import { z } from 'zod';
import { ListProtectionsCommand } from '@aws-sdk/client-shield';
import { createShieldClient } from '../client.js';

export const awsListProtections = tool({
  description: 'List all protected resources. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    maxResults: z.number().optional().describe('Maximum number of protections to return (1-10000)'),
    nextToken: z.string().optional().describe('Pagination token from previous response'),
    inclusionFilters: z.enum(['CLOUDFRONT_DISTRIBUTION', 'ROUTE_53_HOSTED_ZONE', 'ELASTIC_IP_ALLOCATION', 'CLASSIC_LOAD_BALANCER', 'APPLICATION_LOAD_BALANCER', 'GLOBAL_ACCELERATOR']).optional().describe('Filter protections by resource ARN or type'),
  }),
  execute: async ({ awsCredentials, region, maxResults, nextToken, inclusionFilters }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createShieldClient(awsCredentials, region);

      const command = new ListProtectionsCommand({
          MaxResults: maxResults,
          NextToken: nextToken,
          InclusionFilters: inclusionFilters,
      } as any);
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to list all protected resources', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
