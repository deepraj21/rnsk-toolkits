import { tool } from 'ai';
import { z } from 'zod';
import { DescribeBackupCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsDescribeDynamodbBackup = tool({
  description: 'Get details about a specific DynamoDB backup. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    backupArn: z.string().describe('ARN of the backup'),
  }),
  execute: async ({ awsCredentials, region, backupArn }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new DescribeBackupCommand({
          BackupArn: backupArn,
      });
      const response = await client.send(command);
      return response.BackupDescription;
    } catch (err) {
      return { error: 'Failed to get details about a specific DynamoDB backup', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
