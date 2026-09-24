import { tool } from 'ai';
import { z } from 'zod';
import { DeleteInsightCommand } from '@aws-sdk/client-securityhub';
import { createSecurityHubClient } from '../client.js';

export const awsDeleteInsight = tool({
  description: 'Delete a custom insight. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    insightArn: z.string().describe('ARN of the insight to delete'),
  }),
  execute: async ({ awsCredentials, region, insightArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createSecurityHubClient(awsCredentials, region);

      const command = new DeleteInsightCommand({
          InsightArn: insightArn,
      });
      const response = await client.send(command);
      return response;
    } catch (err) {
      return { error: 'Failed to delete a custom insight', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
