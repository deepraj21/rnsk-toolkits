import { tool } from 'ai';
import { z } from 'zod';
import { DescribeDBClustersCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsDescribeDbClusters = tool({
  description: 'List all Aurora database clusters. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbClusterIdentifier: z.string().optional().describe('Filter by specific cluster identifier'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, dbClusterIdentifier, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new DescribeDBClustersCommand({
          DBClusterIdentifier: dbClusterIdentifier,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return response.DBClusters;
    } catch (err) {
      return { error: 'Failed to list all Aurora database clusters', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
