import { tool } from 'ai';
import { z } from 'zod';
import { RestoreDBInstanceFromDBSnapshotCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsRestoreDbInstanceFromDbSnapshot = tool({
  description: 'Restore an RDS instance from a snapshot. Use it to restore from a backup or snapshot.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbInstanceIdentifier: z.string().describe('New DB instance identifier'),
    dbSnapshotIdentifier: z.string().describe('Snapshot identifier to restore from'),
    dbInstanceClass: z.string().optional().describe('Instance type for restored DB'),
    publiclyAccessible: z.boolean().optional().describe('Whether restored instance is publicly accessible'),
  }),
  execute: async ({ awsCredentials, region, dbInstanceIdentifier, dbSnapshotIdentifier, dbInstanceClass, publiclyAccessible }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new RestoreDBInstanceFromDBSnapshotCommand({
          DBInstanceIdentifier: dbInstanceIdentifier,
          DBSnapshotIdentifier: dbSnapshotIdentifier,
          DBInstanceClass: dbInstanceClass,
          PubliclyAccessible: publiclyAccessible,
      });
      const response = await client.send(command);
      return response.DBInstance;
    } catch (err) {
      return { error: 'Failed to restore an RDS instance from a snapshot', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
