import { tool } from 'ai';
import { z } from 'zod';
import { DescribeDBSnapshotsCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsDescribeDbSnapshots = tool({
  description: 'List all RDS database snapshots. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbInstanceIdentifier: z.string().optional().describe('Filter by DB instance identifier'),
    dbSnapshotIdentifier: z.string().optional().describe('Filter by specific snapshot identifier'),
    snapshotType: z.string().optional().describe('Filter by snapshot type (automated, manual, shared, public)'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, dbInstanceIdentifier, dbSnapshotIdentifier, snapshotType, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new DescribeDBSnapshotsCommand({
          DBInstanceIdentifier: dbInstanceIdentifier,
          DBSnapshotIdentifier: dbSnapshotIdentifier,
          SnapshotType: snapshotType,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return response.DBSnapshots;
    } catch (err) {
      return { error: 'Failed to list all RDS database snapshots', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
