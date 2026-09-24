import { tool } from 'ai';
import { z } from 'zod';
import { RestoreDBClusterToPointInTimeCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsRestoreDbClusterToPointInTime = tool({
  description: 'Clone an Aurora cluster from a point-in-time backup. Use it to restore from a backup or snapshot.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbClusterIdentifier: z.string().describe('New cluster identifier'),
    sourceDBClusterIdentifier: z.string().describe('Source cluster identifier'),
    restoreToTime: z.string().optional().describe('ISO 8601 timestamp to restore to (optional - defaults to latest)'),
    useLatestRestorableTime: z.boolean().optional().describe('Restore to latest available backup'),
  }),
  execute: async ({ awsCredentials, region, dbClusterIdentifier, sourceDBClusterIdentifier, restoreToTime, useLatestRestorableTime }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new RestoreDBClusterToPointInTimeCommand({
          DBClusterIdentifier: dbClusterIdentifier,
          SourceDBClusterIdentifier: sourceDBClusterIdentifier,
          RestoreToTime: restoreToTime ? new Date(restoreToTime) : undefined,
          UseLatestRestorableTime: useLatestRestorableTime,
      });
      const response = await client.send(command);
      return response.DBCluster;
    } catch (err) {
      return { error: 'Failed to clone an Aurora cluster from a point-in-time backup', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
