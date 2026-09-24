import { tool } from 'ai';
import { z } from 'zod';
import { GetInsightResultsCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsGetInsightResults = tool({
  description: 'Get the results for a specific insight. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    insightArn: z.string().describe('ARN of the insight'),
  }),
  execute: async ({ awsCredentials, region, insightArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new GetInsightResultsCommand({
          InsightArn: insightArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to get the results for a specific insight', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
