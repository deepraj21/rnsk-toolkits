import { tool } from 'ai';
import { z } from 'zod';
import { GetInsightsCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsGetSecurityHubInsights = tool({
  description: 'Get a list of custom insights. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    insightArns: z.array(z.string()).optional().describe('ARNs of specific insights to retrieve'),
    maxResults: z.number().optional().describe('Maximum number of insights to return (1-100)'),
    nextToken: z.string().optional().describe('Pagination token'),
  }),
  execute: async ({ awsCredentials, region, insightArns, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new GetInsightsCommand({
          InsightArns: insightArns,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get a list of custom insights', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
