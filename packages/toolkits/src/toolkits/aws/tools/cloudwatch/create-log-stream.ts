import { tool } from 'ai';
import { z } from 'zod';
import { CreateLogStreamCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsClient } from '../client.js';

export const awsCreateLogStream = tool({
  description: 'Create a new log stream in a log group. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    logGroupName: z.string().describe('The name of the log group'),
    logStreamName: z.string().describe('The name of the log stream'),
  }),
  execute: async ({ awsCredentials, region, logGroupName, logStreamName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchLogsClient(awsCredentials, region);

      const command = new CreateLogStreamCommand({
          logGroupName: logGroupName,
          logStreamName: logStreamName,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Log stream ${logStreamName} created successfully in log group ${logGroupName}`,
              };
    } catch (err) {
      return { error: 'Failed to create a new log stream in a log group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
