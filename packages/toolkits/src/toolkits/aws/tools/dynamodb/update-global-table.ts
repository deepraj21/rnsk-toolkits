import { tool } from 'ai';
import { z } from 'zod';
import { UpdateGlobalTableCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsUpdateGlobalTable = tool({
  description: 'Add or remove regions from a DynamoDB Global Table. Use it to change an existing resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    globalTableName: z.string().describe('Name of the global table'),
    replicaUpdates: z.array(z.record(z.any())).describe('Regions to add or remove'),
    properties: z.string().optional().describe('properties'),
    Create: z.record(z.any()).optional().describe('Create'),
    RegionName: z.string().optional().describe('RegionName'),
    Delete: z.record(z.any()).optional().describe('Delete'),
  }),
  execute: async ({ awsCredentials, region, globalTableName, replicaUpdates, properties, Create, RegionName, Delete }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new UpdateGlobalTableCommand({
          GlobalTableName: globalTableName,
          ReplicaUpdates: replicaUpdates,
      });
      const response = await client.send(command);
      return response.GlobalTableDescription;
    } catch (err) {
      return { error: 'Failed to add or remove regions from a DynamoDB Global Table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
