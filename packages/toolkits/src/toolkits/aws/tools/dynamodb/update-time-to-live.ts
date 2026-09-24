import { tool } from 'ai';
import { z } from 'zod';
import { UpdateTimeToLiveCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsUpdateTimeToLive = tool({
  description: 'Enable or disable Time To Live (TTL) for a DynamoDB table. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().describe('Name of the table'),
    timeToLiveSpecification: z.record(z.any()).describe('TTL configuration'),
    properties: z.boolean().optional().describe('Enable or disable TTL'),
    Enabled: z.boolean().optional().describe('Enable or disable TTL'),
    AttributeName: z.string().optional().describe('Attribute name containing expiration timestamp'),
  }),
  execute: async ({ awsCredentials, region, tableName, timeToLiveSpecification, properties, Enabled, AttributeName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new UpdateTimeToLiveCommand({
          TableName: tableName,
          TimeToLiveSpecification: timeToLiveSpecification as any,
      });
      const response = await client.send(command);
      return response.TimeToLiveSpecification;
    } catch (err) {
      return { error: 'Failed to enable or disable Time To Live (TTL) for a DynamoDB table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
