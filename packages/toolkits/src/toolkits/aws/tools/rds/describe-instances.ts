import { tool } from 'ai';
import { z } from 'zod';
import { DescribeDBInstancesCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsDescribeRdsInstances = tool({
  description: 'List all RDS database instances with details about configuration, status, and endpoints. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbInstanceIdentifier: z.string().optional().describe('Filter by specific DB instance identifier (optional)'),
    maxRecords: z.number().optional().describe('Maximum number of records to return (20-100)'),
    marker: z.string().optional().describe('Pagination marker from previous response'),
  }),
  execute: async ({ awsCredentials, region, dbInstanceIdentifier, maxRecords, marker }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new DescribeDBInstancesCommand({
          DBInstanceIdentifier: dbInstanceIdentifier,
          MaxRecords: maxRecords,
          Marker: marker,
      });
      const response = await client.send(command);
      return response.DBInstances;
    } catch (err) {
      return { error: 'Failed to list all RDS database instances with details about configuration, status, and endpoints', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
