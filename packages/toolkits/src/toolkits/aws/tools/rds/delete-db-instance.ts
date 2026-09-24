import { tool } from 'ai';
import { z } from 'zod';
import { DeleteDBInstanceCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsDeleteDbInstance = tool({
  description: 'Delete an RDS database instance. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbInstanceIdentifier: z.string().describe('DB instance identifier to delete'),
    skipFinalSnapshot: z.boolean().optional().describe('Skip final snapshot before deletion'),
    finalDBSnapshotIdentifier: z.string().optional().describe('Final snapshot identifier (required if skipFinalSnapshot is false)'),
  }),
  execute: async ({ awsCredentials, region, dbInstanceIdentifier, skipFinalSnapshot, finalDBSnapshotIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new DeleteDBInstanceCommand({
          DBInstanceIdentifier: dbInstanceIdentifier,
          SkipFinalSnapshot: skipFinalSnapshot,
          FinalDBSnapshotIdentifier: finalDBSnapshotIdentifier,
      });
      const response = await client.send(command);
      return response.DBInstance;
    } catch (err) {
      return { error: 'Failed to delete an RDS database instance', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
