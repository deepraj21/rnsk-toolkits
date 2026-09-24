import { tool } from 'ai';
import { z } from 'zod';
import { StopDBInstanceCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsStopDbInstance = tool({
  description: 'Stop a running RDS database instance (max 7 days). Use it to stop a running resource (billable config may remain).',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbInstanceIdentifier: z.string().describe('DB instance identifier to stop'),
    dbSnapshotIdentifier: z.string().optional().describe('Snapshot identifier to create before stopping (optional)'),
  }),
  execute: async ({ awsCredentials, region, dbInstanceIdentifier, dbSnapshotIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new StopDBInstanceCommand({
          DBInstanceIdentifier: dbInstanceIdentifier,
          DBSnapshotIdentifier: dbSnapshotIdentifier,
      });
      const response = await client.send(command);
      return response.DBInstance;
    } catch (err) {
      return { error: 'Failed to stop a running RDS database instance (max 7 days)', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
