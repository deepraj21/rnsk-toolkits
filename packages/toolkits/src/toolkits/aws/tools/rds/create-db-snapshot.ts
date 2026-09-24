import { tool } from 'ai';
import { z } from 'zod';
import { CreateDBSnapshotCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsCreateDbSnapshot = tool({
  description: 'Create a manual backup snapshot of an RDS instance. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbSnapshotIdentifier: z.string().describe('Snapshot identifier'),
    dbInstanceIdentifier: z.string().describe('DB instance identifier to snapshot'),
    tags: z.array(z.record(z.any())).optional().describe('Tags for the snapshot'),
    properties: z.string().optional().describe('properties'),
    Key: z.string().optional().describe('Key'),
    Value: z.string().optional().describe('Value'),
  }),
  execute: async ({ awsCredentials, region, dbSnapshotIdentifier, dbInstanceIdentifier, tags, properties, Key, Value }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new CreateDBSnapshotCommand({
          DBSnapshotIdentifier: dbSnapshotIdentifier,
          DBInstanceIdentifier: dbInstanceIdentifier,
          Tags: tags,
      });
      const response = await client.send(command);
      return response.DBSnapshot;
    } catch (err) {
      return { error: 'Failed to create a manual backup snapshot of an RDS instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
