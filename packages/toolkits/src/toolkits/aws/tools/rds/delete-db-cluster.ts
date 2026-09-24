import { tool } from 'ai';
import { z } from 'zod';
import { DeleteDBClusterCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsDeleteDbCluster = tool({
  description: 'Delete an Aurora database cluster. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbClusterIdentifier: z.string().describe('Cluster identifier to delete'),
    skipFinalSnapshot: z.boolean().optional().describe('Skip final snapshot before deletion'),
    finalDBSnapshotIdentifier: z.string().optional().describe('Final snapshot identifier'),
  }),
  execute: async ({ awsCredentials, region, dbClusterIdentifier, skipFinalSnapshot, finalDBSnapshotIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new DeleteDBClusterCommand({
          DBClusterIdentifier: dbClusterIdentifier,
          SkipFinalSnapshot: skipFinalSnapshot,
          FinalDBSnapshotIdentifier: finalDBSnapshotIdentifier,
      });
      const response = await client.send(command);
      return response.DBCluster;
    } catch (err) {
      return { error: 'Failed to delete an Aurora database cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
