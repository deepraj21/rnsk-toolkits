import { tool } from 'ai';
import { z } from 'zod';
import { UpdateContinuousBackupsCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsUpdateContinuousBackups = tool({
  description: 'Enable or disable Point-in-Time Recovery (PITR) for a DynamoDB table. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().describe('Name of the table'),
    pointInTimeRecoveryEnabled: z.boolean().describe('Enable or disable PITR'),
  }),
  execute: async ({ awsCredentials, region, tableName, pointInTimeRecoveryEnabled }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new UpdateContinuousBackupsCommand({
          TableName: tableName,
          PointInTimeRecoverySpecification: {
              PointInTimeRecoveryEnabled: pointInTimeRecoveryEnabled,
          },
      });
      const response = await client.send(command);
      return response.ContinuousBackupsDescription;
    } catch (err) {
      return { error: 'Failed to enable or disable Point-in-Time Recovery (PITR) for a DynamoDB table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
