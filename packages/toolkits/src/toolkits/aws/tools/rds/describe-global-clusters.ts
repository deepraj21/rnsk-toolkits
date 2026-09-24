import { tool } from 'ai';
import { z } from 'zod';
import { DescribeGlobalClustersCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsDescribeGlobalClusters = tool({
  description: 'List all Aurora Global Database clusters. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    globalClusterIdentifier: z.string().optional().describe('Filter by specific global cluster'),
    maxRecords: z.number().optional().describe('Maximum number of records to return'),
  }),
  execute: async ({ awsCredentials, region, globalClusterIdentifier, maxRecords }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new DescribeGlobalClustersCommand({
          GlobalClusterIdentifier: globalClusterIdentifier,
          MaxRecords: maxRecords,
      });
      const response = await client.send(command);
      return response.GlobalClusters;
    } catch (err) {
      return { error: 'Failed to list all Aurora Global Database clusters', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
