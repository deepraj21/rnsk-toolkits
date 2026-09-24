import { tool } from 'ai';
import { z } from 'zod';
import { UpdateTableCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsUpdateDynamodbTable = tool({
  description: 'Modify DynamoDB table settings (capacity, TTL, streams, PITR).. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    tableName: z.string().describe('Name of the table to update'),
    billingMode: z.string().optional().describe('PROVISIONED or PAY_PER_REQUEST'),
    provisionedThroughput: z.record(z.any()).optional().describe('Throughput settings for PROVISIONED mode'),
    properties: z.boolean().optional().describe('NEW_IMAGE, OLD_IMAGE, NEW_AND_OLD_IMAGES, KEYS_ONLY'),
    ReadCapacityUnits: z.number().optional().describe('ReadCapacityUnits'),
    WriteCapacityUnits: z.number().optional().describe('WriteCapacityUnits'),
    streamSpecification: z.record(z.any()).optional().describe('DynamoDB Streams configuration'),
    StreamEnabled: z.boolean().optional().describe('StreamEnabled'),
    StreamViewType: z.string().optional().describe('NEW_IMAGE, OLD_IMAGE, NEW_AND_OLD_IMAGES, KEYS_ONLY'),
  }),
  execute: async ({ awsCredentials, region, tableName, billingMode, provisionedThroughput, properties, ReadCapacityUnits, WriteCapacityUnits, streamSpecification, StreamEnabled, StreamViewType }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new UpdateTableCommand({
          TableName: tableName,
          BillingMode: billingMode,
          ProvisionedThroughput: provisionedThroughput,
          StreamSpecification: streamSpecification,
      } as any);
      const response = await client.send(command);
      return response.TableDescription;
    } catch (err) {
      return { error: 'Failed to modify DynamoDB table settings (capacity, TTL, streams, PITR)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
