import { tool } from 'ai';
import { z } from 'zod';
import { CreateGlobalTableCommand } from '@aws-sdk/client-dynamodb';
import { createDynamoDbClient } from '../client.js';

export const awsCreateGlobalTable = tool({
  description: 'Create a multi-region DynamoDB Global Table. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    globalTableName: z.string().describe('Name of the global table'),
    replicationGroup: z.array(z.record(z.any())).describe('List of regions'),
    properties: z.string().optional().describe('AWS region (e.g., us-east-1)'),
    RegionName: z.string().optional().describe('AWS region (e.g., us-east-1)'),
  }),
  execute: async ({ awsCredentials, region, globalTableName, replicationGroup, properties, RegionName }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createDynamoDbClient(awsCredentials, region);

      const command = new CreateGlobalTableCommand({
          GlobalTableName: globalTableName,
          ReplicationGroup: replicationGroup,
      });
      const response = await client.send(command);
      return response.GlobalTableDescription;
    } catch (err) {
      return { error: 'Failed to create a multi-region DynamoDB Global Table', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
