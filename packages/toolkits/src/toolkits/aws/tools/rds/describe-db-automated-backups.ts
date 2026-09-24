import { tool } from 'ai';
import { z } from 'zod';
import { DescribeDBInstanceAutomatedBackupsCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsDescribeDbAutomatedBackups = tool({
  description: 'List automated backups for RDS instances. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbInstanceIdentifier: z.string().optional().describe('Filter by DB instance identifier'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, dbInstanceIdentifier, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new DescribeDBInstanceAutomatedBackupsCommand({
          DBInstanceIdentifier: dbInstanceIdentifier,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return response.DBInstanceAutomatedBackups;
    } catch (err) {
      return { error: 'Failed to list automated backups for RDS instances', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
