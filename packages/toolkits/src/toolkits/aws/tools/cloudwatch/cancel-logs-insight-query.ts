import { tool } from 'ai';
import { z } from 'zod';
import { StopQueryCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsClient } from '../client.js';

export const awsCancelLogsInsightQuery = tool({
  description: 'Cancels in progress CloudWatch logs insights query. Use it to stop a running query.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    queryId: z.string().describe('The query ID to cancel'),
  }),
  execute: async ({ awsCredentials, region, queryId }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchLogsClient(awsCredentials, region);

      const command = new StopQueryCommand({ queryId });
      await client.send(command);
      return {
                  success: true,
                  queryId,
                  message: 'Query cancelled successfully',
              };
    } catch (err) {
      return { error: 'Failed to cancel CloudWatch Logs insights query', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
