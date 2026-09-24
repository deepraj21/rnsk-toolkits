import { tool } from 'ai';
import { z } from 'zod';
import { DeleteGlobalClusterCommand } from '@aws-sdk/client-rds';
import { createRdsClient } from '../client.js';

export const awsDeleteGlobalCluster = tool({
  description: 'Delete an Aurora Global Database cluster. Use it to permanently remove the resource.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    globalClusterIdentifier: z.string().describe('Global cluster identifier to delete'),
  }),
  execute: async ({ awsCredentials, region, globalClusterIdentifier }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRdsClient(awsCredentials, region);

      const command = new DeleteGlobalClusterCommand({
          GlobalClusterIdentifier: globalClusterIdentifier,
      });
      const response = await client.send(command);
      return response.GlobalCluster;
    } catch (err) {
      return { error: 'Failed to delete an Aurora Global Database cluster', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
