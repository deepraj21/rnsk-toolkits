import { tool } from 'ai';
import { z } from 'zod';
import { CreateLogGroupCommand } from '@aws-sdk/client-cloudwatch-logs';
import { createCloudWatchLogsClient } from '../client.js';

export const awsCreateLogGroup = tool({
  description: 'Create a new CloudWatch log group. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    logGroupName: z.string().describe('The name of the log group'),
    kmsKeyId: z.string().optional().describe('KMS key ID for encryption (optional)'),
    tags: z.record(z.any()).optional().describe('Tags as key-value pairs (optional)'),
  }),
  execute: async ({ awsCredentials, region, logGroupName, kmsKeyId, tags }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createCloudWatchLogsClient(awsCredentials, region);

      const command = new CreateLogGroupCommand({
          logGroupName: logGroupName,
          kmsKeyId: kmsKeyId,
          tags: tags,
      });
      await client.send(command);
      return {
                  success: true,
                  message: `Log group ${logGroupName} created successfully`,
              };
    } catch (err) {
      return { error: 'Failed to create a new CloudWatch log group', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
