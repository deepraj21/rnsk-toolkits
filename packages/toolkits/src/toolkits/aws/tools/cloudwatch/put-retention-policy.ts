import { tool } from 'ai';
import { z } from 'zod';
import { PutRetentionPolicyCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsClient } from '../client.js';

export const awsPutRetentionPolicy = tool({
  description: 'Set retention policy for a log group. Use it to publish data or configure the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    logGroupName: z.string().describe('The name of the log group'),
    retentionInDays: z.number().describe('Number of days to retain logs'),
  }),
  execute: async ({ awsCredentials, region, logGroupName, retentionInDays }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchLogsClient(awsCredentials, region);

      const command = new PutRetentionPolicyCommand({
          logGroupName,
          retentionInDays,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Retention policy set to ${retentionInDays} days for log group ${logGroupName}`,
              };
    } catch (err) {
      return { error: 'Failed to set retention policy for a log group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
