import { tool } from 'ai';
import { z } from 'zod';
import { DeleteLogGroupCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsClient } from '../client.js';

export const awsDeleteLogGroup = tool({
  description: 'Delete a CloudWatch log group. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    logGroupName: z.string().describe('The name of the log group to delete'),
  }),
  execute: async ({ awsCredentials, region, logGroupName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchLogsClient(awsCredentials, region);

      const command = new DeleteLogGroupCommand({
          logGroupName,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Log group ${logGroupName} deleted successfully`,
              };
    } catch (err) {
      return { error: 'Failed to delete a CloudWatch log group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
