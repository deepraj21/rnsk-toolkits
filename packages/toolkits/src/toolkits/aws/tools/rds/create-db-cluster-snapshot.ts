import { tool } from 'ai';
import { z } from 'zod';
import { CreateDBClusterSnapshotCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsCreateDbClusterSnapshot = tool({
  description: 'Create a manual snapshot of an Aurora cluster. Use it to provision a new resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbClusterSnapshotIdentifier: z.string().describe('Snapshot identifier'),
    dbClusterIdentifier: z.string().describe('Cluster identifier to snapshot'),
    tags: z.array(z.record(z.any())).optional().describe('Tags for the snapshot'),
    properties: z.string().optional().describe('properties'),
    Key: z.string().optional().describe('Key'),
    Value: z.string().optional().describe('Value'),
  }),
  execute: async ({ awsCredentials, region, dbClusterSnapshotIdentifier, dbClusterIdentifier, tags, properties, Key, Value }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new CreateDBClusterSnapshotCommand({
          DBClusterSnapshotIdentifier: dbClusterSnapshotIdentifier,
          DBClusterIdentifier: dbClusterIdentifier,
          Tags: tags,
      });
      const response = await client.send(command);
      return response.DBClusterSnapshot;
    } catch (err) {
      return { error: 'Failed to create a manual snapshot of an Aurora cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
