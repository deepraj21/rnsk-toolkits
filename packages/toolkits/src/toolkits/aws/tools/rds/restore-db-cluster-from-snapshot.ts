import { tool } from 'ai';
import { z } from 'zod';
import { RestoreDBClusterFromSnapshotCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsRestoreDbClusterFromSnapshot = tool({
  description: 'Restore an Aurora cluster from a snapshot. Use it to restore from a backup or snapshot.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbClusterIdentifier: z.string().describe('New cluster identifier'),
    snapshotIdentifier: z.string().describe('Snapshot identifier to restore from'),
    engine: z.string().describe('Database engine'),
  }),
  execute: async ({ awsCredentials, region, dbClusterIdentifier, snapshotIdentifier, engine }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new RestoreDBClusterFromSnapshotCommand({
          DBClusterIdentifier: dbClusterIdentifier,
          SnapshotIdentifier: snapshotIdentifier,
          Engine: engine,
      });
      const response = await client.send(command);
      return response.DBCluster;
    } catch (err) {
      return { error: 'Failed to restore an Aurora cluster from a snapshot', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
