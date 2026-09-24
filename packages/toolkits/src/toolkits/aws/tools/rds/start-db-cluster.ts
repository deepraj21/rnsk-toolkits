import { tool } from 'ai';
import { z } from 'zod';
import { StartDBClusterCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsStartDbCluster = tool({
  description: 'Start a stopped Aurora cluster. Use it to start a stopped resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    dbClusterIdentifier: z.string().describe('Cluster identifier to start'),
  }),
  execute: async ({ awsCredentials, region, dbClusterIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new StartDBClusterCommand({
          DBClusterIdentifier: dbClusterIdentifier,
      });
      const response = await client.send(command);
      return response.DBCluster;
    } catch (err) {
      return { error: 'Failed to start a stopped Aurora cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
