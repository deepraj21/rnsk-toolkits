import { tool } from 'ai';
import { z } from 'zod';
import { RemoveFromGlobalClusterCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsRemoveFromGlobalCluster = tool({
  description: 'Remove a secondary cluster from an Aurora Global Database. Use it to remove access or configuration.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    globalClusterIdentifier: z.string().describe('Global cluster identifier'),
    dbClusterIdentifier: z.string().describe('Secondary cluster to remove'),
  }),
  execute: async ({ awsCredentials, region, globalClusterIdentifier, dbClusterIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new RemoveFromGlobalClusterCommand({
          GlobalClusterIdentifier: globalClusterIdentifier,
          DbClusterIdentifier: dbClusterIdentifier,
      });
      const response = await client.send(command);
      return response.GlobalCluster;
    } catch (err) {
      return { error: 'Failed to remove a secondary cluster from an Aurora Global Database', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
