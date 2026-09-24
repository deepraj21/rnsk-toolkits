import { tool } from 'ai';
import { z } from 'zod';
import { GetEnabledStandardsCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsGetEnabledStandards = tool({
  description: 'Get a list of enabled security standards. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    standardsSubscriptionArns: z.array(z.string()).optional().describe('ARNs of specific standards subscriptions'),
    maxResults: z.number().optional().describe('Maximum number of standards to return (1-100)'),
    nextToken: z.string().optional().describe('Pagination token'),
  }),
  execute: async ({ awsCredentials, region, standardsSubscriptionArns, maxResults, nextToken }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new GetEnabledStandardsCommand({
          StandardsSubscriptionArns: standardsSubscriptionArns,
          MaxResults: maxResults,
          NextToken: nextToken,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get a list of enabled security standards', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
